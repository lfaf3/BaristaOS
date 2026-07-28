import {
  ArrowLeft,
  Check,
  CircleDollarSign,
  Ban,
  Clock3,
  LockKeyhole,
  Minus,
  Pencil,
  Plus,
  ReceiptText,
  RefreshCw,
  DoorOpen,
  ServerOff,
  Trash2,
  Users,
  X
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AddProductModal } from "../components/AddProductModal";
import { CancelOrderModal } from "../components/orders/CancelOrderModal";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { TablePaymentModal, type OrderPaymentMethod } from "../components/TablePaymentModal";
import { normalizeApiError } from "../services/api/api-error";
import { ordersService } from "../services/api/orders.service";
import { tablesService } from "../services/api/tables.service";
import type { TableOrder, TableOrderItem } from "../types";
import { formatCurrency } from "../utils/currency";

function formatOpenedAt(value: string | null) {
  if (!value) return "Horário não informado";

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function parseMoney(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

export function TableOrderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<TableOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [addingProduct, setAddingProduct] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [editingNotesItemId, setEditingNotesItemId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [servicePercentage, setServicePercentage] = useState("10");
  const [discount, setDiscount] = useState("0,00");
  const [closingOrder, setClosingOrder] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [payingOrder, setPayingOrder] = useState(false);
  const [releasingTable, setReleasingTable] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);

  const isPayment = data?.table.status === "PAYMENT";
  const isReady = data?.table.status === "READY_TO_CLOSE";
  const isEditable = data?.table.status === "OPEN";

  const loadOrder = useCallback(async () => {
    if (!id) {
      setError("Identificador da mesa não informado.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await ordersService.getByTable(id);
      setData(response);
      setServicePercentage(String(response.serviceChargePercentage || 10));
      setDiscount(response.discount.toFixed(2).replace(".", ","));
    } catch (cause) {
      setError(normalizeApiError(cause).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  const preview = useMemo(() => {
    if (!data) return { service: 0, discount: 0, total: 0 };
    if (isPayment || isReady) {
      return {
        service: data.serviceCharge,
        discount: data.discount,
        total: data.total
      };
    }

    const percentage = Math.min(100, Math.max(0, Number(servicePercentage) || 0));
    const service = Math.round(data.subtotal * (percentage / 100) * 100) / 100;
    const discountValue = parseMoney(discount);
    return {
      service,
      discount: discountValue,
      total: Math.max(0, Math.round((data.subtotal + service - discountValue) * 100) / 100)
    };
  }, [data, discount, isPayment, isReady, servicePercentage]);

  async function handleAddProduct(input: { productId: string; quantity: number }) {
    if (!id || !isEditable) return;

    setAddingProduct(true);
    setActionError(null);
    try {
      const updated = await ordersService.addItem(id, input);
      setData(updated);
      setProductModalOpen(false);
    } catch (cause) {
      setActionError(normalizeApiError(cause).message);
    } finally {
      setAddingProduct(false);
    }
  }

  async function updateItem(item: TableOrderItem, quantity: number) {
    if (!id || busyItemId || !isEditable) return;

    if (quantity < 1) {
      await removeItem(item);
      return;
    }

    setBusyItemId(item.id);
    setActionError(null);
    try {
      setData(await ordersService.updateItem(id, item.id, { quantity }));
    } catch (cause) {
      setActionError(normalizeApiError(cause).message);
    } finally {
      setBusyItemId(null);
    }
  }

  async function removeItem(item: TableOrderItem) {
    if (!id || busyItemId || !isEditable) return;

    setBusyItemId(item.id);
    setActionError(null);
    try {
      setData(await ordersService.deleteItem(id, item.id));
      if (editingNotesItemId === item.id) {
        setEditingNotesItemId(null);
        setNotesDraft("");
      }
    } catch (cause) {
      setActionError(normalizeApiError(cause).message);
    } finally {
      setBusyItemId(null);
    }
  }

  function startEditingNotes(item: TableOrderItem) {
    if (!isEditable) return;
    setEditingNotesItemId(item.id);
    setNotesDraft(item.notes ?? "");
    setActionError(null);
  }

  function cancelEditingNotes() {
    setEditingNotesItemId(null);
    setNotesDraft("");
  }

  async function saveNotes(item: TableOrderItem) {
    if (!id || busyItemId || !isEditable) return;

    setBusyItemId(item.id);
    setActionError(null);
    try {
      setData(
        await ordersService.updateItem(id, item.id, {
          notes: notesDraft.trim() || null
        })
      );
      cancelEditingNotes();
    } catch (cause) {
      setActionError(normalizeApiError(cause).message);
    } finally {
      setBusyItemId(null);
    }
  }

  async function handlePayment(payments: Array<{ method: OrderPaymentMethod; amount: number }>) {
    if (!data?.order || payingOrder) return;

    setPayingOrder(true);
    setActionError(null);
    try {
      const updated = await ordersService.pay(data.order.id, payments);
      setData(updated);
      setPaymentModalOpen(false);
    } catch (cause) {
      setActionError(normalizeApiError(cause).message);
    } finally {
      setPayingOrder(false);
    }
  }

  async function handleCloseOrder() {
    if (!id || !data || !isEditable || closingOrder) return;

    if (data.items.length === 0) {
      setActionError("Adicione ao menos um item antes de fechar a conta.");
      return;
    }

    const percentage = Math.min(100, Math.max(0, Number(servicePercentage) || 0));
    const discountValue = parseMoney(discount);

    if (discountValue > data.subtotal + preview.service) {
      setActionError("O desconto não pode ser maior que o valor da conta.");
      return;
    }

    const confirmed = window.confirm(
      `Fechar a conta no valor de ${formatCurrency(preview.total)} e enviar a mesa para pagamento?`
    );
    if (!confirmed) return;

    setClosingOrder(true);
    setActionError(null);
    try {
      const updated = await ordersService.close(id, {
        discount: discountValue,
        serviceChargePercentage: percentage
      });
      setData(updated);
      setServicePercentage(String(updated.serviceChargePercentage));
      setDiscount(updated.discount.toFixed(2).replace(".", ","));
      setEditingNotesItemId(null);
      setProductModalOpen(false);
    } catch (cause) {
      setActionError(normalizeApiError(cause).message);
    } finally {
      setClosingOrder(false);
    }
  }

  async function handleCancelOrder(reason: string) {
    if (!id || !data || !isEditable || data.items.length > 0 || cancellingOrder) return;

    setCancellingOrder(true);
    setActionError(null);
    try {
      await ordersService.cancel(id, reason);
      setCancelModalOpen(false);
      navigate("/mesas", { replace: true, state: { message: "Atendimento cancelado com sucesso." } });
    } catch (cause) {
      setActionError(normalizeApiError(cause).message);
    } finally {
      setCancellingOrder(false);
    }
  }

  async function handleReleaseTable() {
    if (!id || !isReady || releasingTable) return;

    const confirmed = window.confirm(
      "Liberar esta mesa e deixá-la disponível para um novo atendimento?"
    );
    if (!confirmed) return;

    setReleasingTable(true);
    setActionError(null);
    try {
      await tablesService.release(id);
      navigate("/mesas", { replace: true });
    } catch (cause) {
      setActionError(normalizeApiError(cause).message);
    } finally {
      setReleasingTable(false);
    }
  }

  return (
    <main className="dashboard-layout">
      <Sidebar />
      <section className="dashboard-main">
        <Topbar
          actions={
            <>
              <button className="button button--soft" onClick={() => navigate("/mesas")}>
                <ArrowLeft size={17} />
                Voltar às mesas
              </button>
              <button
                className="button button--soft"
                onClick={() => void loadOrder()}
                disabled={loading}
              >
                <RefreshCw size={17} className={loading ? "icon-spin" : undefined} />
                Atualizar
              </button>
            </>
          }
        />

        <div className="dashboard-content order-page-content">
          {loading && !data && (
            <div className="order-page-loading" aria-label="Carregando comanda">
              <RefreshCw size={30} className="icon-spin" />
              <strong>Carregando comanda...</strong>
            </div>
          )}

          {!loading && error && (
            <div className="tables-feedback" role="alert">
              <ServerOff size={40} strokeWidth={1.6} />
              <strong>Não foi possível carregar a comanda</strong>
              <span>{error}</span>
              <button className="button button--primary" onClick={() => void loadOrder()}>
                Tentar novamente
              </button>
            </div>
          )}

          {data && (
            <>
              <header className="order-heading">
                <div>
                  <span className="eyebrow">
                    {isReady ? "Pagamento concluído" : isPayment ? "Conta fechada" : "Comanda em atendimento"}
                  </span>
                  <h1>{data.table.name ?? `Mesa ${String(data.table.number).padStart(2, "0")}`}</h1>
                  <div className="order-heading__meta">
                    <span><Clock3 size={16} /> Aberta às {formatOpenedAt(data.table.openedAt)}</span>
                    <span><Users size={16} /> {data.table.people} pessoas</span>
                  </div>
                </div>
                <span className={`status-pill status-pill--${isReady ? "ready" : isPayment ? "payment" : "open"}`}>
                  {isReady ? "Pagamento concluído" : isPayment ? "Aguardando pagamento" : "Em atendimento"}
                </span>
              </header>

              {actionError && (
                <div className="tables-action-error" role="alert">
                  <span>{actionError}</span>
                  <button onClick={() => setActionError(null)}>Fechar</button>
                </div>
              )}

              {(isPayment || isReady) && (
                <div className="order-locked-banner">
                  <LockKeyhole size={20} />
                  <div>
                    <strong>{isReady ? "Pagamento concluído" : "Comanda bloqueada para edição"}</strong>
                    <span>{isReady ? "A mesa aguarda apenas a liberação pelo operador." : "A conta foi fechada e está aguardando o registro do pagamento."}</span>
                  </div>
                </div>
              )}

              <div className="order-layout">
                <section className="order-card order-items-card">
                  <div className="order-card__header">
                    <div>
                      <span className="eyebrow">Itens da comanda</span>
                      <h2>Consumo</h2>
                    </div>
                    <button
                      className="button button--accent"
                      disabled={!isEditable}
                      onClick={() => {
                        setActionError(null);
                        setProductModalOpen(true);
                      }}
                    >
                      <Plus size={18} />
                      Adicionar produto
                    </button>
                  </div>

                  {data.items.length === 0 ? (
                    <div className="order-empty-state">
                      <ReceiptText size={44} strokeWidth={1.5} />
                      <strong>Nenhum item adicionado</strong>
                      <span>Clique em “Adicionar produto” para iniciar a comanda.</span>
                    </div>
                  ) : (
                    <div className="order-items-list">
                      {data.items.map(item => {
                        const busy = busyItemId === item.id;
                        const editingNotes = editingNotesItemId === item.id;

                        return (
                          <article className="order-item-row order-item-row--managed" key={item.id}>
                            <div className="order-item-main">
                              <div className="order-item-title">
                                <strong>{item.name}</strong>
                                <span>{item.code} · {formatCurrency(item.unitPrice)} cada</span>
                              </div>

                              <div className="order-item-controls" aria-label={`Quantidade de ${item.name}`}>
                                <button
                                  className="order-quantity-button"
                                  aria-label="Diminuir quantidade"
                                  disabled={busy || !isEditable}
                                  onClick={() => void updateItem(item, item.quantity - 1)}
                                >
                                  <Minus size={16} />
                                </button>
                                <strong className="order-item-quantity">{item.quantity}</strong>
                                <button
                                  className="order-quantity-button"
                                  aria-label="Aumentar quantidade"
                                  disabled={busy || !isEditable || item.quantity >= 99}
                                  onClick={() => void updateItem(item, item.quantity + 1)}
                                >
                                  <Plus size={16} />
                                </button>
                              </div>

                              {editingNotes ? (
                                <div className="order-item-notes-editor">
                                  <textarea
                                    value={notesDraft}
                                    maxLength={300}
                                    rows={2}
                                    autoFocus
                                    placeholder="Ex.: sem açúcar, bem quente..."
                                    onChange={event => setNotesDraft(event.target.value)}
                                  />
                                  <div>
                                    <small>{notesDraft.length}/300</small>
                                    <button className="order-icon-button" disabled={busy} onClick={cancelEditingNotes}>
                                      <X size={16} />
                                    </button>
                                    <button
                                      className="order-icon-button order-icon-button--confirm"
                                      disabled={busy}
                                      onClick={() => void saveNotes(item)}
                                    >
                                      <Check size={16} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  className="order-item-notes"
                                  disabled={busy || !isEditable}
                                  onClick={() => startEditingNotes(item)}
                                >
                                  <Pencil size={14} />
                                  {item.notes || (isEditable ? "Adicionar observação" : "Sem observação")}
                                </button>
                              )}
                            </div>

                            <div className="order-item-side">
                              <b>{formatCurrency(item.totalPrice)}</b>
                              <button
                                className="order-remove-button"
                                disabled={busy || !isEditable}
                                onClick={() => void removeItem(item)}
                              >
                                {busy ? <RefreshCw size={17} className="icon-spin" /> : <Trash2 size={17} />}
                                Remover
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>

                <aside className="order-card order-summary-card">
                  <span className="eyebrow">Resumo</span>
                  <h2>Total da mesa</h2>

                  {isEditable && (
                    <div className="order-closing-fields">
                      <label>
                        <span>Taxa de serviço (%)</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={servicePercentage}
                          onChange={event => setServicePercentage(event.target.value)}
                        />
                      </label>
                      <label>
                        <span>Desconto (R$)</span>
                        <input
                          inputMode="decimal"
                          value={discount}
                          onChange={event => setDiscount(event.target.value)}
                          onBlur={() => setDiscount(parseMoney(discount).toFixed(2).replace(".", ","))}
                        />
                      </label>
                    </div>
                  )}

                  <dl className="order-summary-list">
                    <div><dt>Subtotal</dt><dd>{formatCurrency(data.subtotal)}</dd></div>
                    <div>
                      <dt>Serviço {isPayment ? `(${data.serviceChargePercentage}%)` : `(${Number(servicePercentage) || 0}%)`}</dt>
                      <dd>{formatCurrency(preview.service)}</dd>
                    </div>
                    <div><dt>Desconto</dt><dd>- {formatCurrency(preview.discount)}</dd></div>
                    <div className="order-summary-total">
                      <dt>Total</dt><dd>{formatCurrency(preview.total)}</dd>
                    </div>
                  </dl>

                  {isEditable ? (
                    <div className="order-primary-actions">
                      <button
                        className="button button--primary order-close-button"
                        disabled={closingOrder || data.items.length === 0}
                        onClick={() => void handleCloseOrder()}
                      >
                        {closingOrder ? <RefreshCw size={18} className="icon-spin" /> : <CircleDollarSign size={18} />}
                        {closingOrder ? "Fechando conta..." : "Fechar conta"}
                      </button>
                      {data.items.length === 0 && (
                        <button
                          className="button button--danger order-cancel-button"
                          onClick={() => { setActionError(null); setCancelModalOpen(true); }}
                        >
                          <Ban size={18} />
                          Cancelar atendimento
                        </button>
                      )}
                    </div>
                  ) : isPayment ? (
                    <button
                      className="button button--success order-close-button"
                      onClick={() => { setActionError(null); setPaymentModalOpen(true); }}
                    >
                      <CircleDollarSign size={18} />
                      Receber pagamento
                    </button>
                  ) : (
                    <>
                      <div className="order-payment-next-step order-payment-next-step--ready">
                        <Check size={22} />
                        <span>Pagamento concluído · mesa pronta para liberação</span>
                      </div>
                      <button
                        className="button button--success order-close-button"
                        disabled={releasingTable}
                        onClick={() => void handleReleaseTable()}
                      >
                        {releasingTable ? (
                          <RefreshCw size={18} className="icon-spin" />
                        ) : (
                          <DoorOpen size={18} />
                        )}
                        {releasingTable ? "Liberando mesa..." : "Liberar mesa"}
                      </button>
                    </>
                  )}

                  {(data.payments ?? []).length > 0 && (
                    <div className="order-payment-history">
                      <strong>Pagamentos</strong>
                      {(data.payments ?? []).map(payment => (
                        <div key={payment.id}>
                          <span>{({ CASH: "Dinheiro", PIX: "PIX", TEF_CREDIT: "Crédito", TEF_DEBIT: "Débito", COURTESY: "Cortesia" } as const)[payment.method]}</span>
                          <b>{formatCurrency(payment.amount)}</b>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="order-summary-note">
                    {data.order
                      ? `Comanda ${data.order.id.slice(0, 8).toUpperCase()}`
                      : "Comanda vazia — pronta para receber itens."}
                  </p>
                </aside>
              </div>
            </>
          )}
        </div>
      </section>

      <TablePaymentModal
        open={paymentModalOpen && Boolean(isPayment)}
        total={data?.balance ?? data?.total ?? 0}
        submitting={payingOrder}
        error={actionError}
        onClose={() => { if (!payingOrder) { setActionError(null); setPaymentModalOpen(false); } }}
        onConfirm={payments => void handlePayment(payments)}
      />

      <CancelOrderModal
        open={cancelModalOpen && Boolean(isEditable) && (data?.items.length ?? 0) === 0}
        submitting={cancellingOrder}
        error={cancelModalOpen ? actionError : null}
        onClose={() => {
          if (!cancellingOrder) {
            setActionError(null);
            setCancelModalOpen(false);
          }
        }}
        onConfirm={reason => void handleCancelOrder(reason)}
      />

      <AddProductModal
        open={productModalOpen && Boolean(isEditable)}
        submitting={addingProduct}
        submitError={actionError}
        onClose={() => {
          setActionError(null);
          setProductModalOpen(false);
        }}
        onConfirm={handleAddProduct}
      />
    </main>
  );
}
