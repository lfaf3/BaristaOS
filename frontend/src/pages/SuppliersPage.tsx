import { Building2, MapPin, Pencil, Plus, RefreshCw, Search, Store, Trash2, Truck, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { useToast } from "../components/feedback/ToastProvider";
import { normalizeApiError } from "../services/api/api-error";
import * as suppliersService from "../services/api/suppliers.service";

type Supplier = {
  id: string;
  corporateName: string;
  tradeName: string;
  document: string;
  contactName?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  zipCode?: string | null;
  address?: string | null;
  number?: string | null;
  complement?: string | null;
  district?: string | null;
  city?: string | null;
  state?: string | null;
  notes?: string | null;
  active?: boolean;
};

type SupplierForm = Omit<Supplier, "id">;

const blank: SupplierForm = {
  corporateName: "",
  tradeName: "",
  document: "",
  contactName: "",
  phone: "",
  whatsapp: "",
  email: "",
  zipCode: "",
  address: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
  notes: "",
  active: true,
};

export default function SuppliersPage() {
  const toast = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<Supplier | "new" | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await suppliersService.list();
      setSuppliers(data);
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    if (!query) return suppliers;
    return suppliers.filter((supplier) =>
      [supplier.tradeName, supplier.corporateName, supplier.document, supplier.city, supplier.contactName]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("pt-BR").includes(query)),
    );
  }, [search, suppliers]);

  const active = suppliers.filter((supplier) => supplier.active !== false).length;
  const cities = new Set(suppliers.map((supplier) => supplier.city).filter(Boolean)).size;
  const contacts = suppliers.filter((supplier) => supplier.phone || supplier.whatsapp || supplier.email).length;

  async function removeSupplier(supplier: Supplier) {
    if (!window.confirm(`Desativar o fornecedor “${supplier.tradeName}”?`)) return;
    try {
      await suppliersService.remove(supplier.id);
      toast.success("Fornecedor desativado.");
      await load();
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
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

        <div className="dashboard-content suppliers-page">
          <div className="page-heading">
            <div>
              <span className="eyebrow">Compras e abastecimento</span>
              <h1>Fornecedores</h1>
              <p>Cadastre parceiros comerciais e centralize os contatos de compra da cafeteria.</p>
            </div>
            <button className="button button--primary" onClick={() => setEditor("new")}>
              <Plus size={17} />
              Novo fornecedor
            </button>
          </div>

          <div className="suppliers-summary">
            <Summary icon={Truck} label="Fornecedores" value={String(suppliers.length)} />
            <Summary icon={Store} label="Ativos" value={String(active)} />
            <Summary icon={MapPin} label="Cidades" value={String(cities)} />
            <Summary icon={Users} label="Com contato" value={String(contacts)} />
          </div>

          <div className="suppliers-toolbar">
            <label className="suppliers-search">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome, CNPJ, contato ou cidade"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} title="Limpar busca">
                  <X size={15} />
                </button>
              )}
            </label>
            <span>{filtered.length} resultado{filtered.length === 1 ? "" : "s"}</span>
          </div>

          <section className="suppliers-table-card">
            <div className="suppliers-table-wrap">
              <table className="suppliers-table">
                <thead>
                  <tr>
                    <th>Fornecedor</th>
                    <th>Documento</th>
                    <th>Contato</th>
                    <th>Localização</th>
                    <th>Status</th>
                    <th aria-label="Ações" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((supplier) => (
                    <tr key={supplier.id}>
                      <td>
                        <strong>{supplier.tradeName}</strong>
                        <span>{supplier.corporateName}</span>
                      </td>
                      <td>{formatDocument(supplier.document)}</td>
                      <td>
                        <strong>{supplier.contactName || "—"}</strong>
                        <span>{supplier.whatsapp || supplier.phone || supplier.email || "Sem contato"}</span>
                      </td>
                      <td>
                        {supplier.city ? `${supplier.city}${supplier.state ? `/${supplier.state}` : ""}` : "—"}
                      </td>
                      <td>
                        <span className={supplier.active === false ? "status-pill status-pill--inactive" : "status-pill"}>
                          {supplier.active === false ? "Inativo" : "Ativo"}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button title="Editar" onClick={() => setEditor(supplier)}>
                            <Pencil size={16} />
                          </button>
                          <button title="Desativar" onClick={() => void removeSupplier(supplier)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!loading && !filtered.length && (
                    <tr>
                      <td colSpan={6}>
                        <div className="suppliers-empty">
                          <Building2 size={36} />
                          <strong>Nenhum fornecedor encontrado</strong>
                          <span>Cadastre o primeiro fornecedor ou ajuste o termo da pesquisa.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>

      {editor && (
        <SupplierModal
          supplier={editor === "new" ? null : editor}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
            void load();
          }}
        />
      )}
    </main>
  );
}

function Summary({ icon: Icon, label, value }: { icon: typeof Truck; label: string; value: string }) {
  return (
    <div className="suppliers-summary-card">
      <Icon size={21} />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function SupplierModal({ supplier, onClose, onSaved }: { supplier: Supplier | null; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [form, setForm] = useState<SupplierForm>(supplier ? { ...blank, ...supplier } : blank);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof SupplierForm>(field: K, value: SupplierForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function save() {
    if (!form.tradeName.trim() || !form.corporateName.trim() || !form.document.trim()) {
      toast.warning("Informe nome fantasia, razão social e documento.");
      return;
    }

    setSaving(true);
    try {
      const payload = cleanPayload(form);
      if (supplier) await suppliersService.update(supplier.id, payload);
      else await suppliersService.create(payload);
      toast.success(supplier ? "Fornecedor atualizado." : "Fornecedor cadastrado.");
      onSaved();
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card supplier-modal">
        <header>
          <div>
            <span className="eyebrow">Fornecedores</span>
            <h2>{supplier ? "Editar fornecedor" : "Novo fornecedor"}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar">
            <X />
          </button>
        </header>

        <div className="supplier-form">
          <Field label="Nome fantasia *" value={form.tradeName} onChange={(value) => set("tradeName", value)} />
          <Field label="Razão social *" value={form.corporateName} onChange={(value) => set("corporateName", value)} />
          <Field label="CNPJ/CPF *" value={form.document} onChange={(value) => set("document", value)} />
          <Field label="Pessoa de contato" value={form.contactName || ""} onChange={(value) => set("contactName", value)} />
          <Field label="Telefone" value={form.phone || ""} onChange={(value) => set("phone", value)} />
          <Field label="WhatsApp" value={form.whatsapp || ""} onChange={(value) => set("whatsapp", value)} />
          <Field label="E-mail" type="email" value={form.email || ""} onChange={(value) => set("email", value)} />
          <Field label="CEP" value={form.zipCode || ""} onChange={(value) => set("zipCode", value)} />
          <Field label="Endereço" value={form.address || ""} onChange={(value) => set("address", value)} wide />
          <Field label="Número" value={form.number || ""} onChange={(value) => set("number", value)} />
          <Field label="Complemento" value={form.complement || ""} onChange={(value) => set("complement", value)} />
          <Field label="Bairro" value={form.district || ""} onChange={(value) => set("district", value)} />
          <Field label="Cidade" value={form.city || ""} onChange={(value) => set("city", value)} />
          <Field label="UF" value={form.state || ""} onChange={(value) => set("state", value.toUpperCase().slice(0, 2))} />
          <label className="supplier-form__wide">
            <span>Observações</span>
            <textarea rows={3} value={form.notes || ""} onChange={(event) => set("notes", event.target.value)} />
          </label>
        </div>

        <footer>
          <button className="button button--soft" type="button" onClick={onClose}>Cancelar</button>
          <button className="button button--primary" type="button" disabled={saving} onClick={() => void save()}>
            {saving ? "Salvando..." : "Salvar fornecedor"}
          </button>
        </footer>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", wide = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; wide?: boolean }) {
  return (
    <label className={wide ? "supplier-form__wide" : undefined}>
      <span>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function cleanPayload(form: SupplierForm): suppliersService.SupplierInput {
  return Object.fromEntries(
    Object.entries(form).map(([key, value]) => [key, typeof value === "string" ? value.trim() || null : value]),
  ) as unknown as suppliersService.SupplierInput;
}

function formatDocument(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 14) return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  if (digits.length === 11) return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  return value;
}
