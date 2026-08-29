import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState, PageHeader } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Field, Input, NativeSelect, Textarea } from "@/components/ui/input";
import {
  addCategory,
  archiveProduct,
  duplicateProduct,
  importProducts,
  listCategories,
  listProducts,
  saveProduct,
} from "@/lib/inventory/server";
import type { Product } from "@/lib/inventory/types";
import { lastCategoryId, setLastCategoryId } from "@/lib/prefs";
import { twd } from "@/lib/utils";

export const Route = createFileRoute("/products")({
  loader: async () => {
    const [categories, products] = await Promise.all([
      listCategories(),
      listProducts({ data: { includeInactive: true } }),
    ]);
    return { categories, products };
  },
  component: ProductsPage,
});

function ProductsPage() {
  const qc = useQueryClient();
  const seeded = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(0);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [quickName, setQuickName] = useState("");
  const [quickPrice, setQuickPrice] = useState("");
  const [quickCat, setQuickCat] = useState(() => lastCategoryId());
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");

  const cats = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
    initialData: seeded.categories,
  });
  const products = useQuery({
    queryKey: ["products"],
    queryFn: () => listProducts({ data: { includeInactive: true } }),
    initialData: seeded.products,
  });

  const save = useMutation({
    mutationFn: saveProduct,
    onSuccess: (r) => {
      toast.success(r.sku ? `已儲存 ${r.sku}` : "商品已儲存");
      setEditing(null);
      setQuickName("");
      setQuickPrice("");
      void qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const dup = useMutation({
    mutationFn: duplicateProduct,
    onSuccess: (r) => {
      toast.success(`已複製為 ${r.sku}`);
      void qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const importer = useMutation({
    mutationFn: importProducts,
    onSuccess: (r) => {
      toast.success(`已匯入 ${r.created} 款`);
      setPasteOpen(false);
      setPasteText("");
      void qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const archive = useMutation({
    mutationFn: archiveProduct,
    onSuccess: () => {
      toast.success("已更新上架狀態");
      void qc.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (products.data ?? []).filter((p) => {
      if (!showInactive && !p.isActive) return false;
      if (cat && p.categoryId !== cat) return false;
      if (!s) return true;
      return (
        p.name.toLowerCase().includes(s) ||
        p.sku.toLowerCase().includes(s) ||
        p.color.toLowerCase().includes(s) ||
        p.categoryName.toLowerCase().includes(s)
      );
    });
  }, [products.data, q, cat, showInactive]);

  return (
    <div>
      <PageHeader
        kicker="Catalog"
        title="商品"
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setPasteOpen(true)}>
              貼上清單
            </Button>
            <Button size="sm" onClick={() => setEditing({})}>
              <Plus className="size-4" />
              完整資料
            </Button>
          </div>
        }
      />

      <form
        className="mb-4 flex flex-col gap-2 rounded-xl bg-surface p-3 shadow-[var(--shadow-card)] sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          if (!quickName.trim()) {
            toast.error("填名稱就能新增");
            return;
          }
          const cat = quickCat || cats.data?.[0]?.id;
          save.mutate({
            data: {
              name: quickName.trim(),
              price: Number(quickPrice) || 0,
              categoryId: cat,
            },
          });
          if (cat) setLastCategoryId(cat);
        }}
      >
        <Field label="快速新增（名稱＋售價，貨號自動編）" className="flex-1">
          <Input
            value={quickName}
            onChange={(e) => setQuickName(e.target.value)}
            placeholder="例如：醋酸方形抓夾"
          />
        </Field>
        <Field label="售價" className="sm:w-28">
          <Input
            inputMode="decimal"
            value={quickPrice}
            onChange={(e) => setQuickPrice(e.target.value)}
            placeholder="180"
          />
        </Field>
        <Field label="分類" className="sm:w-32">
          <NativeSelect
            value={quickCat || cats.data?.[0]?.id || 0}
            onChange={(e) => {
              const id = Number(e.target.value);
              setQuickCat(id);
              setLastCategoryId(id);
            }}
          >
            {(cats.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Button type="submit" disabled={save.isPending} className="sm:mb-0">
          {save.isPending ? "新增中…" : "加入"}
        </Button>
      </form>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜尋名稱、貨號、顏色"
            className="pl-9"
          />
        </div>
        <NativeSelect
          className="sm:w-40"
          value={cat}
          onChange={(e) => setCat(Number(e.target.value))}
        >
          <option value={0}>全部分類</option>
          {(cats.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </NativeSelect>
        <Button
          variant={showInactive ? "subtle" : "outline"}
          size="sm"
          onClick={() => setShowInactive((v) => !v)}
        >
          {showInactive ? "含已下架" : "僅上架"}
        </Button>
      </div>

      {products.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          title="還沒有商品"
          body="先新增髮夾、髮圈或耳環，之後進貨與銷貨就能自動扣補庫存。"
          action={
            <Button onClick={() => setEditing({})}>新增第一件商品</Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <Card key={p.id} className="flex flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {p.sku} · {p.categoryName}
                    {p.color ? ` · ${p.color}` : ""}
                    {p.spec ? ` · ${p.spec}` : ""}
                  </p>
                </div>
                {!p.isActive && <Badge>已下架</Badge>}
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-[11px] text-subtle">售價 / 成本</p>
                  <p className="tabular-nums">
                    {twd(p.price)}
                    <span className="ml-1 text-xs text-muted">{twd(p.cost)}</span>
                  </p>
                </div>
                <Badge
                  tone={p.stock === 0 ? "danger" : p.stock <= p.minStock ? "warn" : "ok"}
                >
                  庫存 {p.stock}
                </Badge>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setEditing(p)}
                >
                  編輯
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={() => dup.mutate({ data: { id: p.id } })}
                >
                  <Copy className="size-3.5" />
                  複製
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={() => archive.mutate({ data: { id: p.id } })}
                >
                  {p.isActive ? "下架" : "上架"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={pasteOpen} onOpenChange={setPasteOpen}>
        <DialogContent
          title="貼上清單"
          description="一行一款。可寫「名稱 售價」或「名稱,售價,成本,分類,顏色」。"
        >
          <Textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={8}
            placeholder={"法式珍珠抓夾 180\n磨砂幾何側夾,129,32,髮夾,霧杏"}
          />
          <div className="mt-3 flex justify-end">
            <Button
              disabled={importer.isPending}
              onClick={() => importer.mutate({ data: { text: pasteText } })}
            >
              {importer.isPending ? "匯入中…" : "匯入"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        {editing && (
          <ProductForm
            initial={editing}
            categories={cats.data ?? []}
            saving={save.isPending}
            onSave={(payload) => save.mutate({ data: payload })}
            onAddCategory={async (name) => {
              const r = await addCategory({ data: { name } });
              await qc.invalidateQueries({ queryKey: ["categories"] });
              return r.id;
            }}
          />
        )}
      </Dialog>
    </div>
  );
}

function ProductForm({
  initial,
  categories,
  saving,
  onSave,
  onAddCategory,
}: {
  initial: Partial<Product>;
  categories: Array<{ id: number; name: string }>;
  saving: boolean;
  onSave: (data: {
    id?: number;
    sku: string;
    name: string;
    categoryId: number;
    color: string;
    spec: string;
    cost: number;
    price: number;
    minStock: number;
    stock?: number;
  }) => void;
  onAddCategory: (name: string) => Promise<number>;
}) {
  const isNew = !initial.id;
  const [sku, setSku] = useState(initial.sku ?? "");
  const [name, setName] = useState(initial.name ?? "");
  const [categoryId, setCategoryId] = useState(initial.categoryId ?? categories[0]?.id ?? 0);
  const [color, setColor] = useState(initial.color ?? "");
  const [spec, setSpec] = useState(initial.spec ?? "");
  const [cost, setCost] = useState(String(initial.cost ?? 0));
  const [price, setPrice] = useState(String(initial.price ?? 0));
  const [minStock, setMinStock] = useState(String(initial.minStock ?? 5));
  const [stock, setStock] = useState(String(initial.stock ?? 0));
  const [newCat, setNewCat] = useState("");

  return (
    <DialogContent
      title={isNew ? "新增商品" : "編輯商品"}
      description="貨號留空會依分類自動編號。成本用於庫存價值與毛利。"
    >
      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) {
            toast.error("請填商品名稱");
            return;
          }
          onSave({
            id: initial.id,
            sku: sku.trim(),
            name: name.trim(),
            categoryId,
            color: color.trim(),
            spec: spec.trim(),
            cost: Number(cost) || 0,
            price: Number(price) || 0,
            minStock: Number(minStock) || 0,
            stock: isNew ? Number(stock) || 0 : undefined,
          });
        }}
      >
        <Field label="名稱" className="sm:col-span-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="法式珍珠抓夾" required />
        </Field>
        <Field label="貨號 SKU（留空自動編）">
          <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="例如 HC-024" />
        </Field>
        <Field label="分類">
          <NativeSelect
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <div className="sm:col-span-2 flex gap-2">
          <Input
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="新增分類名稱"
          />
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              if (!newCat.trim()) return;
              try {
                const id = await onAddCategory(newCat.trim());
                setCategoryId(id);
                setNewCat("");
                toast.success("分類已新增");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "無法新增分類");
              }
            }}
          >
            加入分類
          </Button>
        </div>
        <Field label="顏色">
          <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="米白" />
        </Field>
        <Field label="規格">
          <Input value={spec} onChange={(e) => setSpec(e.target.value)} placeholder="8cm / 大" />
        </Field>
        <Field label="成本">
          <Input inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} />
        </Field>
        <Field label="售價">
          <Input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
        </Field>
        <Field label="安全庫存">
          <Input inputMode="numeric" value={minStock} onChange={(e) => setMinStock(e.target.value)} />
        </Field>
        {isNew && (
          <Field label="開帳庫存">
            <Input inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value)} />
          </Field>
        )}
        <div className="sm:col-span-2 mt-2 flex justify-end gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? "儲存中…" : "儲存"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
