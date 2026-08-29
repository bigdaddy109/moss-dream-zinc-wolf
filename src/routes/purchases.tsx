import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Copy, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { CartStrip, ProductPad } from "@/components/product-pad";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  createPurchase,
  getPurchase,
  listCategories,
  listProducts,
  listPurchases,
  listSuppliers,
  suggestRestock,
} from "@/lib/inventory/server";
import type { LineDraft } from "@/lib/inventory/types";
import { lastSupplierId, setLastSupplierId } from "@/lib/prefs";
import { cn, formatDate, todayISO, twd } from "@/lib/utils";

type Search = { fill?: "low" };

export const Route = createFileRoute("/purchases")({
  validateSearch: (raw: Record<string, unknown>): Search => ({
    fill: raw.fill === "low" ? "low" : undefined,
  }),
  loader: async () => {
    const [purchases, products, suppliers, categories] = await Promise.all([
      listPurchases(),
      listProducts({ data: { includeInactive: false } }),
      listSuppliers(),
      listCategories(),
    ]);
    return { purchases, products, suppliers, categories };
  },
  component: PurchasesPage,
});

function PurchasesPage() {
  const qc = useQueryClient();
  const seeded = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/purchases" });
  const [tab, setTab] = useState<"pad" | "list">("pad");
  const [lines, setLines] = useState<LineDraft[]>([]);
  const [supplierId, setSupplierId] = useState(() => lastSupplierId());
  const [detailId, setDetailId] = useState<number | null>(null);

  const list = useQuery({
    queryKey: ["purchases"],
    queryFn: () => listPurchases(),
    initialData: seeded.purchases,
  });
  const products = useQuery({
    queryKey: ["products"],
    queryFn: () => listProducts({ data: { includeInactive: true } }),
    initialData: seeded.products,
  });
  const suppliers = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => listSuppliers(),
    initialData: seeded.suppliers,
  });
  const cats = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
    initialData: seeded.categories,
  });
  const detail = useQuery({
    queryKey: ["purchase", detailId],
    queryFn: () => getPurchase({ data: { id: detailId! } }),
    enabled: detailId != null,
  });

  const create = useMutation({
    mutationFn: createPurchase,
    onSuccess: (r) => {
      toast.success(`已入庫 ${r.number}`);
      setLines([]);
      void qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  useEffect(() => {
    if (search.fill !== "low") return;
    let cancelled = false;
    void (async () => {
      const s = await suggestRestock();
      if (cancelled) return;
      if (s.lines.length === 0) {
        toast.error("目前沒有低於安全庫存的商品");
      } else {
        setLines(s.lines);
        if (s.supplierId) {
          setSupplierId(s.supplierId);
          setLastSupplierId(s.supplierId);
        }
        setTab("pad");
        toast.success(`已帶入 ${s.lines.length} 款低庫存`);
      }
      await navigate({ search: {}, replace: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [search.fill, navigate]);

  function pickSupplier(id: number) {
    setSupplierId(id);
    setLastSupplierId(id);
  }

  async function fillLow() {
    const s = await suggestRestock();
    if (s.lines.length === 0) {
      toast.error("目前沒有低於安全庫存的商品");
      return;
    }
    setLines(s.lines);
    if (s.supplierId) pickSupplier(s.supplierId);
    toast.success(`已帶入 ${s.lines.length} 款，數量依安全庫存建議`);
  }

  async function repeatLast() {
    const last = (list.data ?? [])[0];
    if (!last) {
      toast.error("還沒有上一張進貨單");
      return;
    }
    const d = await getPurchase({ data: { id: last.id } });
    setLines(
      d.items.map((i) => ({
        key: String(i.productId),
        productId: i.productId,
        name: i.name,
        sku: i.sku,
        stock: products.data?.find((p) => p.id === i.productId)?.stock ?? 0,
        qty: i.qty,
        unit: i.unitCost,
      })),
    );
    const match = (suppliers.data ?? []).find((s) => s.name === d.supplierName);
    if (match) pickSupplier(match.id);
    setTab("pad");
    toast.success("已帶入上一張進貨");
  }

  const supplierName =
    (suppliers.data ?? []).find((s) => s.id === supplierId)?.name ?? "";

  return (
    <div className={tab === "pad" ? "pb-28" : ""}>
      <PageHeader
        kicker="Inbound"
        title="進貨"
        action={
          <div className="flex gap-1 rounded-full bg-surface p-1 shadow-[0_0_0_1px_var(--color-border)]">
            <Button
              size="sm"
              variant={tab === "pad" ? "subtle" : "ghost"}
              className="rounded-full"
              onClick={() => setTab("pad")}
            >
              點貨
            </Button>
            <Button
              size="sm"
              variant={tab === "list" ? "subtle" : "ghost"}
              className="rounded-full"
              onClick={() => setTab("list")}
            >
              紀錄
            </Button>
          </div>
        }
      />

      {tab === "pad" ? (
        <>
          <p className="mb-3 text-sm text-muted">
            點商品入籃，進價用上次成本。低庫存可一鍵帶入。
          </p>
          <div className="mb-3 flex flex-wrap gap-1">
            {(suppliers.data ?? []).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => pickSupplier(s.id)}
                className={cn(
                  "h-9 rounded-full px-3 text-xs font-medium",
                  supplierId === s.id
                    ? "bg-primary text-primary-fg"
                    : "bg-surface text-muted shadow-[0_0_0_1px_var(--color-border)]",
                )}
              >
                {s.name}
              </button>
            ))}
            <Button size="sm" variant="ghost" onClick={() => void fillLow()}>
              <Sparkles className="size-3.5" />
              低庫存
            </Button>
            <Button size="sm" variant="ghost" onClick={() => void repeatLast()}>
              <Copy className="size-3.5" />
              上一張
            </Button>
          </div>
          <ProductPad
            products={products.data ?? []}
            categories={cats.data ?? []}
            lines={lines}
            onChange={setLines}
            mode="purchase"
          />
          <CartStrip
            lines={lines}
            onChange={setLines}
            mode="purchase"
            saving={create.isPending}
            actionLabel="入庫"
            onSubmit={() => {
              create.mutate({
                data: {
                  occurredOn: todayISO(),
                  supplierId: supplierId || undefined,
                  supplierName,
                  note: "",
                  lines: lines.map((l) => ({
                    productId: l.productId,
                    qty: l.qty,
                    unit: l.unit,
                  })),
                },
              });
            }}
          />
        </>
      ) : (list.data ?? []).length === 0 ? (
        <p className="text-sm text-muted">還沒有進貨紀錄。</p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-surface shadow-[var(--shadow-card)]">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-medium">單號</th>
                <th className="px-4 py-3 font-medium">日期</th>
                <th className="px-4 py-3 font-medium">供應商</th>
                <th className="px-4 py-3 font-medium text-right">件數</th>
                <th className="px-4 py-3 font-medium text-right">金額</th>
              </tr>
            </thead>
            <tbody>
              {(list.data ?? []).map((p) => (
                <tr
                  key={p.id}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-tint/50"
                  onClick={() => setDetailId(p.id)}
                >
                  <td className="px-4 py-3 font-medium">{p.number}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(p.occurredOn)}</td>
                  <td className="px-4 py-3">{p.supplierName}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{p.qty}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{twd(p.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={detailId != null} onOpenChange={(o) => !o && setDetailId(null)}>
        <DialogContent
          title={detail.data?.number ?? "進貨單"}
          description={
            detail.data
              ? `${formatDate(detail.data.occurredOn)} · ${detail.data.supplierName}`
              : undefined
          }
        >
          {!detail.data ? (
            <p className="text-sm text-muted">載入中…</p>
          ) : (
            <div className="space-y-3">
              <ul className="space-y-2">
                {detail.data.items.map((i) => (
                  <li key={i.productId} className="flex justify-between text-sm">
                    <span>
                      {i.name}
                      <span className="ml-2 text-xs text-muted">
                        {i.sku} × {i.qty}
                      </span>
                    </span>
                    <span className="tabular-nums">{twd(i.qty * i.unitCost)}</span>
                  </li>
                ))}
                <li className="flex justify-between border-t border-border pt-2 font-medium">
                  <span>合計</span>
                  <span className="tabular-nums">{twd(detail.data.total)}</span>
                </li>
              </ul>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const d = detail.data;
                  if (!d) return;
                  setLines(
                    d.items.map((i) => ({
                      key: String(i.productId),
                      productId: i.productId,
                      name: i.name,
                      sku: i.sku,
                      stock: products.data?.find((p) => p.id === i.productId)?.stock ?? 0,
                      qty: i.qty,
                      unit: i.unitCost,
                    })),
                  );
                  const match = (suppliers.data ?? []).find((s) => s.name === d.supplierName);
                  if (match) pickSupplier(match.id);
                  setDetailId(null);
                  setTab("pad");
                }}
              >
                再進一筆相同
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
