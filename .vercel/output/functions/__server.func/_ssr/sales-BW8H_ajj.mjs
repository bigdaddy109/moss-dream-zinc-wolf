import { o as __toESM } from "../_runtime.mjs";
import { c as twd, n as cn, r as formatDate, s as todayISO } from "./utils-LnXesLjR.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { h as Copy } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as listProducts, S as listCategories, T as listSales, b as getSale, h as createSale, n as Route, u as PageHeader } from "./router-D07CxSB1.mjs";
import { t as Badge } from "./badge-B_WUBLc6.mjs";
import { t as Button } from "./button-BzOIsd-r.mjs";
import { n as DialogContent, t as Dialog } from "./dialog-D38LEC-T.mjs";
import { a as setLastChannel, n as lastChannel } from "./prefs-BO-t2bDO.mjs";
import { n as ProductPad, t as CartStrip } from "./product-pad-NeEEhMQ8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sales-BW8H_ajj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CHANNELS = [
	"門市",
	"直播",
	"蝦皮",
	"IG",
	"批發",
	"其他"
];
function SalesPage() {
	const qc = useQueryClient();
	const seeded = Route.useLoaderData();
	const [tab, setTab] = (0, import_react.useState)("pos");
	const [channel, setChannel] = (0, import_react.useState)(() => lastChannel());
	const [lines, setLines] = (0, import_react.useState)([]);
	const [detailId, setDetailId] = (0, import_react.useState)(null);
	const list = useQuery({
		queryKey: ["sales"],
		queryFn: () => listSales(),
		initialData: seeded.sales
	});
	const products = useQuery({
		queryKey: ["products"],
		queryFn: () => listProducts({ data: { includeInactive: true } }),
		initialData: seeded.products
	});
	const cats = useQuery({
		queryKey: ["categories"],
		queryFn: () => listCategories(),
		initialData: seeded.categories
	});
	const detail = useQuery({
		queryKey: ["sale", detailId],
		queryFn: () => getSale({ data: { id: detailId } }),
		enabled: detailId != null
	});
	const byId = (0, import_react.useMemo)(() => {
		return new Map((products.data ?? []).map((p) => [p.id, p]));
	}, [products.data]);
	const create = useMutation({
		mutationFn: createSale,
		onSuccess: (r) => {
			toast.success(`已結帳 ${r.number}`);
			setLines([]);
			qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	function pickChannel(c) {
		setChannel(c);
		setLastChannel(c);
	}
	function checkout() {
		if (lines.some((l) => l.qty > (byId.get(l.productId)?.stock ?? l.stock))) {
			toast.error("有商品超過庫存");
			return;
		}
		create.mutate({ data: {
			occurredOn: todayISO(),
			channel,
			note: "",
			lines: lines.map((l) => ({
				productId: l.productId,
				qty: l.qty,
				unit: l.unit
			}))
		} });
	}
	async function repeatLast() {
		const last = (list.data ?? [])[0];
		if (!last) {
			toast.error("還沒有上一張單");
			return;
		}
		const d = await getSale({ data: { id: last.id } });
		const next = [];
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
				unit: p.price
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: tab === "pos" ? "pb-28" : "",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				kicker: "POS",
				title: "銷貨",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-1 rounded-full bg-surface p-1 shadow-[0_0_0_1px_var(--color-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: tab === "pos" ? "subtle" : "ghost",
						className: "rounded-full",
						onClick: () => setTab("pos"),
						children: "收銀"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: tab === "list" ? "subtle" : "ghost",
						className: "rounded-full",
						onClick: () => setTab("list"),
						children: "紀錄"
					})]
				})
			}),
			tab === "pos" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-sm text-muted",
					children: "點商品入籃，售價自動帶入。結帳一次完成。"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex flex-wrap gap-1",
					children: [CHANNELS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => pickChannel(c),
						className: cn("h-9 rounded-full px-3 text-xs font-medium", channel === c ? "bg-primary text-primary-fg" : "bg-surface text-muted shadow-[0_0_0_1px_var(--color-border)]"),
						children: c
					}, c)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => void repeatLast(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" }), "上一張"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductPad, {
					products: products.data ?? [],
					categories: cats.data ?? [],
					lines,
					onChange: setLines,
					mode: "sale"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartStrip, {
					lines,
					onChange: setLines,
					mode: "sale",
					saving: create.isPending,
					actionLabel: "結帳",
					onSubmit: checkout
				})
			] }) : (list.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "還沒有銷貨紀錄。"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-xl bg-surface shadow-[var(--shadow-card)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[40rem] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-xs text-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "單號"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "日期"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "通路"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium text-right",
									children: "件數"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium text-right",
									children: "金額"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium text-right",
									children: "毛利"
								})
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: (list.data ?? []).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "cursor-pointer border-b border-border last:border-0 hover:bg-tint/50",
						onClick: () => setDetailId(s.id),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 font-medium",
								children: s.number
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-muted",
								children: formatDate(s.occurredOn)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "primary",
									children: s.channel
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-right tabular-nums",
								children: s.qty
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-right tabular-nums",
								children: twd(s.total)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-right tabular-nums text-ok",
								children: twd(s.profit)
							})
						]
					}, s.id)) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: detailId != null,
				onOpenChange: (o) => !o && setDetailId(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
					title: detail.data?.number ?? "銷貨單",
					description: detail.data ? `${formatDate(detail.data.occurredOn)} · ${detail.data.channel}` : void 0,
					children: !detail.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "載入中…"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "space-y-2",
							children: [detail.data.items.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex justify-between text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [i.name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ml-2 text-xs text-muted",
									children: [
										i.sku,
										" × ",
										i.qty,
										" · ",
										twd(i.unitPrice)
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums",
									children: twd(i.qty * i.unitPrice)
								})]
							}, i.productId)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex justify-between border-t border-border pt-2 font-medium",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "毛利" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums text-ok",
									children: twd(detail.data.profit)
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							className: "w-full",
							onClick: () => {
								const d = detail.data;
								if (!d) return;
								setLines(d.items.map((i) => {
									const p = byId.get(i.productId);
									return {
										key: String(i.productId),
										productId: i.productId,
										name: i.name,
										sku: i.sku,
										stock: p?.stock ?? 0,
										qty: i.qty,
										unit: p?.price ?? i.unitPrice
									};
								}));
								pickChannel(d.channel);
								setDetailId(null);
								setTab("pos");
							},
							children: "再賣一筆相同"
						})]
					})
				})
			})
		]
	});
}
//#endregion
export { SalesPage as component };
