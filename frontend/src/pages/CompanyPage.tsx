import { Building2, Contact, Image, MapPin, Printer, RefreshCw, Save, Settings2, Upload, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useCompany } from "../app/CompanyContext";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { useToast } from "../components/feedback/ToastProvider";
import { normalizeApiError } from "../services/api/api-error";
import { companyService, type UpdateCompanyInput } from "../services/api/company.service";

type Tab = "company" | "address" | "contact" | "branding" | "print" | "system";
const tabs: Array<{ id: Tab; label: string; icon: typeof Building2 }> = [
  { id: "company", label: "Empresa", icon: Building2 },
  { id: "address", label: "Endereço", icon: MapPin },
  { id: "contact", label: "Contato", icon: Contact },
  { id: "branding", label: "Identidade", icon: Image },
  { id: "print", label: "Impressão", icon: Printer },
  { id: "system", label: "Sistema", icon: Settings2 }
];

const THEME_PRESETS = [
  { name: "Espresso", color: "#3F2C27" },
  { name: "Espresso Dark", color: "#2D211E" }
] as const;

const blank: UpdateCompanyInput = {
  name: "", tradeName: "", document: "", stateRegistration: null, taxRegime: null, cnae: null,
  postalCode: null, street: null, addressNumber: null, addressComplement: null, neighborhood: null,
  city: null, state: null, phone: null, whatsapp: null, email: null, website: null, displayName: null,
  logoDataUrl: null, primaryColor: "#3F2C27", receiptFooter: "Obrigado pela preferência!",
  printLogo: true, printDocument: true, printAddress: true, printPhone: true,
  language: "pt-BR", currency: "BRL", timezone: "America/Fortaleza"
};

function Field({ label, value, onChange, placeholder, type = "text", maxLength }: { label: string; value: string | null; onChange: (v: string) => void; placeholder?: string; type?: string; maxLength?: number }) {
  return <label className="settings-field"><span>{label}</span><input type={type} value={value ?? ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} /></label>;
}

export function CompanyPage() {
  const { company, loading, setCompany, refresh } = useCompany();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("company");
  const [form, setForm] = useState<UpdateCompanyInput>(blank);
  const [saving, setSaving] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => { if (company) { const { id: _id, updatedAt: _updatedAt, ...data } = company; setForm(data); } }, [company]);
  const update = <K extends keyof UpdateCompanyInput>(key: K, value: UpdateCompanyInput[K]) => setForm(current => ({ ...current, [key]: value }));
  const title = useMemo(() => tabs.find(tab => tab.id === activeTab)?.label ?? "Configurações", [activeTab]);

  async function save() {
    if (!form.name.trim() || !form.tradeName.trim() || !form.document.trim()) {
      toast.warning("Preencha Razão Social, Nome Fantasia e CNPJ."); setActiveTab("company"); return;
    }
    setSaving(true);
    try {
      const saved = await companyService.update(form);
      setCompany(saved);
      toast.success("Configurações da loja salvas com sucesso.");
    } catch (cause) { toast.error(normalizeApiError(cause).message); }
    finally { setSaving(false); }
  }

  function chooseLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/^image\/(png|jpeg|webp)$/)) { toast.warning("Use uma imagem PNG, JPG ou WEBP."); return; }
    if (file.size > 1_500_000) { toast.warning("A logomarca deve ter no máximo 1,5 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => update("logoDataUrl", String(reader.result));
    reader.readAsDataURL(file);
  }

  return <main className="dashboard-layout">
    <Sidebar />
    <section className="dashboard-main">
      <Topbar actions={<button className="button button--soft" onClick={() => void refresh()} disabled={loading || saving}><RefreshCw size={17} className={loading ? "icon-spin" : undefined} />Recarregar</button>} />
      <div className="dashboard-content company-settings-page">
        <div className="page-heading settings-heading"><div><span className="eyebrow">Administração</span><h1>Configurações da loja</h1><p>Personalize os dados, a identidade e as impressões desta instalação.</p></div><button className="button button--primary" onClick={() => void save()} disabled={saving || loading}><Save size={17} />{saving ? "Salvando..." : "Salvar alterações"}</button></div>
        <div className="settings-shell">
          <nav className="settings-tabs" aria-label="Seções das configurações">{tabs.map(tab => { const Icon = tab.icon; return <button key={tab.id} type="button" className={activeTab === tab.id ? "settings-tab settings-tab--active" : "settings-tab"} onClick={() => setActiveTab(tab.id)}><Icon size={18} />{tab.label}</button>; })}</nav>
          <section className="settings-panel"><div className="settings-panel__heading"><h2>{title}</h2><span>Os campos marcados com * são obrigatórios.</span></div>
            {activeTab === "company" && <div className="settings-grid"><Field label="Razão Social *" value={form.name} onChange={v => update("name", v)} /><Field label="Nome Fantasia *" value={form.tradeName} onChange={v => update("tradeName", v)} /><Field label="CNPJ *" value={form.document} onChange={v => update("document", v)} placeholder="00.000.000/0000-00" /><Field label="Inscrição Estadual" value={form.stateRegistration} onChange={v => update("stateRegistration", v)} /><label className="settings-field"><span>Regime Tributário</span><select value={form.taxRegime ?? ""} onChange={e => update("taxRegime", e.target.value)}><option value="">Selecione</option><option>Simples Nacional</option><option>Lucro Presumido</option><option>Lucro Real</option><option>MEI</option></select></label><Field label="CNAE" value={form.cnae} onChange={v => update("cnae", v)} /></div>}
            {activeTab === "address" && <div className="settings-grid"><Field label="CEP" value={form.postalCode} onChange={v => update("postalCode", v)} /><Field label="Logradouro" value={form.street} onChange={v => update("street", v)} /><Field label="Número" value={form.addressNumber} onChange={v => update("addressNumber", v)} /><Field label="Complemento" value={form.addressComplement} onChange={v => update("addressComplement", v)} /><Field label="Bairro" value={form.neighborhood} onChange={v => update("neighborhood", v)} /><Field label="Cidade" value={form.city} onChange={v => update("city", v)} /><Field label="UF" value={form.state} onChange={v => update("state", v.toUpperCase().slice(0, 2))} maxLength={2} /></div>}
            {activeTab === "contact" && <div className="settings-grid"><Field label="Telefone" value={form.phone} onChange={v => update("phone", v)} /><Field label="WhatsApp" value={form.whatsapp} onChange={v => update("whatsapp", v)} /><Field label="E-mail" type="email" value={form.email} onChange={v => update("email", v)} /><Field label="Site" value={form.website} onChange={v => update("website", v)} placeholder="https://" /></div>}
            {activeTab === "branding" && <div className="branding-layout"><div className="logo-editor"><span className="settings-label">Logomarca</span><div className="logo-preview">{form.logoDataUrl ? <img src={form.logoDataUrl} alt="Prévia da logomarca" /> : <Image size={42} />}</div><input ref={fileInput} hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseLogo} /><div className="logo-actions"><button type="button" className="button button--soft" onClick={() => fileInput.current?.click()}><Upload size={16} />Selecionar imagem</button>{form.logoDataUrl && <button type="button" className="button button--soft" onClick={() => update("logoDataUrl", null)}><X size={16} />Remover</button>}</div><small>PNG, JPG ou WEBP, até 1,5 MB.</small></div><div className="settings-grid"><Field label="Nome exibido no sistema" value={form.displayName} onChange={v => update("displayName", v)} placeholder={form.tradeName || "Nome da cafeteria"} /><label className="settings-field"><span>Tema principal</span><div className="theme-presets">{THEME_PRESETS.map(theme => <button key={theme.name} type="button" className={form.primaryColor.toUpperCase() === theme.color ? "theme-preset theme-preset--active" : "theme-preset"} onClick={() => update("primaryColor", theme.color)}><i style={{ background: theme.color }} aria-hidden="true" /><span>{theme.name}</span><small>{theme.color}</small></button>)}</div><span className="settings-label settings-label--subtle">Cor personalizada</span><div className="color-field"><input type="color" value={form.primaryColor} onChange={e => update("primaryColor", e.target.value)} /><input value={form.primaryColor} onChange={e => update("primaryColor", e.target.value)} maxLength={7} /></div></label></div></div>}
            {activeTab === "print" && <div className="print-settings"><label className="settings-field settings-field--wide"><span>Mensagem de rodapé</span><textarea value={form.receiptFooter} onChange={e => update("receiptFooter", e.target.value)} maxLength={240} rows={4} /></label><div className="settings-switches"><Switch label="Exibir logomarca" checked={form.printLogo} onChange={v => update("printLogo", v)} /><Switch label="Exibir CNPJ" checked={form.printDocument} onChange={v => update("printDocument", v)} /><Switch label="Exibir endereço" checked={form.printAddress} onChange={v => update("printAddress", v)} /><Switch label="Exibir telefone" checked={form.printPhone} onChange={v => update("printPhone", v)} /></div></div>}
            {activeTab === "system" && <div className="settings-grid"><label className="settings-field"><span>Idioma</span><select value={form.language} onChange={e => update("language", e.target.value as "pt-BR")}><option value="pt-BR">Português (Brasil)</option></select></label><label className="settings-field"><span>Moeda</span><select value={form.currency} onChange={e => update("currency", e.target.value as "BRL")}><option value="BRL">Real brasileiro (R$)</option></select></label><label className="settings-field"><span>Fuso horário</span><select value={form.timezone} onChange={e => update("timezone", e.target.value)}><option value="America/Fortaleza">Fortaleza / João Pessoa</option><option value="America/Sao_Paulo">Brasília / São Paulo</option><option value="America/Manaus">Manaus</option><option value="America/Rio_Branco">Rio Branco</option></select></label></div>}
          </section>
        </div>
      </div>
    </section>
  </main>;
}

function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="settings-switch"><span>{label}</span><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} /><i aria-hidden="true" /></label>;
}
