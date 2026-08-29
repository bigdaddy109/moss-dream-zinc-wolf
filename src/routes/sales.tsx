import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Copy } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-shell";
import { CartStrip, ProductPad } from "@/components/product-pad";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  createSale,
  getSale,
  listCategories,
  listProducts,
  listSales,
} from "@/lib/inventory/server";
import { CHANNELS, type LineDraft } from "@/lib/inventory/types";
import { lastChannel, setLastChannel } from "@/lib/prefs";
import { cn, formatDate, todayISO, twd } from "@/lib/utils";

export const Route = createFileRoute("/sales")({
  loader: async () => {
    const [sales, products, categories] = await Promise.all([
      listSales(),
      listProducts({ data: { includeInactive: false } }),
      listCategories(),
    ]);
    return { sales, products, categories };
  },
  component: SalesPage,
});

function SalesPage() {
  const qc = useQueryClient();
  const seeded = Route.useLoaderData();
  const [tab, setTab] = useState<"pos" | "list">("pos");
  const [channel, setChannel] = useState(() => lastChannel());
  const [lines, setLines] = useState<LineDraft[]>([]);
  const [detailId, setDetailId] = useState<number | null>(null);

  const list = useQuery({
    queryKey: ["sales"],
    queryFn: () => listSales(),
    initialData: seeded.sales,
  });
  const products = useQuery({
    queryKey: ["products"],
    queryFn: () => listProducts({ data: { includeInactive: true } }),
    initialData: seeded.products,
  });
  const cats = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
    initialData: seeded.categories,
  });
  const detail = useQuery({
    queryKey: ["sale", detailId],
    queryFn: () => getSale({ data: { id: detailId! } }),
    enabled: detailId != null,
  });

  const byId = useMemo(() => {
    const m = new Map((products.data ?? []).map((p) => [p.id, p]));
    return m;
  }, [products.data]);

  const create = useMutation({
    mutationFn: createSale,
    onSuccess: (r) => {
      toast.success(`已結帳 ${r.number}`);
      setLines([]);
      void qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function pickChannel(c: string) {
    setChannel(c);
    setLastChannel(c);
  }

  function checkout() {
    const over = lines.some((l) => l.qty > (byId.get(l.productId)?.stock ?? l.stock));
    if (over) {
      toast.error("有商品超過庫存");
      return;
    }
    create.mutate({
      data: {
        occurredOn: todayISO(),
        channel,
        note: "",
        lines: lines.map((l) => ({
          productId: l.productId,
          qty: l.qty,
          unit: l.unit,
        })),
      },
    });
  }

  async function repeatLast() {
    const last = (list.data ?? [])[0];
    if (!last) {
      toast.error("還沒有上一張單");
      return;
    }
    const d = await getSale({ data: { id: last.id } });
    const next: LineDraft[] = [];
    for (const i of d.items) {
      const p = byId.get(i.productId);
      if (!p || !p.isActive) continue;
      next.push({
        key: String(p.id),
        productId: p.id,
        name: p.name,
        sku: p.sku,
        stock: p.stock,
        qty: Math.min(i.qty, Math.max(p.stock, 0)) || 1,
        unit: p.price,
      });
    }
    if (next.length === 0) {
      toast.error("上一張單的商品目前無法再賣");
      return;
    }
    setLines(next);
    pickChannel(d.channel);
    setTab("pos");
    toast.success("已帶入上一張單，點結帳即可");
  }

  return (
    <div className={tab === "pos" ? "pb-28" : ""}>
      <PageHeader
        kicker="POS"
        title="銷貨"
        action={
          <div className="flex gap-1 rounded-full bg-surface p-1 shadow-[0_0_0_1px_var(--color-border)]">
            <Button
              size="sm"
              variant={tab === "pos" ? "subtle" : "ghost"}
              className="rounded-full"
              onClick={() => setTab("pos")}
            >
              收銀
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

      {tab === "pos" ? (
        <>
          <p className="mb-3 text-sm text-muted">
            點商品入籃，售價自動帶入。結帳一次完成。
          </p>
          <div className="mb-4 flex flex-wrap gap-1">
            {CHANNELS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => pickChannel(c)}
                className={cn(
                  "h-9 rounded-full px-3 text-xs font-medium",
                  channel === c
                    ? "bg-primary text-primary-fg"
                    : "bg-surface text-muted shadow-[0_0_0_1px_var(--color-border)]",
                )}
              >
                {c}
              </button>
            ))}
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
            mode="sale"
          />
          <CartStrip
            lines={lines}
            onChange={setLines}
            mode="sale"
            saving={create.isPending}
            actionLabel="結帳"
            onSubmit={checkout}
          />
        </>
      ) : (list.data ?? []).length === 0 ? (
        <p className="text-sm text-muted">還沒有銷貨紀錄。</p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-surface shadow-[var(--shadow-card)]">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-medium">單號</th>
                <th className="px-4 py-3 font-medium">日期</th>
                <th className="px-4 py-3 font-medium">通路</th>
                <th className="px-4 py-3 font-medium text-right">件數</th>
                <th className="px-4 py-3 font-medium text-right">金額</th>
                <th className="px-4 py-3 font-medium text-right">毛利</th>
              </tr>
            </thead>
            <tbody>
              {(list.data ?? []).map((s) => (
                <tr
                  key={s.id}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-tint/50"
                  onClick={() => setDetailId(s.id)}
                >
                  <td className="px-4 py-3 font-medium">{s.number}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(s.occurredOn)}</td>
                  <td className="px-4 py-3">
                    <Badge tone="primary">{s.channel}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{s.qty}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{twd(s.total)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-ok">
                    {twd(s.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={detailId != null} onOpenChange={(o) => !o && setDetailId(null)}>
        <DialogContent
          title={detail.data?.number ?? "銷貨單"}
          description={
            detail.data
              ? `${formatDate(detail.data.occurredOn)} · ${detail.data.channel}`
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
                        {i.sku} × {i.qty} · {twd(i.unitPrice)}
                      </span>
                    </span>
                    <span className="tabular-nums">{twd(i.qty * i.unitPrice)}</span>
                  </li>
                ))}
                <li className="flex justify-between border-t border-border pt-2 font-medium">
                  <span>毛利</span>
                  <span className="tabular-nums text-ok">{twd(detail.data.profit)}</span>
                </li>
              </ul>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const d = detail.data;
                  if (!d) return;
                  setLines(
                    d.items.map((i) => {
                      const p = byId.get(i.productId);
                      return {
                        key: String(i.productId),
                        productId: i.productId,
                        name: i.name,
                        sku: i.sku,
                        stock: p?.stock ?? 0,
                        qty: i.qty,
                        unit: p?.price ?? i.unitPrice,
                      };
                    }),
                  );
                  pickChannel(d.channel);
                  setDetailId(null);
                  setTab("pos");
                }}
              >
                再賣一筆相同
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
