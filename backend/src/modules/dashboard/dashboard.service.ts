import type { FastifyInstance } from "fastify";

function dayRange(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const value = formatter.format(date);
  return {
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

export async function getDashboardSummary(app: FastifyInstance, storeId: string) {
  const today = dayRange();
  const yesterday = previousDayRange();

  const [todayOrders, yesterdayAggregate, tables] = await app.prisma.$transaction([
    app.prisma.order.findMany({
      where: {
        storeId,
        status: "PAID",
        closedAt: { gte: today.start, lte: today.end }
      },
      select: {
        id: true,
        total: true,
        table: { select: { id: true, number: true } },
        items: {
          select: {
            quantity: true,
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
      where: {
        storeId,
        status: "PAID",
        closedAt: { gte: yesterday.start, lte: yesterday.end }
      },
      _count: { id: true },
      _sum: { total: true }
    }),
    app.prisma.cafeTable.findMany({
      where: { storeId, active: true },
      select: { status: true }
    })
  ]);

  const revenue = todayOrders.reduce((sum, order) => sum + Number(order.total), 0);
  const orderCount = todayOrders.length;
  const averageTicket = orderCount > 0 ? revenue / orderCount : 0;
  const yesterdayRevenue = Number(yesterdayAggregate._sum.total ?? 0);
  const yesterdayOrderCount = yesterdayAggregate._count.id;

  const products = new Map<string, { id: string; name: string; quantity: number }>();
  const paymentMethods = new Map<string, { method: string; amount: number; transactions: number }>();
  const tableUsage = new Map<number, number>();

  for (const order of todayOrders) {
    if (order.table) {
      tableUsage.set(order.table.number, (tableUsage.get(order.table.number) ?? 0) + 1);
    }

    for (const item of order.items) {
      const current = products.get(item.product.id) ?? {
        id: item.product.id,
        name: item.product.name,
        quantity: 0
      };
      current.quantity += item.quantity;
      products.set(item.product.id, current);
    }

    for (const payment of order.payments) {
      const current = paymentMethods.get(payment.method) ?? {
        method: payment.method,
        amount: 0,
        transactions: 0
      };
      current.amount += Number(payment.amount);
      current.transactions += 1;
      paymentMethods.set(payment.method, current);
    }
  }

  const topProduct = [...products.values()].sort((a, b) => b.quantity - a.quantity)[0] ?? null;
  const mainPaymentMethod = [...paymentMethods.values()].sort((a, b) => b.amount - a.amount)[0] ?? null;
  const mostUsedTable = [...tableUsage.entries()]
    .map(([number, orders]) => ({ number, orders }))
    .sort((a, b) => b.orders - a.orders)[0] ?? null;

  const tableStatus = tables.reduce(
    (summary, table) => {
      summary.total += 1;
      if (table.status === "FREE") summary.free += 1;
      else if (table.status === "BLOCKED") summary.blocked += 1;
      else summary.inService += 1;
      return summary;
    },
    { total: 0, free: 0, inService: 0, blocked: 0 }
  );

  return {
    generatedAt: new Date().toISOString(),
    period: {
      start: today.start.toISOString(),
      end: today.end.toISOString()
    },
    sales: {
      revenue: Number(revenue.toFixed(2)),
      orderCount,
      averageTicket: Number(averageTicket.toFixed(2)),
      revenueChangePercentage: percentageChange(revenue, yesterdayRevenue),
      orderCountChangePercentage: percentageChange(orderCount, yesterdayOrderCount)
    },
    highlights: {
      topProduct,
      mainPaymentMethod: mainPaymentMethod
        ? {
            ...mainPaymentMethod,
            amount: Number(mainPaymentMethod.amount.toFixed(2))
          }
        : null,
      mostUsedTable
    },
    tables: tableStatus
  };
}
