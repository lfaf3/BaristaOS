import type { FastifyInstance } from "fastify";

const DASHBOARD_TIMEZONE = "America/Sao_Paulo";
const DAILY_GOAL = 2000;

function dateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DASHBOARD_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function dayRange(date = new Date()) {
  const value = dateKey(date);
  return {
    key: value,
    start: new Date(`${value}T00:00:00.000-03:00`),
    end: new Date(`${value}T23:59:59.999-03:00`)
  };
}

function previousDayRange() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return dayRange(date);
}

function percentageChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function minutesBetween(start: Date, end = new Date()) {
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
}

function lastSevenDaysRange() {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return dayRange(date);
  });
  const firstDay = days[0] ?? dayRange();
  const lastDay = days[days.length - 1] ?? firstDay;
  return { days, start: firstDay.start, end: lastDay.end };
}

export async function getDashboardSummary(app: FastifyInstance, storeId: string) {
  const today = dayRange();
  const yesterday = previousDayRange();
  const sevenDays = lastSevenDaysRange();
  const now = new Date();

  const [todayOrders, yesterdayAggregate, tables, sevenDayOrders, openOrders, recentPaidOrders, recentItems] =
    await app.prisma.$transaction([
      app.prisma.order.findMany({
        where: { storeId, status: "PAID", closedAt: { gte: today.start, lte: today.end } },
        select: {
          id: true,
          total: true,
          openedAt: true,
          closedAt: true,
          table: { select: { id: true, number: true } },
          items: {
            select: {
              quantity: true,
              totalPrice: true,
              product: { select: { id: true, name: true } }
            }
          },
          payments: {
            where: { status: "APPROVED" },
            select: { method: true, amount: true }
          }
        }
      }),
      app.prisma.order.aggregate({
        where: { storeId, status: "PAID", closedAt: { gte: yesterday.start, lte: yesterday.end } },
        _count: { id: true },
        _sum: { total: true }
      }),
      app.prisma.cafeTable.findMany({
        where: { storeId, active: true },
        select: { id: true, number: true, status: true, openedAt: true }
      }),
      app.prisma.order.findMany({
        where: { storeId, status: "PAID", closedAt: { gte: sevenDays.start, lte: sevenDays.end } },
        select: { total: true, closedAt: true }
      }),
      app.prisma.order.findMany({
        where: { storeId, status: "OPEN" },
        select: {
          id: true,
          openedAt: true,
          attendanceLabel: true,
          table: { select: { number: true, status: true } },
          items: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } }
        }
      }),
      app.prisma.order.findMany({
        where: { storeId, status: "PAID", closedAt: { not: null } },
        orderBy: { closedAt: "desc" },
        take: 6,
        select: { id: true, closedAt: true, total: true, attendanceLabel: true, table: { select: { number: true } } }
      }),
      app.prisma.orderItem.findMany({
        where: { order: { storeId } },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          createdAt: true,
          quantity: true,
          product: { select: { name: true } },
          order: { select: { id: true, attendanceLabel: true, table: { select: { number: true } } } }
        }
      })
    ]);

  const revenue = todayOrders.reduce((sum, order) => sum + Number(order.total), 0);
  const orderCount = todayOrders.length;
  const averageTicket = orderCount > 0 ? revenue / orderCount : 0;
  const averageServiceMinutes = orderCount > 0
    ? todayOrders.reduce((sum, order) => sum + (order.closedAt ? minutesBetween(order.openedAt, order.closedAt) : 0), 0) / orderCount
    : 0;
  const yesterdayRevenue = Number(yesterdayAggregate._sum.total ?? 0);
  const yesterdayOrderCount = yesterdayAggregate._count.id;

  const products = new Map<string, { id: string; name: string; quantity: number; revenue: number }>();
  const paymentMethods = new Map<string, { method: string; amount: number; transactions: number }>();
  const tableUsage = new Map<number, number>();

  for (const order of todayOrders) {
    if (order.table) tableUsage.set(order.table.number, (tableUsage.get(order.table.number) ?? 0) + 1);
    for (const item of order.items) {
      const current = products.get(item.product.id) ?? { id: item.product.id, name: item.product.name, quantity: 0, revenue: 0 };
      current.quantity += item.quantity;
      current.revenue += Number(item.totalPrice);
      products.set(item.product.id, current);
    }
    for (const payment of order.payments) {
      const current = paymentMethods.get(payment.method) ?? { method: payment.method, amount: 0, transactions: 0 };
      current.amount += Number(payment.amount);
      current.transactions += 1;
      paymentMethods.set(payment.method, current);
    }
  }

  const topProducts = [...products.values()]
    .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
    .slice(0, 10)
    .map(product => ({ ...product, revenue: Number(product.revenue.toFixed(2)) }));
  const topProduct = topProducts[0] ?? null;
  const mainPaymentMethod = [...paymentMethods.values()].sort((a, b) => b.amount - a.amount)[0] ?? null;
  const mostUsedTable = [...tableUsage.entries()].map(([number, orders]) => ({ number, orders })).sort((a, b) => b.orders - a.orders)[0] ?? null;

  const tableStatus = tables.reduce((summary, table) => {
    summary.total += 1;
    if (table.status === "FREE") summary.free += 1;
    else if (table.status === "BLOCKED") summary.blocked += 1;
    else if (table.status === "PAYMENT" || table.status === "READY_TO_CLOSE") summary.awaitingPayment += 1;
    else summary.inService += 1;
    return summary;
  }, { total: 0, free: 0, inService: 0, awaitingPayment: 0, blocked: 0 });

  const trendMap = new Map(sevenDays.days.map(day => [day.key, 0]));
  for (const order of sevenDayOrders) {
    if (!order.closedAt) continue;
    const key = dateKey(order.closedAt);
    trendMap.set(key, (trendMap.get(key) ?? 0) + Number(order.total));
  }
  const salesTrend = sevenDays.days.map(day => ({
    date: day.key,
    label: new Intl.DateTimeFormat("pt-BR", { weekday: "short", timeZone: DASHBOARD_TIMEZONE }).format(day.start).replace(".", ""),
    revenue: Number((trendMap.get(day.key) ?? 0).toFixed(2))
  }));

  const alerts = [
    ...tables
      .filter(table => table.openedAt && table.status !== "FREE" && table.status !== "BLOCKED" && minutesBetween(table.openedAt, now) >= 45)
      .map(table => ({
        id: `table-${table.id}`,
        type: "TABLE" as const,
        title: `Mesa ${table.number}`,
        message: `Aberta há ${minutesBetween(table.openedAt!, now)} minutos`,
        severity: minutesBetween(table.openedAt!, now) >= 90 ? "HIGH" as const : "MEDIUM" as const
      })),
    ...openOrders
      .filter(order => minutesBetween(order.items[0]?.createdAt ?? order.openedAt, now) >= 20)
      .map(order => ({
        id: `order-${order.id}`,
        type: "ORDER" as const,
        title: order.attendanceLabel || (order.table ? `Mesa ${order.table.number}` : `Pedido ${order.id.slice(0, 6)}`),
        message: `${minutesBetween(order.items[0]?.createdAt ?? order.openedAt, now)} minutos sem movimentação`,
        severity: minutesBetween(order.items[0]?.createdAt ?? order.openedAt, now) >= 45 ? "HIGH" as const : "MEDIUM" as const
      }))
  ].sort((a, b) => (a.severity === "HIGH" ? -1 : 1) - (b.severity === "HIGH" ? -1 : 1)).slice(0, 8);

  const activities = [
    ...recentPaidOrders.filter(order => order.closedAt).map(order => ({
      id: `paid-${order.id}`,
      type: "PAYMENT" as const,
      title: `${order.attendanceLabel || (order.table ? `Mesa ${order.table.number}` : "Venda avulsa")} paga`,
      description: `Total de R$ ${Number(order.total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      occurredAt: order.closedAt!.toISOString()
    })),
    ...recentItems.map(item => ({
      id: `item-${item.id}`,
      type: "ITEM" as const,
      title: `${item.quantity}x ${item.product.name}`,
      description: `Adicionado em ${item.order.attendanceLabel || (item.order.table ? `Mesa ${item.order.table.number}` : "venda avulsa")}`,
      occurredAt: item.createdAt.toISOString()
    }))
  ].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()).slice(0, 8);

  return {
    generatedAt: now.toISOString(),
    period: { start: today.start.toISOString(), end: today.end.toISOString() },
    sales: {
      revenue: Number(revenue.toFixed(2)), orderCount, averageTicket: Number(averageTicket.toFixed(2)),
      revenueChangePercentage: percentageChange(revenue, yesterdayRevenue),
      orderCountChangePercentage: percentageChange(orderCount, yesterdayOrderCount)
    },
    operation: {
      openOrders: openOrders.length,
      paidOrders: orderCount,
      averageServiceMinutes: Number(averageServiceMinutes.toFixed(0))
    },
    goal: {
      target: DAILY_GOAL,
      achieved: Number(revenue.toFixed(2)),
      percentage: Number(Math.min(100, (revenue / DAILY_GOAL) * 100).toFixed(1))
    },
    highlights: {
      topProduct,
      mainPaymentMethod: mainPaymentMethod ? { ...mainPaymentMethod, amount: Number(mainPaymentMethod.amount.toFixed(2)) } : null,
      mostUsedTable
    },
    tables: tableStatus,
    salesTrend,
    topProducts,
    alerts,
    activities
  };
}
