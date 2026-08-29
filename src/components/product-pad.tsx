import { Minus, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { Category, LineDraft, Product } from "@/lib/inventory/types";
import { cn, twd } from "@/lib/utils";

export function bumpLine(
  lines: LineDraft[],
  p: Product,
  mode: "sale" | "purchase",
  delta = 1,
): LineDraft[] {
  const i = lines.findIndex((l) => l.productId === p.id);
  if (i >= 0) {
    const next = lines[i]!.qty + delta;
    if (next <= 0) return lines.filter((_, idx) => idx !== i);
    return lines.map((l, idx) => (idx === i ? { ...l, qty: next } : l));
  }
  if (delta <= 0) return lines;
  return [
    ...lines,
    {
      key: String(p.id),
      productId: p.id,
      name: p.name,
      sku: p.sku,
      stock: p.stock,
      qty: delta,
      unit: mode === "sale" ? p.price : p.cost,
    },
  ];
}

export function ProductPad({
  products,
  categories,
  lines,
  onChange,
  mode,
}: {
  products: Product[];
  categories: Category[];
  lines: LineDraft[];
  onChange: (lines: LineDraft[]) => void;
  mode: "sale" | "purchase";
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(0);
  const qtyMap = useMemo(() => {
    const m = new Map<number, number>();
    for (const l of lines) m.set(l.productId, l.qty);
    return m;
  }, [lines]);

  const visible = useMemo(() => {
    const s = q.trim().toLowerCase();
    return products.filter((p) => {
      if (!p.isActive) return false;
      if (cat && p.categoryId !== cat) return false;
      if (!s) return true;
      return (
        p.name.toLowerCase().includes(s) ||
        p.sku.toLowerCase().includes(s) ||
        p.color.toLowerCase().includes(s)
      );
    });
  }, [products, q, cat]);

  function tap(p: Product) {
    if (mode === "sale" && p.stock <= 0) {
      toast.error(`${p.name} 已缺貨`);
      return;
    }
    const current = qtyMap.get(p.id) ?? 0;
    if (mode === "sale" && current + 1 > p.stock) {
      toast.error(`${p.name} 只剩 ${p.stock} 件`);
      return;
    }
    onChange(bumpLine(lines, p, mode, 1));
  }

  return (
    <div>
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜尋名稱或貨號（可不填，直接點選）"
          className="h-11 w-full rounded-md bg-raised pl-9 pr-3 text-sm shadow-[0_0_0_1px_var(--color-border)] placeholder:text-subtle focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--color-primary)]"
        />
      </div>
      <div className="mb-3 flex gap-1 overflow-x-auto pb-1">
        <Chip active={cat === 0} onClick={() => setCat(0)}>
          全部
        </Chip>
        {categories.map((c) => (
          <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
            {c.name}
          </Chip>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((p) => {
          const qty = qtyMap.get(p.id) ?? 0;
          const out = mode === "sale" && p.stock <= 0;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => tap(p)}
              disabled={out}
              className={cn(
                "relative rounded-lg bg-surface p-3 text-left shadow-[var(--shadow-card)] transition-transform duration-150 active:scale-[0.98]",
                out && "opacity-45",
                qty > 0 && "shadow-[0_0_0_2px_var(--color-primary)]",
              )}
            >
              {qty > 0 && (
                <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-medium text-primary-fg tabular-nums">
                  {qty}
                </span>
              )}
              <p className="pr-6 text-sm font-medium leading-snug">{p.name}</p>
              <p className="mt-1 text-[11px] text-muted">
                {p.color || p.categoryName} · 庫存 {p.stock}
              </p>
              <p className="mt-2 font-display text-base tabular-nums">
                {twd(mode === "sale" ? p.price : p.cost)}
              </p>
            </button>
          );
        })}
      </div>
      {visible.length === 0 && (
        <p className="py-8 text-center text-sm text-muted">沒有符合的商品</p>
      )}
    </div>
  );
}

export function CartStrip({
  lines,
  onChange,
  mode,
  saving,
  actionLabel,
  onSubmit,
  extra,
}: {
  lines: LineDraft[];
  onChange: (lines: LineDraft[]) => void;
  mode: "sale" | "purchase";
  saving: boolean;
  actionLabel: string;
  onSubmit: () => void;
  extra?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const total = lines.reduce((a, l) => a + l.qty * l.unit, 0);
  const qty = lines.reduce((a, l) => a + l.qty, 0);
  if (lines.length === 0 && !extra) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(3.6rem+env(safe-area-inset-bottom))] z-20 px-3 md:bottom-5 md:left-56">
      <div className="pointer-events-auto mx-auto max-w-6xl overflow-hidden rounded-xl bg-ink text-primary-fg shadow-[var(--shadow-card)]">
        {open && lines.length > 0 && (
          <ul className="max-h-52 space-y-1 overflow-y-auto px-3 py-2">
            {lines.map((l) => (
              <li key={l.key} className="flex items-center gap-2 py-1 text-sm">
                <span className="min-w-0 flex-1 truncate">{l.name}</span>
                <div className="flex items-center rounded-md bg-primary-fg/10">
                  <button
                    type="button"
                    className="flex size-9 items-center justify-center"
                    onClick={() =>
                      onChange(
                        l.qty <= 1
                          ? lines.filter((x) => x.key !== l.key)
                          : lines.map((x) =>
                              x.key === l.key ? { ...x, qty: x.qty - 1 } : x,
                            ),
                      )
                    }
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-6 text-center tabular-nums">{l.qty}</span>
                  <button
                    type="button"
                    className="flex size-9 items-center justify-center"
                    onClick={() =>
                      onChange(
                        lines.map((x) =>
                          x.key === l.key ? { ...x, qty: x.qty + 1 } : x,
                        ),
                      )
                    }
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
                <span className="w-16 text-right tabular-nums">
                  {twd(l.qty * l.unit)}
                </span>
                <button
                  type="button"
                  className="flex size-9 items-center justify-center text-primary-fg/70"
                  onClick={() => onChange(lines.filter((x) => x.key !== l.key))}
                  aria-label="移除"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center gap-2 px-3 py-2">
          <button
            type="button"
            className="min-w-0 flex-1 text-left"
            onClick={() => setOpen((v) => !v)}
            disabled={lines.length === 0}
          >
            <p className="text-[11px] text-primary-fg/70">
              {qty} 件 · 點此{open ? "收合" : "改數量"}
              {mode === "sale" ? " · 售價已帶入" : " · 進價已帶入"}
            </p>
            <p className="font-display text-xl tabular-nums">{twd(total)}</p>
          </button>
          {extra}
          <button
            type="button"
            disabled={saving || lines.length === 0}
            onClick={onSubmit}
            className="h-11 shrink-0 rounded-md bg-primary-fg px-4 text-sm font-medium text-ink disabled:opacity-40"
          >
            {saving ? "處理中…" : actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 shrink-0 rounded-full px-3 text-xs font-medium",
        active ? "bg-primary text-primary-fg" : "bg-surface text-muted shadow-[0_0_0_1px_var(--color-border)]",
      )}
    >
      {children}
    </button>
  );
}
