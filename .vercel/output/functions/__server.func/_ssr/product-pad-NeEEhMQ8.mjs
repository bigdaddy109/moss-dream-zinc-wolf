import { o as __toESM } from "../_runtime.mjs";
import { c as twd, n as cn } from "./utils-LnXesLjR.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as Trash2, c as Search, f as Minus, l as Plus } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/product-pad-NeEEhMQ8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function bumpLine(lines, p, mode, delta = 1) {
	const i = lines.findIndex((l) => l.productId === p.id);
	if (i >= 0) {
		const next = lines[i].qty + delta;
		if (next <= 0) return lines.filter((_, idx) => idx !== i);
		return lines.map((l, idx) => idx === i ? {
			...l,
			qty: next
		} : l);
	}
	if (delta <= 0) return lines;
	return [...lines, {
		key: String(p.id),
		productId: p.id,
		name: p.name,
		sku: p.sku,
		stock: p.stock,
		qty: delta,
		unit: mode === "sale" ? p.price : p.cost
	}];
}
function ProductPad({ products, categories, lines, onChange, mode }) {
	const [q, setQ] = (0, import_react.useState)("");
	const [cat, setCat] = (0, import_react.useState)(0);
	const qtyMap = (0, import_react.useMemo)(() => {
		const m = /* @__PURE__ */ new Map();
		for (const l of lines) m.set(l.productId, l.qty);
		return m;
	}, [lines]);
	const visible = (0, import_react.useMemo)(() => {
		const s = q.trim().toLowerCase();
		return products.filter((p) => {
			if (!p.isActive) return false;
			if (cat && p.categoryId !== cat) return false;
			if (!s) return true;
			return p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s) || p.color.toLowerCase().includes(s);
		});
	}, [
		products,
		q,
		cat
	]);
	function tap(p) {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mb-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: q,
				onChange: (e) => setQ(e.target.value),
				placeholder: "搜尋名稱或貨號（可不填，直接點選）",
				className: "h-11 w-full rounded-md bg-raised pl-9 pr-3 text-sm shadow-[0_0_0_1px_var(--color-border)] placeholder:text-subtle focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--color-primary)]"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex gap-1 overflow-x-auto pb-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
				active: cat === 0,
				onClick: () => setCat(0),
				children: "全部"
			}), categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
				active: cat === c.id,
				onClick: () => setCat(c.id),
				children: c.name
			}, c.id))]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4",
			children: visible.map((p) => {
				const qty = qtyMap.get(p.id) ?? 0;
				const out = mode === "sale" && p.stock <= 0;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => tap(p),
					disabled: out,
					className: cn("relative rounded-lg bg-surface p-3 text-left shadow-[var(--shadow-card)] transition-transform duration-150 active:scale-[0.98]", out && "opacity-45", qty > 0 && "shadow-[0_0_0_2px_var(--color-primary)]"),
					children: [
						qty > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-medium text-primary-fg tabular-nums",
							children: qty
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "pr-6 text-sm font-medium leading-snug",
							children: p.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-[11px] text-muted",
							children: [
								p.color || p.categoryName,
								" · 庫存 ",
								p.stock
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-base tabular-nums",
							children: twd(mode === "sale" ? p.price : p.cost)
						})
					]
				}, p.id);
			})
		}),
		visible.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-8 text-center text-sm text-muted",
			children: "沒有符合的商品"
		})
	] });
}
function CartStrip({ lines, onChange, mode, saving, actionLabel, onSubmit, extra }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const total = lines.reduce((a, l) => a + l.qty * l.unit, 0);
	const qty = lines.reduce((a, l) => a + l.qty, 0);
	if (lines.length === 0 && !extra) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none fixed inset-x-0 bottom-[calc(3.6rem+env(safe-area-inset-bottom))] z-20 px-3 md:bottom-5 md:left-56",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-auto mx-auto max-w-6xl overflow-hidden rounded-xl bg-ink text-primary-fg shadow-[var(--shadow-card)]",
			children: [open && lines.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "max-h-52 space-y-1 overflow-y-auto px-3 py-2",
				children: lines.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-2 py-1 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 flex-1 truncate",
							children: l.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center rounded-md bg-primary-fg/10",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "flex size-9 items-center justify-center",
									onClick: () => onChange(l.qty <= 1 ? lines.filter((x) => x.key !== l.key) : lines.map((x) => x.key === l.key ? {
										...x,
										qty: x.qty - 1
									} : x)),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-3.5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-6 text-center tabular-nums",
									children: l.qty
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "flex size-9 items-center justify-center",
									onClick: () => onChange(lines.map((x) => x.key === l.key ? {
										...x,
										qty: x.qty + 1
									} : x)),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" })
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-16 text-right tabular-nums",
							children: twd(l.qty * l.unit)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "flex size-9 items-center justify-center text-primary-fg/70",
							onClick: () => onChange(lines.filter((x) => x.key !== l.key)),
							"aria-label": "移除",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
						})
					]
				}, l.key))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 px-3 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "min-w-0 flex-1 text-left",
						onClick: () => setOpen((v) => !v),
						disabled: lines.length === 0,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[11px] text-primary-fg/70",
							children: [
								qty,
								" 件 · 點此",
								open ? "收合" : "改數量",
								mode === "sale" ? " · 售價已帶入" : " · 進價已帶入"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-xl tabular-nums",
							children: twd(total)
						})]
					}),
					extra,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: saving || lines.length === 0,
						onClick: onSubmit,
						className: "h-11 shrink-0 rounded-md bg-primary-fg px-4 text-sm font-medium text-ink disabled:opacity-40",
						children: saving ? "處理中…" : actionLabel
					})
				]
			})]
		})
	});
}
function Chip({ active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: cn("h-9 shrink-0 rounded-full px-3 text-xs font-medium", active ? "bg-primary text-primary-fg" : "bg-surface text-muted shadow-[0_0_0_1px_var(--color-border)]"),
		children
	});
}
//#endregion
export { ProductPad as n, CartStrip as t };
