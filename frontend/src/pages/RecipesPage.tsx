import {
  BookOpen,
  ChefHat,
  Eye,
  PackageSearch,
  Pencil,
  Plus,
  RefreshCw,
  Scale,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { useToast } from "../components/feedback/ToastProvider";
import { normalizeApiError } from "../services/api/api-error";
import {
  recipesService,
  type Recipe,
} from "../services/api/recipes.service";
import {
  inventoryService,
  type InventoryItem,
  type InventoryUnit,
} from "../services/api/inventory.service";
import {
  productsService,
  type OrderProduct,
} from "../services/api/products.service";
import { formatCurrency } from "../utils/currency";

const unitLabels: Record<InventoryUnit, string> = {
  KG: "kg",
  G: "g",
  L: "L",
  ML: "mL",
  UNIT: "un",
};

export function RecipesPage() {
  const toast = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 1,
  });

  async function load(page = 1, query = search, filter = activeFilter) {
    setLoading(true);
    try {
      const response = await recipesService.list({
        q: query.trim() || undefined,
        active: filter === "all" ? undefined : filter === "active",
        page,
        pageSize: pagination.pageSize,
      });
      setRecipes(response.data);
      setPagination(response.pagination);
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(1, "", "all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = useMemo(() => {
    const active = recipes.filter((recipe) => recipe.active).length;
    const ingredients = recipes.reduce((sum, recipe) => sum + recipe.items.length, 0);
    const estimatedCost = recipes.reduce((sum, recipe) => sum + recipeCost(recipe), 0);
    return { active, ingredients, estimatedCost };
  }, [recipes]);

  async function deactivate(recipe: Recipe) {
    if (!window.confirm(`Desativar a ficha técnica “${recipe.name}”?`)) return;

    setWorkingId(recipe.id);
    try {
      await recipesService.remove(recipe.id);
      toast.success("Ficha técnica desativada.");
      if (selectedId === recipe.id) setSelectedId(null);
      await load(pagination.page);
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    } finally {
      setWorkingId(null);
    }
  }

  function updateActiveFilter(value: "all" | "active" | "inactive") {
    setActiveFilter(value);
    void load(1, search, value);
  }

  return (
    <main className="dashboard-layout">
      <Sidebar />
      <section className="dashboard-main">
        <Topbar
          actions={
            <button className="button button--soft" onClick={() => void load(pagination.page)} disabled={loading}>
              <RefreshCw size={17} className={loading ? "icon-spin" : undefined} />
              Atualizar
            </button>
          }
        />

        <div className="dashboard-content recipes-page">
          <div className="page-heading">
            <div>
              <span className="eyebrow">Produção e custos</span>
              <h1>Fichas técnicas</h1>
              <p>Organize ingredientes, rendimentos e perdas dos produtos vendidos.</p>
            </div>
            <button
              className="button button--primary"
              onClick={() => setEditingRecipe(null)}
            >
              <Plus size={17} />
              Nova ficha técnica
            </button>
          </div>

          <div className="recipes-summary">
            <Summary icon={BookOpen} label="Fichas encontradas" value={String(pagination.totalCount)} />
            <Summary icon={ChefHat} label="Ativas nesta página" value={String(summary.active)} />
            <Summary icon={PackageSearch} label="Ingredientes listados" value={String(summary.ingredients)} />
            <Summary icon={Scale} label="Custo teórico da página" value={formatCurrency(summary.estimatedCost)} />
          </div>

          <section className="recipes-toolbar-card">
            <div className="recipes-toolbar">
              <label className="recipes-search">
                <Search size={17} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && void load(1)}
                  placeholder="Buscar por receita, produto ou código"
                />
                {search && (
                  <button type="button" onClick={() => { setSearch(""); void load(1, ""); }} title="Limpar busca">
                    <X size={15} />
                  </button>
                )}
              </label>

              <select
                value={activeFilter}
                onChange={(event) => updateActiveFilter(event.target.value as "all" | "active" | "inactive")}
              >
                <option value="all">Todas as fichas</option>
                <option value="active">Somente ativas</option>
                <option value="inactive">Somente inativas</option>
              </select>

              <button className="button button--soft" type="button" onClick={() => void load(1)} disabled={loading}>
                Buscar
              </button>
            </div>
          </section>

          <section className="recipes-table-card">
            <div className="recipes-table-wrap">
              <table className="recipes-table">
                <thead>
                  <tr>
                    <th>Produto e receita</th>
                    <th>Ingredientes</th>
                    <th>Rendimento</th>
                    <th>Custo teórico</th>
                    <th>Status</th>
                    <th aria-label="Ações" />
                  </tr>
                </thead>
                <tbody>
                  {loading && !recipes.length && (
                    <tr>
                      <td colSpan={6}>
                        <div className="recipes-loading" role="status" aria-live="polite">
                          <RefreshCw size={25} className="icon-spin" />
                          <strong>Carregando fichas técnicas...</strong>
                          <span>Atualizando receitas, custos e rendimentos.</span>
                        </div>
                      </td>
                    </tr>
                  )}

                  {recipes.map((recipe) => (
                    <tr key={recipe.id}>
                      <td>
                        <strong>{recipe.product.name}</strong>
                        <span>{recipe.name} · {recipe.product.code}</span>
                      </td>
                      <td>
                        <strong>{recipe.items.length}</strong>
                        <span>{ingredientPreview(recipe)}</span>
                      </td>
                      <td>
                        {formatQuantity(recipe.yieldQuantity)} {unitLabels[recipe.yieldUnit]}
                      </td>
                      <td>{formatCurrency(recipeCost(recipe))}</td>
                      <td>
                        <span className={recipe.active ? "status-pill" : "status-pill status-pill--inactive"}>
                          {recipe.active ? "Ativa" : "Inativa"}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button title="Visualizar" onClick={() => setSelectedId(recipe.id)}>
                            <Eye size={16} />
                          </button>
                          <button
                            title="Editar"
                            onClick={() => setEditingRecipe(recipe)}
                          >
                            <Pencil size={16} />
                          </button>
                          {recipe.active && (
                            <button
                              title="Desativar"
                              onClick={() => void deactivate(recipe)}
                              disabled={workingId === recipe.id}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!loading && !recipes.length && (
                    <tr>
                      <td colSpan={6}>
                        <div className="recipes-empty">
                          <BookOpen size={38} />
                          <strong>Nenhuma ficha técnica encontrada</strong>
                          <span>Cadastre a primeira receita ou ajuste os filtros da pesquisa.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <footer className="recipes-pagination">
                <span>
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <div>
                  <button
                    className="button button--soft"
                    disabled={loading || pagination.page <= 1}
                    onClick={() => void load(pagination.page - 1)}
                  >
                    Anterior
                  </button>
                  <button
                    className="button button--soft"
                    disabled={loading || pagination.page >= pagination.totalPages}
                    onClick={() => void load(pagination.page + 1)}
                  >
                    Próxima
                  </button>
                </div>
              </footer>
            )}
          </section>
        </div>
      </section>

      {editingRecipe !== undefined && (
        <RecipeFormModal
          recipe={editingRecipe}
          onClose={() => setEditingRecipe(undefined)}
          onSaved={async (saved) => {
            setEditingRecipe(undefined);
            toast.success(editingRecipe ? "Ficha técnica atualizada com sucesso." : "Ficha técnica criada com sucesso.");
            await load(editingRecipe ? pagination.page : 1);
          }}
        />
      )}

      {selectedId && (
        <RecipeDetailsModal
          recipeId={selectedId}
          onClose={() => setSelectedId(null)}
          onEdit={(recipe) => {
            setSelectedId(null);
            setEditingRecipe(recipe);
          }}
        />
      )}
    </main>
  );
}

function Summary({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: string }) {
  return (
    <div className="recipes-summary-card">
      <Icon size={21} />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}


type RecipeDraftItem = {
  inventoryItemId: string;
  quantity: string;
  wastePercent: string;
};

function RecipeFormModal({
  recipe,
  onClose,
  onSaved,
}: {
  recipe: Recipe | null;
  onClose: () => void;
  onSaved: (recipe: Recipe) => Promise<void> | void;
}) {
  const toast = useToast();
  const [products, setProducts] = useState<OrderProduct[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);

  const [productId, setProductId] = useState(recipe?.productId ?? "");
  const [name, setName] = useState(recipe?.name ?? "");
  const [yieldQuantity, setYieldQuantity] = useState(
    recipe ? formatDecimalInput(recipe.yieldQuantity) : "1",
  );
  const [yieldUnit, setYieldUnit] = useState<InventoryUnit>(
    recipe?.yieldUnit ?? "UNIT",
  );
  const [notes, setNotes] = useState(recipe?.notes ?? "");
  const [items, setItems] = useState<RecipeDraftItem[]>(
    recipe?.items.length
      ? recipe.items
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((item) => ({
            inventoryItemId: item.inventoryItemId,
            quantity: formatDecimalInput(item.quantity),
            wastePercent: formatDecimalInput(item.wastePercent),
          }))
      : [{ inventoryItemId: "", quantity: "", wastePercent: "0" }],
  );

  useEffect(() => {
    Promise.all([productsService.list(), inventoryService.list()])
      .then(([productsResponse, inventoryResponse]) => {
        setProducts(productsResponse.data);
        setInventoryItems(inventoryResponse.data.filter((item) => item.active));
      })
      .catch((error) => toast.error(normalizeApiError(error).message))
      .finally(() => setLoadingOptions(false));
  }, [toast]);

  const theoreticalCost = useMemo(
    () =>
      items.reduce((sum, item) => {
        const inventoryItem = inventoryItems.find(
          (candidate) => candidate.id === item.inventoryItemId,
        );
        const quantity = parseDecimalInput(item.quantity);
        const waste = parseDecimalInput(item.wastePercent);
        if (!inventoryItem || !Number.isFinite(quantity) || quantity <= 0) return sum;
        return sum + quantity * (1 + Math.max(0, waste) / 100) * inventoryItem.unitCost;
      }, 0),
    [items, inventoryItems],
  );

  function updateItem(index: number, field: keyof RecipeDraftItem, value: string) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      { inventoryItemId: "", quantity: "", wastePercent: "0" },
    ]);
  }

  function removeItem(index: number) {
    setItems((current) =>
      current.length === 1
        ? [{ inventoryItemId: "", quantity: "", wastePercent: "0" }]
        : current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    const normalizedItems = items
      .filter((item) => item.inventoryItemId)
      .map((item, index) => ({
        inventoryItemId: item.inventoryItemId,
        quantity: parseDecimalInput(item.quantity),
        wastePercent: parseDecimalInput(item.wastePercent || "0"),
        sortOrder: index,
      }));

    if (!productId) return toast.warning("Selecione o produto.");
    if (!name.trim()) return toast.warning("Informe o nome da receita.");
    if (!Number.isFinite(parseDecimalInput(yieldQuantity)) || parseDecimalInput(yieldQuantity) <= 0) {
      return toast.warning("Informe um rendimento maior que zero.");
    }
    if (!normalizedItems.length) return toast.warning("Adicione pelo menos um ingrediente.");
    if (normalizedItems.some((item) => !Number.isFinite(item.quantity) || item.quantity <= 0)) {
      return toast.warning("Todas as quantidades devem ser maiores que zero.");
    }
    if (
      normalizedItems.some(
        (item) =>
          !Number.isFinite(item.wastePercent) ||
          item.wastePercent < 0 ||
          item.wastePercent > 100,
      )
    ) {
      return toast.warning("A perda deve estar entre 0% e 100%.");
    }
    if (new Set(normalizedItems.map((item) => item.inventoryItemId)).size !== normalizedItems.length) {
      return toast.warning("O mesmo ingrediente não pode ser incluído duas vezes.");
    }

    setSaving(true);
    try {
      const payload = {
        productId,
        name: name.trim(),
        yieldQuantity: parseDecimalInput(yieldQuantity),
        yieldUnit,
        notes: notes.trim() || null,
        active: recipe?.active ?? true,
        items: normalizedItems,
      };

      const saved = recipe
        ? await recipesService.update(recipe.id, payload)
        : await recipesService.create(payload);

      await onSaved(saved);
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
      <form className="recipe-form-modal" onSubmit={submit}>
        <header>
          <div>
            <span className="eyebrow">Produção e custos</span>
            <h2>{recipe ? "Editar ficha técnica" : "Nova ficha técnica"}</h2>
            <p>Defina o rendimento e a composição do produto vendido.</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Fechar">
            <X />
          </button>
        </header>

        <div className="recipe-form-content">
          <section className="recipe-form-grid">
            <label className="recipe-form-field recipe-form-field--wide">
              <span>Produto *</span>
              <select
                value={productId}
                onChange={(event) => {
                  setProductId(event.target.value);
                  const product = products.find((item) => item.id === event.target.value);
                  if (!name.trim() && product) setName(product.name);
                }}
                disabled={saving || loadingOptions || Boolean(recipe)}
              >
                <option value="">Selecione o produto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} · {product.code}
                  </option>
                ))}
              </select>
            </label>

            <label className="recipe-form-field recipe-form-field--wide">
              <span>Nome da receita *</span>
              <input value={name} onChange={(event) => setName(event.target.value)} disabled={saving} />
            </label>

            <label className="recipe-form-field">
              <span>Rendimento *</span>
              <input
                inputMode="decimal"
                value={yieldQuantity}
                onChange={(event) => setYieldQuantity(event.target.value)}
                disabled={saving}
              />
            </label>

            <label className="recipe-form-field">
              <span>Unidade do rendimento *</span>
              <select
                value={yieldUnit}
                onChange={(event) => setYieldUnit(event.target.value as InventoryUnit)}
                disabled={saving}
              >
                {Object.entries(unitLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
          </section>

          <section className="recipe-form-section">
            <div className="recipe-form-section-heading">
              <div>
                <h3>Ingredientes</h3>
                <p>Informe a quantidade usada e a perda estimada de cada insumo.</p>
              </div>
              <button
                className="button button--soft"
                type="button"
                onClick={addItem}
                disabled={saving || loadingOptions}
              >
                <Plus size={16} />
                Adicionar ingrediente
              </button>
            </div>

            <div className="recipe-form-items">
              {items.map((item, index) => {
                const inventoryItem = inventoryItems.find(
                  (candidate) => candidate.id === item.inventoryItemId,
                );
                const quantity = parseDecimalInput(item.quantity);
                const waste = parseDecimalInput(item.wastePercent);
                const subtotal =
                  inventoryItem && Number.isFinite(quantity)
                    ? quantity * (1 + Math.max(0, waste || 0) / 100) * inventoryItem.unitCost
                    : 0;

                return (
                  <div className="recipe-form-item" key={index}>
                    <label className="recipe-form-field recipe-form-field--ingredient">
                      <span>Ingrediente *</span>
                      <select
                        value={item.inventoryItemId}
                        onChange={(event) => updateItem(index, "inventoryItemId", event.target.value)}
                        disabled={saving || loadingOptions}
                      >
                        <option value="">
                          {loadingOptions ? "Carregando insumos..." : "Selecione o insumo"}
                        </option>
                        {inventoryItems.map((candidate) => (
                          <option key={candidate.id} value={candidate.id}>
                            {candidate.name} · {candidate.category}
                          </option>
                        ))}
                      </select>
                      {inventoryItem && (
                        <small>
                          Unidade: {unitLabels[inventoryItem.unit]} · Custo: {formatCurrency(inventoryItem.unitCost)}
                        </small>
                      )}
                    </label>

                    <label className="recipe-form-field">
                      <span>Quantidade *</span>
                      <input
                        inputMode="decimal"
                        value={item.quantity}
                        onChange={(event) => updateItem(index, "quantity", event.target.value)}
                        disabled={saving}
                      />
                    </label>

                    <label className="recipe-form-field">
                      <span>Perda %</span>
                      <input
                        inputMode="decimal"
                        value={item.wastePercent}
                        onChange={(event) => updateItem(index, "wastePercent", event.target.value)}
                        disabled={saving}
                      />
                    </label>

                    <div className="recipe-form-cost">
                      <span>Custo</span>
                      <strong>{formatCurrency(subtotal)}</strong>
                    </div>

                    <button
                      className="recipe-form-remove"
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={saving}
                      title="Remover ingrediente"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <label className="recipe-form-field">
              <span>Observações</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                maxLength={1000}
                disabled={saving}
                placeholder="Modo de preparo, observações de produção ou padrão de montagem."
              />
            </label>
          </section>
        </div>

        <footer>
          <div className="recipe-form-total">
            <span>Custo teórico da receita</span>
            <strong>{formatCurrency(theoreticalCost)}</strong>
          </div>
          <div>
            <button className="button button--ghost" type="button" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button className="button button--primary" type="submit" disabled={saving || loadingOptions}>
              <ChefHat size={17} />
              {saving ? "Salvando..." : "Salvar ficha técnica"}
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}

function parseDecimalInput(value: string) {
  return Number(value.trim().replace(/\s/g, "").replace(",", "."));
}

function formatDecimalInput(value: number) {
  return String(Number(value.toFixed(3))).replace(".", ",");
}

function RecipeDetailsModal({
  recipeId,
  onClose,
  onEdit,
}: {
  recipeId: string;
  onClose: () => void;
  onEdit: (recipe: Recipe) => void;
}) {
  const toast = useToast();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    recipesService
      .get(recipeId)
      .then((response) => active && setRecipe(response))
      .catch((error) => {
        toast.error(normalizeApiError(error).message);
        onClose();
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [onClose, recipeId, toast]);

  const cost = recipe ? recipeCost(recipe) : 0;
  const costPerYieldUnit = recipe && recipe.yieldQuantity > 0 ? cost / recipe.yieldQuantity : 0;
  const unavailableItems = recipe?.items.filter(
    (item) => item.inventoryItem.currentStock < effectiveRecipeItemQuantity(item),
  ) ?? [];

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="recipe-details-modal" role="dialog" aria-modal="true" aria-labelledby="recipe-details-title">
        {loading || !recipe ? (
          <div className="recipe-details-loading" role="status" aria-live="polite">
            <RefreshCw size={28} className="icon-spin" />
            <strong>Carregando ficha técnica...</strong>
            <span>Buscando a composição mais recente da receita.</span>
          </div>
        ) : (
          <>
            <header>
              <div>
                <span className="eyebrow">Ficha técnica completa</span>
                <h2 id="recipe-details-title">{recipe.product.name}</h2>
                <p>{recipe.name} · {recipe.product.code}</p>
              </div>
              <button type="button" onClick={onClose} aria-label="Fechar">
                <X />
              </button>
            </header>

            <div className="recipe-details-content">
              <div className="recipe-details-metrics">
                <div>
                  <span>Rendimento</span>
                  <strong>{formatQuantity(recipe.yieldQuantity)} {unitLabels[recipe.yieldUnit]}</strong>
                </div>
                <div>
                  <span>Ingredientes</span>
                  <strong>{recipe.items.length}</strong>
                </div>
                <div>
                  <span>Custo teórico</span>
                  <strong>{formatCurrency(cost)}</strong>
                </div>
                <div>
                  <span>Custo por unidade</span>
                  <strong>{formatCurrency(costPerYieldUnit)}</strong>
                </div>
              </div>

              <div className="recipe-deduction-readiness" data-auto-deduction-ready="true">
                <div>
                  <span className="eyebrow">Sprint v3.4.1</span>
                  <strong>Consumo de insumos preparado</strong>
                  <p>As quantidades efetivas já consideram a perda e poderão alimentar a baixa automática por venda.</p>
                </div>
                <span className={unavailableItems.length ? "status-pill status-pill--inactive" : "status-pill"}>
                  {unavailableItems.length ? `${unavailableItems.length} insumo(s) com estoque insuficiente` : "Estoque compatível"}
                </span>
              </div>

              <section className="recipe-ingredients-card">
                <div className="recipe-ingredients-heading">
                  <div>
                    <span className="eyebrow">Composição</span>
                    <h3>Ingredientes e consumo teórico</h3>
                  </div>
                </div>

                <div className="recipe-ingredients-list">
                  {recipe.items.map((item, index) => {
                    const effectiveQuantity = effectiveRecipeItemQuantity(item);
                    const hasEnoughStock = item.inventoryItem.currentStock >= effectiveQuantity;
                    return (
                      <div
                        key={item.id}
                        className="recipe-ingredient-row"
                        data-inventory-item-id={item.inventoryItemId}
                        data-effective-quantity={effectiveQuantity}
                      >
                        <span className="recipe-ingredient-order">{index + 1}</span>
                        <div>
                          <strong>{item.inventoryItem.name}</strong>
                          <span>{item.inventoryItem.category}</span>
                        </div>
                        <div>
                          <span>Quantidade base</span>
                          <strong>{formatQuantity(item.quantity)} {unitLabels[item.inventoryItem.unit]}</strong>
                        </div>
                        <div>
                          <span>Consumo c/ perda</span>
                          <strong>{formatQuantity(effectiveQuantity)} {unitLabels[item.inventoryItem.unit]}</strong>
                        </div>
                        <div>
                          <span>Custo</span>
                          <strong>{formatCurrency(recipeItemCost(item))}</strong>
                          <small className={hasEnoughStock ? "recipe-stock-ok" : "recipe-stock-warning"}>
                            Estoque: {formatQuantity(item.inventoryItem.currentStock)} {unitLabels[item.inventoryItem.unit]}
                          </small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {recipe.notes ? (
                <div className="recipe-notes">
                  <span>Observações</span>
                  <p>{recipe.notes}</p>
                </div>
              ) : (
                <div className="recipe-notes recipe-notes--empty">
                  <span>Observações</span>
                  <p>Nenhuma orientação adicional foi cadastrada para esta ficha técnica.</p>
                </div>
              )}
            </div>

            <footer>
              <div className="recipe-details-status">
                <span className={recipe.active ? "status-pill" : "status-pill status-pill--inactive"}>
                  {recipe.active ? "Ficha ativa" : "Ficha inativa"}
                </span>
                <small>Atualizada em {formatDateTime(recipe.updatedAt)}</small>
              </div>
              <div>
                <button className="button button--ghost" type="button" onClick={onClose}>Fechar</button>
                <button className="button button--primary" type="button" onClick={() => onEdit(recipe)}>
                  <Pencil size={16} />
                  Editar ficha
                </button>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

function effectiveRecipeItemQuantity(item: Recipe["items"][number]) {
  return item.quantity * (1 + Math.max(0, item.wastePercent) / 100);
}

function recipeItemCost(item: Recipe["items"][number]) {
  return effectiveRecipeItemQuantity(item) * item.inventoryItem.unitCost;
}

function recipeCost(recipe: Recipe) {
  return recipe.items.reduce((sum, item) => sum + recipeItemCost(item), 0);
}

function ingredientPreview(recipe: Recipe) {
  if (!recipe.items.length) return "Sem ingredientes";
  const names = recipe.items.slice(0, 2).map((item) => item.inventoryItem.name);
  const remaining = recipe.items.length - names.length;
  return `${names.join(", ")}${remaining > 0 ? ` +${remaining}` : ""}`;
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(value);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
