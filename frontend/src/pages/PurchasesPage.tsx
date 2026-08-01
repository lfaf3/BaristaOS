import {
  Ban,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Eye,
  FileClock,
  PackageCheck,
  PackagePlus,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShoppingCart,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { useToast } from "../components/feedback/ToastProvider";
import { normalizeApiError } from "../services/api/api-error";
import {
  purchasesService,
  type PurchaseOrder,
  type PurchaseOrderStatus,
} from "../services/api/purchases.service";
import * as suppliersService from "../services/api/suppliers.service";
import type { Supplier } from "../services/api/suppliers.service";
import {
  inventoryService,
  type InventoryItem,
} from "../services/api/inventory.service";
import {
  purchaseReceiptsService,
  type PurchaseReceipt,
} from "../services/api/purchase-receipts.service";
import { formatCurrency } from "../utils/currency";

const statusLabels: Record<PurchaseOrderStatus, string> = {
  DRAFT: "Rascunho",
  SENT: "Enviado",
  PARTIALLY_RECEIVED: "Recebido parcialmente",
  RECEIVED: "Recebido",
  CANCELLED: "Cancelado",
};

const statusOptions: Array<{ value: PurchaseOrderStatus | ""; label: string }> = [
  { value: "", label: "Todos os status" },
  { value: "DRAFT", label: "Rascunho" },
  { value: "SENT", label: "Enviado" },
  { value: "PARTIALLY_RECEIVED", label: "Recebido parcialmente" },
  { value: "RECEIVED", label: "Recebido" },
  { value: "CANCELLED", label: "Cancelado" },
];

export function PurchasesPage() {
  const toast = useToast();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, totalCount: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<PurchaseOrder | null>(null);
  const [receivingOrder, setReceivingOrder] = useState<PurchaseOrder | null>(null);
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [filters, setFilters] = useState({
    q: "",
    supplierId: "",
    status: "" as PurchaseOrderStatus | "",
    dateFrom: "",
    dateTo: "",
    page: 1,
  });

  async function load(page = filters.page, appliedFilters = filters) {
    setLoading(true);
    try {
      const response = await purchasesService.list({
        q: appliedFilters.q.trim() || undefined,
        supplierId: appliedFilters.supplierId || undefined,
        status: appliedFilters.status || undefined,
        dateFrom: appliedFilters.dateFrom || undefined,
        dateTo: appliedFilters.dateTo || undefined,
        page,
        pageSize: pagination.pageSize,
      });
      setOrders(response.data);
      setPagination(response.pagination);
      setFilters((current) => ({ ...current, page: response.pagination.page }));
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    suppliersService
      .list({ active: true })
      .then(setSuppliers)
      .catch((error) => toast.error(normalizeApiError(error).message));
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = useMemo(() => {
    const open = orders.filter((order) => ["DRAFT", "SENT", "PARTIALLY_RECEIVED"].includes(order.status)).length;
    const sent = orders.filter((order) => order.status === "SENT").length;
    const total = orders
      .filter((order) => order.status !== "CANCELLED")
      .reduce((sum, order) => sum + order.total, 0);
    return { open, sent, total };
  }, [orders]);

  function updateFilter<K extends keyof typeof filters>(field: K, value: (typeof filters)[K]) {
    setFilters((current) => ({ ...current, [field]: value, page: 1 }));
  }

  function clearFilters() {
    const cleared = { q: "", supplierId: "", status: "" as PurchaseOrderStatus | "", dateFrom: "", dateTo: "", page: 1 };
    setFilters(cleared);
    void load(1, cleared);
  }

  async function sendOrder(order: PurchaseOrder) {
    if (!window.confirm(`Enviar o pedido ${order.number}? Depois disso ele não poderá mais ser editado.`)) return;
    setWorkingId(order.id);
    try {
      await purchasesService.send(order.id);
      toast.success("Pedido enviado ao fornecedor.");
      await load();
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setWorkingId(null);
    }
  }

  async function cancelOrder(order: PurchaseOrder) {
    if (!window.confirm(`Cancelar o pedido ${order.number}?`)) return;
    setWorkingId(order.id);
    try {
      await purchasesService.cancel(order.id);
      toast.success("Pedido cancelado.");
      setSelected(null);
      await load();
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setWorkingId(null);
    }
  }

  function receiveOrder(order: PurchaseOrder) {
    setSelected(null);
    setReceivingOrder(order);
  }

  async function refreshSelectedOrder(orderId: string) {
    const updated = await purchasesService.get(orderId);
    setSelected(updated);
    await load();
  }

  return (
    <main className="dashboard-layout">
      <Sidebar />
      <section className="dashboard-main">
        <Topbar
          actions={
            <button className="button button--soft" onClick={() => void load()} disabled={loading}>
              <RefreshCw size={17} className={loading ? "icon-spin" : undefined} />
              Atualizar
            </button>
          }
        />

        <div className="dashboard-content purchases-page">
          <div className="page-heading">
            <div>
              <span className="eyebrow">Compras e abastecimento</span>
              <h1>Pedidos de compra</h1>
              <p>Acompanhe solicitações, fornecedores, valores e o andamento das compras.</p>
            </div>
            <button
              className="button button--primary"
              onClick={() => setNewOrderOpen(true)}
            >
              <Plus size={17} />
              Novo pedido
            </button>
          </div>

          <div className="purchases-summary">
            <Summary icon={ClipboardList} label="Pedidos exibidos" value={String(pagination.totalCount)} />
            <Summary icon={FileClock} label="Em aberto" value={String(summary.open)} />
            <Summary icon={Send} label="Enviados" value={String(summary.sent)} />
            <Summary icon={CircleDollarSign} label="Valor da página" value={formatCurrency(summary.total)} />
          </div>

          <section className="purchases-filter-card">
            <div className="purchases-filter-grid">
              <label className="purchases-search">
                <Search size={17} />
                <input
                  value={filters.q}
                  onChange={(event) => updateFilter("q", event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && void load(1)}
                  placeholder="Buscar por número ou fornecedor"
                />
                {filters.q && (
                  <button type="button" onClick={() => updateFilter("q", "")} title="Limpar busca">
                    <X size={15} />
                  </button>
                )}
              </label>

              <label className="purchases-filter-field">
                <span>Fornecedor</span>
                <select value={filters.supplierId} onChange={(event) => updateFilter("supplierId", event.target.value)}>
                  <option value="">Todos os fornecedores</option>
                  {suppliers.map((supplier) => (
                    <option value={supplier.id} key={supplier.id}>{supplier.tradeName}</option>
                  ))}
                </select>
              </label>

              <label className="purchases-filter-field">
                <span>Status</span>
                <select
                  value={filters.status}
                  onChange={(event) => updateFilter("status", event.target.value as PurchaseOrderStatus | "")}
                >
                  {statusOptions.map((option) => (
                    <option value={option.value} key={option.value || "all"}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label className="purchases-filter-field">
                <span>De</span>
                <input type="date" value={filters.dateFrom} onChange={(event) => updateFilter("dateFrom", event.target.value)} />
              </label>

              <label className="purchases-filter-field">
                <span>Até</span>
                <input type="date" value={filters.dateTo} onChange={(event) => updateFilter("dateTo", event.target.value)} />
              </label>
            </div>
            <div className="purchases-filter-actions">
              <button className="button button--ghost" type="button" onClick={clearFilters}>Limpar</button>
              <button className="button button--soft" type="button" onClick={() => void load(1)} disabled={loading}>
                <Search size={16} /> Aplicar filtros
              </button>
            </div>
          </section>

          <section className="purchases-table-card">
            <div className="purchases-table-wrap">
              <table className="purchases-table">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Fornecedor</th>
                    <th>Data</th>
                    <th>Itens</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th aria-label="Ações" />
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td><strong>{order.number}</strong><span>{order.createdBy.name}</span></td>
                      <td><strong>{order.supplier.tradeName}</strong><span>{order.supplier.corporateName}</span></td>
                      <td>{formatDate(order.orderDate)}</td>
                      <td>{order.items.length} item{order.items.length === 1 ? "" : "s"}</td>
                      <td><b>{formatCurrency(order.total)}</b></td>
                      <td><StatusPill status={order.status} /></td>
                      <td>
                        <div className="table-actions">
                          <button title="Ver detalhes" onClick={() => setSelected(order)}><Eye size={16} /></button>
                          {order.status === "DRAFT" && (
                            <button title="Enviar pedido" onClick={() => void sendOrder(order)} disabled={workingId === order.id}>
                              <Send size={16} />
                            </button>
                          )}
                          {["DRAFT", "SENT"].includes(order.status) && (
                            <button title="Cancelar pedido" onClick={() => void cancelOrder(order)} disabled={workingId === order.id}>
                              <Ban size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!loading && !orders.length && (
                    <tr>
                      <td colSpan={7}>
                        <div className="purchases-empty">
                          <ShoppingCart size={38} />
                          <strong>Nenhum pedido encontrado</strong>
                          <span>Crie o primeiro pedido ou ajuste os filtros da pesquisa.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <footer className="purchases-pagination">
            <span>
              Página {pagination.page} de {pagination.totalPages} · {pagination.totalCount} registro{pagination.totalCount === 1 ? "" : "s"}
            </span>
            <div>
              <button
                className="button button--soft"
                disabled={loading || pagination.page <= 1}
                onClick={() => void load(pagination.page - 1)}
              ><ChevronLeft size={16} /> Anterior</button>
              <button
                className="button button--soft"
                disabled={loading || pagination.page >= pagination.totalPages}
                onClick={() => void load(pagination.page + 1)}
              >Próxima <ChevronRight size={16} /></button>
            </div>
          </footer>
        </div>
      </section>

      {newOrderOpen && (
        <NewPurchaseOrderModal
          suppliers={suppliers}
          onClose={() => setNewOrderOpen(false)}
          onCreated={async (order) => {
            setNewOrderOpen(false);
            toast.success(`Pedido ${order.number} criado como rascunho.`);
            await load(1);
            setSelected(order);
          }}
        />
      )}

      {receivingOrder && (
        <PurchaseReceiptModal
          order={receivingOrder}
          onClose={() => setReceivingOrder(null)}
          onReceived={async () => {
            const orderId = receivingOrder.id;
            setReceivingOrder(null);
            toast.success("Recebimento registrado e estoque atualizado.");
            await refreshSelectedOrder(orderId);
          }}
        />
      )}

      {selected && !receivingOrder && (
        <PurchaseDetailsModal
          order={selected}
          working={workingId === selected.id}
          onClose={() => setSelected(null)}
          onSend={() => void sendOrder(selected)}
          onCancel={() => void cancelOrder(selected)}
          onReceive={() => receiveOrder(selected)}
        />
      )}
    </main>
  );
}


type DraftItem = {
  inventoryItemId: string;
  quantity: string;
  unitPrice: string;
};

function NewPurchaseOrderModal({
  suppliers,
  onClose,
  onCreated,
}: {
  suppliers: Supplier[];
  onClose: () => void;
  onCreated: (order: PurchaseOrder) => Promise<void> | void;
}) {
  const toast = useToast();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [saving, setSaving] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<DraftItem[]>([
    { inventoryItemId: "", quantity: "1", unitPrice: "0" },
  ]);

  useEffect(() => {
    inventoryService
      .list()
      .then((response) => setInventoryItems(response.data.filter((item) => item.active)))
      .catch((error) => toast.error(normalizeApiError(error).message))
      .finally(() => setLoadingItems(false));
  }, [toast]);

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const quantity = Number(item.quantity.replace(",", ".")) || 0;
        const unitPrice = Number(item.unitPrice.replace(",", ".")) || 0;
        return sum + quantity * unitPrice;
      }, 0),
    [items],
  );

  function updateItem(index: number, field: keyof DraftItem, value: string) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function selectInventoryItem(index: number, inventoryItemId: string) {
    const inventoryItem = inventoryItems.find((item) => item.id === inventoryItemId);
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              inventoryItemId,
              unitPrice: inventoryItem ? String(inventoryItem.unitCost) : item.unitPrice,
            }
          : item,
      ),
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      { inventoryItemId: "", quantity: "1", unitPrice: "0" },
    ]);
  }

  function removeItem(index: number) {
    setItems((current) =>
      current.length === 1
        ? [{ inventoryItemId: "", quantity: "1", unitPrice: "0" }]
        : current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    if (!supplierId) {
      toast.warning("Selecione o fornecedor.");
      return;
    }

    const normalizedItems = items
      .filter((item) => item.inventoryItemId)
      .map((item) => ({
        inventoryItemId: item.inventoryItemId,
        quantity: Number(item.quantity.replace(",", ".")),
        unitPrice: Number(item.unitPrice.replace(",", ".")),
      }));

    if (!normalizedItems.length) {
      toast.warning("Inclua pelo menos um item no pedido.");
      return;
    }

    if (normalizedItems.some((item) => !Number.isFinite(item.quantity) || item.quantity <= 0)) {
      toast.warning("Informe quantidades maiores que zero.");
      return;
    }

    if (normalizedItems.some((item) => !Number.isFinite(item.unitPrice) || item.unitPrice < 0)) {
      toast.warning("Informe valores unitários válidos.");
      return;
    }

    if (new Set(normalizedItems.map((item) => item.inventoryItemId)).size !== normalizedItems.length) {
      toast.warning("O mesmo item de estoque não pode aparecer duas vezes.");
      return;
    }

    setSaving(true);
    try {
      const order = await purchasesService.create({
        supplierId,
        orderDate: orderDate || undefined,
        notes: notes.trim() || null,
        items: normalizedItems,
      });
      await onCreated(order);
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}>
      <form className="purchase-form-modal" onSubmit={submit}>
        <header>
          <div>
            <span className="eyebrow">Compras e abastecimento</span>
            <h2>Novo pedido de compra</h2>
            <p>Selecione o fornecedor e os itens que serão solicitados.</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Fechar">
            <X />
          </button>
        </header>

        <div className="purchase-form-content">
          <section className="purchase-form-section">
            <div className="purchase-form-grid">
              <label className="purchase-form-field purchase-form-field--wide">
                <span>Fornecedor *</span>
                <select value={supplierId} onChange={(event) => setSupplierId(event.target.value)} disabled={saving}>
                  <option value="">Selecione um fornecedor</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.tradeName} — {supplier.document}
                    </option>
                  ))}
                </select>
              </label>

              <label className="purchase-form-field">
                <span>Data do pedido *</span>
                <input
                  type="date"
                  value={orderDate}
                  onChange={(event) => setOrderDate(event.target.value)}
                  disabled={saving}
                  required
                />
              </label>
            </div>
          </section>

          <section className="purchase-form-section">
            <div className="purchase-form-section-heading">
              <div>
                <h3>Itens do pedido</h3>
                <p>Os valores podem ser ajustados conforme a negociação com o fornecedor.</p>
              </div>
              <button className="button button--soft" type="button" onClick={addItem} disabled={saving || loadingItems}>
                <Plus size={16} />
                Adicionar item
              </button>
            </div>

            <div className="purchase-form-items">
              {items.map((item, index) => {
                const inventoryItem = inventoryItems.find((candidate) => candidate.id === item.inventoryItemId);
                const quantity = Number(item.quantity.replace(",", ".")) || 0;
                const unitPrice = Number(item.unitPrice.replace(",", ".")) || 0;

                return (
                  <div className="purchase-form-item" key={index}>
                    <label className="purchase-form-field purchase-form-field--item">
                      <span>Insumo *</span>
                      <select
                        value={item.inventoryItemId}
                        onChange={(event) => selectInventoryItem(index, event.target.value)}
                        disabled={saving || loadingItems}
                      >
                        <option value="">{loadingItems ? "Carregando itens..." : "Selecione o item"}</option>
                        {inventoryItems.map((candidate) => (
                          <option key={candidate.id} value={candidate.id}>
                            {candidate.name} · {candidate.category}
                          </option>
                        ))}
                      </select>
                      {inventoryItem && (
                        <small>
                          Unidade: {unitLabel(inventoryItem.unit)} · Custo atual: {formatCurrency(inventoryItem.unitCost)}
                        </small>
                      )}
                    </label>

                    <label className="purchase-form-field">
                      <span>Quantidade *</span>
                      <input
                        inputMode="decimal"
                        value={item.quantity}
                        onChange={(event) => updateItem(index, "quantity", event.target.value)}
                        disabled={saving}
                      />
                    </label>

                    <label className="purchase-form-field">
                      <span>Valor unitário *</span>
                      <input
                        inputMode="decimal"
                        value={item.unitPrice}
                        onChange={(event) => updateItem(index, "unitPrice", event.target.value)}
                        disabled={saving}
                      />
                    </label>

                    <div className="purchase-form-subtotal">
                      <span>Subtotal</span>
                      <strong>{formatCurrency(quantity * unitPrice)}</strong>
                    </div>

                    <button
                      className="purchase-form-remove"
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={saving}
                      title="Remover item"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="purchase-form-section">
            <label className="purchase-form-field">
              <span>Observações</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                maxLength={1000}
                rows={4}
                placeholder="Condições negociadas, prazo de entrega ou outras informações."
                disabled={saving}
              />
            </label>
          </section>
        </div>

        <footer>
          <div className="purchase-form-total">
            <span>Valor total do pedido</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
          <div>
            <button className="button button--ghost" type="button" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button className="button button--primary" type="submit" disabled={saving || loadingItems}>
              <ShoppingCart size={17} />
              {saving ? "Salvando..." : "Salvar rascunho"}
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}

function Summary({ icon: Icon, label, value }: { icon: typeof ClipboardList; label: string; value: string }) {
  return <div className="purchases-summary-card"><Icon size={21} /><div><span>{label}</span><strong>{value}</strong></div></div>;
}

function StatusPill({ status }: { status: PurchaseOrderStatus }) {
  return <span className={`purchase-status purchase-status--${status.toLowerCase()}`}>{statusLabels[status]}</span>;
}


type ReceiptDraftItem = {
  purchaseOrderItemId: string;
  orderedQuantity: number;
  previouslyReceived: number;
  pendingQuantity: number;
  quantity: string;
  unitCost: string;
  name: string;
  unit: InventoryItem["unit"];
};

function PurchaseReceiptModal({
  order,
  onClose,
  onReceived,
}: {
  order: PurchaseOrder;
  onClose: () => void;
  onReceived: () => Promise<void> | void;
}) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [receivedAt, setReceivedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ReceiptDraftItem[]>([]);
  const [receiptHistory, setReceiptHistory] = useState<PurchaseReceipt[]>([]);

  useEffect(() => {
    purchaseReceiptsService
      .list(order.id)
      .then((response) => {
        setReceiptHistory(response.data);

        const receivedByOrderItem = new Map<string, number>();
        response.data.forEach((receipt) => {
          receipt.items.forEach((item) => {
            receivedByOrderItem.set(
              item.purchaseOrderItemId,
              (receivedByOrderItem.get(item.purchaseOrderItemId) ?? 0) + item.quantity,
            );
          });
        });

        setItems(
          order.items.map((item) => {
            const previouslyReceived = receivedByOrderItem.get(item.id) ?? 0;
            const pendingQuantity = Math.max(0, item.quantity - previouslyReceived);

            return {
              purchaseOrderItemId: item.id,
              orderedQuantity: item.quantity,
              previouslyReceived,
              pendingQuantity,
              quantity: formatDecimalInput(pendingQuantity),
              unitCost: formatDecimalInput(item.unitPrice),
              name: item.inventoryItem.name,
              unit: item.inventoryItem.unit,
            };
          }),
        );
      })
      .catch((error) => toast.error(normalizeApiError(error).message))
      .finally(() => setLoading(false));
  }, [order, toast]);

  const receivableItems = items.filter((item) => item.pendingQuantity > 0.0005);

  const total = useMemo(
    () =>
      receivableItems.reduce((sum, item) => {
        const quantity = parseDecimalInput(item.quantity);
        const unitCost = parseDecimalInput(item.unitCost);
        return sum + Math.max(0, quantity) * Math.max(0, unitCost);
      }, 0),
    [receivableItems],
  );

  function updateItem(
    purchaseOrderItemId: string,
    field: "quantity" | "unitCost",
    value: string,
  ) {
    setItems((current) =>
      current.map((item) =>
        item.purchaseOrderItemId === purchaseOrderItemId
          ? { ...item, [field]: value }
          : item,
      ),
    );
  }

  function fillAllPending() {
    setItems((current) =>
      current.map((item) => ({
        ...item,
        quantity:
          item.pendingQuantity > 0.0005
            ? formatDecimalInput(item.pendingQuantity)
            : "0",
      })),
    );
  }

  function clearQuantities() {
    setItems((current) => current.map((item) => ({ ...item, quantity: "0" })));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    const normalizedItems = receivableItems
      .map((item) => ({
        purchaseOrderItemId: item.purchaseOrderItemId,
        quantity: parseDecimalInput(item.quantity),
        unitCost: parseDecimalInput(item.unitCost),
        pendingQuantity: item.pendingQuantity,
      }))
      .filter((item) => item.quantity > 0);

    if (!normalizedItems.length) {
      toast.warning("Informe a quantidade recebida de pelo menos um item.");
      return;
    }

    if (
      normalizedItems.some(
        (item) =>
          !Number.isFinite(item.quantity) ||
          item.quantity <= 0 ||
          item.quantity - item.pendingQuantity > 0.0005,
      )
    ) {
      toast.warning("A quantidade recebida deve estar entre zero e o saldo pendente.");
      return;
    }

    if (
      normalizedItems.some(
        (item) => !Number.isFinite(item.unitCost) || item.unitCost < 0,
      )
    ) {
      toast.warning("Informe custos unitários válidos.");
      return;
    }

    setSaving(true);
    try {
      await purchaseReceiptsService.create(order.id, {
        receivedAt: receivedAt || undefined,
        notes: notes.trim() || null,
        items: normalizedItems.map(
          ({ purchaseOrderItemId, quantity, unitCost }) => ({
            purchaseOrderItemId,
            quantity,
            unitCost,
          }),
        ),
      });

      await onReceived();
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) =>
        event.target === event.currentTarget && !saving && onClose()
      }
    >
      <form className="receipt-modal" onSubmit={submit}>
        <header>
          <div>
            <span className="eyebrow">Entrada de mercadorias</span>
            <h2>Receber pedido {order.number}</h2>
            <p>
              {order.supplier.tradeName} · {order.items.length} item
              {order.items.length === 1 ? "" : "s"} no pedido
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Fechar"
          >
            <X />
          </button>
        </header>

        <div className="receipt-modal__content">
          <section className="receipt-meta-grid">
            <label className="purchase-form-field">
              <span>Data do recebimento *</span>
              <input
                type="date"
                value={receivedAt}
                onChange={(event) => setReceivedAt(event.target.value)}
                disabled={saving}
                required
              />
            </label>

            <div className="receipt-history-summary">
              <span>Recebimentos anteriores</span>
              <strong>{receiptHistory.length}</strong>
            </div>

            <div className="receipt-history-summary">
              <span>Status atual</span>
              <strong>{statusLabels[order.status]}</strong>
            </div>
          </section>

          <section className="receipt-items-section">
            <div className="purchase-form-section-heading">
              <div>
                <h3>Itens recebidos</h3>
                <p>
                  Informe somente o que chegou nesta entrega. O restante continuará pendente.
                </p>
              </div>
              <div className="receipt-quick-actions">
                <button
                  className="button button--ghost"
                  type="button"
                  onClick={clearQuantities}
                  disabled={saving || loading}
                >
                  Zerar
                </button>
                <button
                  className="button button--soft"
                  type="button"
                  onClick={fillAllPending}
                  disabled={saving || loading}
                >
                  Preencher pendências
                </button>
              </div>
            </div>

            {loading ? (
              <div className="receipt-loading">
                <RefreshCw className="icon-spin" size={20} />
                Carregando saldos pendentes...
              </div>
            ) : receivableItems.length ? (
              <div className="receipt-items-list">
                {receivableItems.map((item) => {
                  const quantity = parseDecimalInput(item.quantity);
                  const unitCost = parseDecimalInput(item.unitCost);

                  return (
                    <div className="receipt-item-row" key={item.purchaseOrderItemId}>
                      <div className="receipt-item-info">
                        <strong>{item.name}</strong>
                        <span>
                          Pedido: {formatQuantity(item.orderedQuantity)} {unitLabel(item.unit)}
                          {item.previouslyReceived > 0 && (
                            <>
                              {" "}· já recebido: {formatQuantity(item.previouslyReceived)} {unitLabel(item.unit)}
                            </>
                          )}
                        </span>
                        <small>
                          Pendente: {formatQuantity(item.pendingQuantity)} {unitLabel(item.unit)}
                        </small>
                      </div>

                      <label className="purchase-form-field">
                        <span>Recebido agora</span>
                        <input
                          inputMode="decimal"
                          value={item.quantity}
                          onChange={(event) =>
                            updateItem(
                              item.purchaseOrderItemId,
                              "quantity",
                              event.target.value,
                            )
                          }
                          disabled={saving}
                        />
                      </label>

                      <label className="purchase-form-field">
                        <span>Custo unitário</span>
                        <input
                          inputMode="decimal"
                          value={item.unitCost}
                          onChange={(event) =>
                            updateItem(
                              item.purchaseOrderItemId,
                              "unitCost",
                              event.target.value,
                            )
                          }
                          disabled={saving}
                        />
                      </label>

                      <div className="receipt-item-subtotal">
                        <span>Subtotal</span>
                        <strong>
                          {formatCurrency(
                            Math.max(0, quantity) * Math.max(0, unitCost),
                          )}
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="purchases-empty receipt-empty">
                <PackageCheck size={36} />
                <strong>Pedido totalmente recebido</strong>
                <span>Não existem quantidades pendentes para este pedido.</span>
              </div>
            )}
          </section>

          <section>
            <label className="purchase-form-field">
              <span>Observações do recebimento</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                maxLength={1000}
                placeholder="Ex.: entrega parcial, lote, validade ou divergências."
                disabled={saving}
              />
            </label>
          </section>
        </div>

        <footer>
          <div className="purchase-form-total">
            <span>Valor recebido nesta entrega</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
          <div>
            <button
              className="button button--ghost"
              type="button"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              className="button button--primary"
              type="submit"
              disabled={saving || loading || !receivableItems.length}
            >
              <PackagePlus size={17} />
              {saving ? "Registrando..." : "Confirmar recebimento"}
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}

function parseDecimalInput(value: string) {
  const normalized = value.trim().replace(/\s/g, "").replace(",", ".");
  return Number(normalized);
}

function formatDecimalInput(value: number) {
  return String(Number(value.toFixed(3))).replace(".", ",");
}

function PurchaseDetailsModal({
  order,
  working,
  onClose,
  onSend,
  onCancel,
  onReceive,
}: {
  order: PurchaseOrder;
  working: boolean;
  onClose: () => void;
  onSend: () => void;
  onCancel: () => void;
  onReceive: () => void;
}) {
  const toast = useToast();
  const [receipts, setReceipts] = useState<PurchaseReceipt[]>([]);
  const [loadingReceipts, setLoadingReceipts] = useState(true);

  useEffect(() => {
    purchaseReceiptsService
      .list(order.id)
      .then((response) => setReceipts(response.data))
      .catch((error) => toast.error(normalizeApiError(error).message))
      .finally(() => setLoadingReceipts(false));
  }, [order.id, toast]);

  const receivedByOrderItem = useMemo(() => {
    const totals = new Map<string, number>();

    receipts.forEach((receipt) => {
      receipt.items.forEach((item) => {
        totals.set(
          item.purchaseOrderItemId,
          (totals.get(item.purchaseOrderItemId) ?? 0) + item.quantity,
        );
      });
    });

    return totals;
  }, [receipts]);

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <article className="purchase-details-modal">
        <header>
          <div><span className="eyebrow">Pedido de compra</span><h2>{order.number}</h2></div>
          <button type="button" onClick={onClose} aria-label="Fechar"><X /></button>
        </header>

        <div className="purchase-details-content">
          <div className="purchase-details-meta">
            <div><Truck size={17} /><span>Fornecedor</span><strong>{order.supplier.tradeName}</strong></div>
            <div><CalendarDays size={17} /><span>Data</span><strong>{formatDate(order.orderDate)}</strong></div>
            <div><PackageCheck size={17} /><span>Status</span><StatusPill status={order.status} /></div>
            <div><CircleDollarSign size={17} /><span>Total</span><strong>{formatCurrency(order.total)}</strong></div>
          </div>

          <div className="purchase-details-table-wrap">
            <table className="purchase-details-table">
              <thead><tr><th>Item</th><th>Qtd.</th><th>Valor unitário</th><th>Subtotal</th></tr></thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.inventoryItem.name}</strong>
                      <span>{item.inventoryItem.category}</span>
                    </td>
                    <td>
                      {formatQuantity(item.quantity)} {unitLabel(item.inventoryItem.unit)}
                      {receipts.length > 0 && (
                        <small className="purchase-received-caption">
                          Recebido: {formatQuantity(receivedByOrderItem.get(item.id) ?? 0)} {unitLabel(item.inventoryItem.unit)}
                          {" · "}
                          Pendente: {formatQuantity(Math.max(0, item.quantity - (receivedByOrderItem.get(item.id) ?? 0)))} {unitLabel(item.inventoryItem.unit)}
                        </small>
                      )}
                    </td>
                    <td>{formatCurrency(item.unitPrice)}</td>
                    <td><b>{formatCurrency(item.subtotal)}</b></td>
                  </tr>
                ))}
                {!order.items.length && <tr><td colSpan={4}><div className="purchases-empty purchases-empty--compact">Pedido sem itens.</div></td></tr>}
              </tbody>
            </table>
          </div>

          <section className="purchase-receipt-history">
            <div className="purchase-receipt-history__heading">
              <div>
                <span className="eyebrow">Auditoria de recebimentos</span>
                <h3>Histórico de entradas</h3>
              </div>
              <strong>{receipts.length}</strong>
            </div>

            {loadingReceipts ? (
              <div className="receipt-loading">
                <RefreshCw className="icon-spin" size={18} />
                Carregando recebimentos...
              </div>
            ) : receipts.length ? (
              <div className="purchase-receipt-history__list">
                {receipts.map((receipt) => (
                  <article key={receipt.id} className="purchase-receipt-history__card">
                    <header>
                      <div>
                        <strong>{formatDateTime(receipt.receivedAt)}</strong>
                        <span>Recebido por {receipt.receivedBy.name}</span>
                      </div>
                      <b>{formatCurrency(receipt.items.reduce((sum, item) => sum + item.subtotal, 0))}</b>
                    </header>

                    <div className="purchase-receipt-history__items">
                      {receipt.items.map((item) => (
                        <div key={item.id}>
                          <span>{item.inventoryItem.name}</span>
                          <strong>
                            {formatQuantity(item.quantity)} {unitLabel(item.inventoryItem.unit)}
                            {" · "}
                            {formatCurrency(item.unitCost)}
                          </strong>
                        </div>
                      ))}
                    </div>

                    {receipt.notes && <p>{receipt.notes}</p>}
                  </article>
                ))}
              </div>
            ) : (
              <div className="purchases-empty purchases-empty--compact">
                Nenhum recebimento registrado para este pedido.
              </div>
            )}
          </section>

          {order.notes && <div className="purchase-notes"><span>Observações</span><p>{order.notes}</p></div>}
        </div>

        <footer>
          <button className="button button--ghost" type="button" onClick={onClose}>Fechar</button>
          <div>
            {["DRAFT", "SENT"].includes(order.status) && (
              <button className="button button--danger-soft" type="button" onClick={onCancel} disabled={working}><Ban size={16} />Cancelar</button>
            )}
            {["SENT", "PARTIALLY_RECEIVED"].includes(order.status) && (
              <button className="button button--primary" type="button" onClick={onReceive} disabled={working}>
                <PackagePlus size={16} />
                Receber mercadoria
              </button>
            )}
            {order.status === "DRAFT" && (
              <button className="button button--primary" type="button" onClick={onSend} disabled={working}><Send size={16} />Enviar pedido</button>
            )}
          </div>
        </footer>
      </article>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatQuantity(value: number) {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 3 });
}

function unitLabel(unit: string) {
  return ({ KG: "kg", G: "g", L: "L", ML: "mL", UNIT: "un" } as Record<string, string>)[unit] ?? unit;
}
