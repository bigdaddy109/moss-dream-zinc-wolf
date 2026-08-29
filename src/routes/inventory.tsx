import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Field, Input, NativeSelect } from "@/components/ui/input";
import {
  adjustStock,
  listCategories,
  listProducts,
  listStockMoves,
} from "@/lib/inventory/server";
import type { Product } from "@/lib/inventory/types";
import { twd } from "@/lib/utils";

export const Route = createFileRoute("/inventory")({
  loader: async () => {
    const [categories, products, moves] = await Promise.all([
      listCategories(),
      listProducts({ data: { includeInactive: false } }),
      listStockMoves({ data: {} }),
    ]);
    return { categories, products, moves };
  },
  component: InventoryPage,
});

const KIND_LABEL = {
  purchase: "進貨",
  sale: "銷貨",
  adjust: "盤點",
} as const;

function suggestQty(p: Product) {
  const target = Math.max(p.minStock * 2, p.minStock + 4);
  return Math.max(target - p.stock, 1);
}

function InventoryPage() {
  const qc = useQueryClient();
  const seeded = Route.useLoaderData();
  const [cat, setCat] = useState(0);
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [adjusting, setAdjusting] = useState<Product | null>(null);
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("盤點調整");

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
  const moves = useQuery({
    queryKey: ["moves"],
    queryFn: () => listStockMoves({ data: {} }),
    initialData: seeded.moves,
  });

  const rows = useMemo(() => {
    let list = (products.data ?? []).filter((p) => p.isActive);
    if (cat) list = list.filter((p) => p.categoryId === cat);
    if (filter === "low") list = list.filter((p) => p.stock <= p.minStock);
    if (filter === "out") list = list.filter((p) => p.stock === 0);
    return list;
  }, [products.data, cat, filter]);

  const adjust = useMutation({
    mutationFn: adjustStock,
    onSuccess: (r) => {
      toast.success(r.delta === 0 ? "數量沒有變化" : `庫存已調整 ${r.delta > 0 ? "+" : ""}${r.delta}`);
      setAdjusting(null);
      void qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const units = rows.reduce((a, p) => a + p.stock, 0);
  const value = rows.reduce((a, p) => a + p.stock * p.cost, 0);
  const low = (products.data ?? []).filter((p) => p.isActive && p.stock <= p.minStock);

  return (
    <div>
      <PageHeader
        kicker="Stock"
        title="庫存"
        action={
          low.length > 0 ? (
            <Button size="sm" asChild>
              <Link to="/purchases" search={{ fill: "low" }}>
                一鍵補貨（{low.length}）
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 grid grid-cols-3 gap-3">
        <Card className="p-3">
          <p className="text-xs text-muted">現有件數</p>
          <p className="mt-1 font-display text-xl tabular-nums">{units}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted">庫存成本</p>
          <p className="mt-1 font-display text-xl tabular-nums">{twd(value)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted">低庫存款</p>
          <p className="mt-1 font-display text-xl tabular-nums">{low.length}</p>
        </Card>
      </div>

      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <NativeSelect className="sm:w-40" value={cat} onChange={(e) => setCat(Number(e.target.value))}>
          <option value={0}>全部分類</option>
          {(cats.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </NativeSelect>
        <div className="flex gap-1">
          {(
            [
              ["all", "全部"],
              ["low", "低庫存"],
              ["out", "缺貨"],
            ] as const
          ).map(([k, label]) => (
            <Button
              key={k}
              size="sm"
              variant={filter === k ? "subtle" : "outline"}
              onClick={() => setFilter(k)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="text-xs text-muted">
            <tr className="border-b border-border">
              <th className="px-4 py-3 font-medium">商品</th>
              <th className="px-4 py-3 font-medium">分類</th>
              <th className="px-4 py-3 font-medium text-right">庫存</th>
              <th className="px-4 py-3 font-medium text-right">安全</th>
              <th className="px-4 py-3 font-medium text-right">建議補</th>
              <th className="px-4 py-3 font-medium text-right">成本合計</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted">
                    {p.sku}
                    {p.color ? ` · ${p.color}` : ""}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{p.categoryName}</td>
                <td className="px-4 py-3 text-right">
                  <Badge tone={p.stock === 0 ? "danger" : p.stock <= p.minStock ? "warn" : "ok"}>
                    {p.stock}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-muted">{p.minStock}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {p.stock <= p.minStock ? suggestQty(p) : "—"}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{twd(p.stock * p.cost)}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAdjusting(p);
                      setQty(String(p.stock));
                      setNote("盤點調整");
                    }}
                  >
                    盤點
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 mb-3 font-display text-lg">庫存異動</h2>
      <ul className="divide-y divide-border overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-card)]">
        {(moves.data ?? []).slice(0, 25).map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-sm">
                {m.productName}
                <span className="ml-2 text-xs text-muted">{m.sku}</span>
              </p>
              <p className="text-xs text-muted">
                {KIND_LABEL[m.kind] ?? m.kind}
                {m.note ? ` · ${m.note}` : ""}
                {m.createdAt ? ` · ${m.createdAt.slice(0, 16).replace("T", " ")}` : ""}
              </p>
            </div>
            <span
              className={
                m.qtyDelta < 0
                  ? "text-sm tabular-nums text-danger"
                  : "text-sm tabular-nums text-ok"
              }
            >
              {m.qtyDelta > 0 ? "+" : ""}
              {m.qtyDelta}
            </span>
          </li>
        ))}
      </ul>

      <Dialog open={adjusting != null} onOpenChange={(o) => !o && setAdjusting(null)}>
        {adjusting && (
          <DialogContent title={`盤點 · ${adjusting.name}`} description={`目前庫存 ${adjusting.stock} 件`}>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                adjust.mutate({
                  data: {
                    productId: adjusting.id,
                    newQty: Math.max(0, Number(qty) || 0),
                    note,
                  },
                });
              }}
            >
              <Field label="實際數量">
                <Input inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} />
              </Field>
              <Field label="原因">
                <Input value={note} onChange={(e) => setNote(e.target.value)} />
              </Field>
              <div className="flex justify-end">
                <Button type="submit" disabled={adjust.isPending}>
                  確認調整
                </Button>
              </div>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
