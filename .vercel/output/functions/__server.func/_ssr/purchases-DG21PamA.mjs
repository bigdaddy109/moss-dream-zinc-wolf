import { o as __toESM } from "../_runtime.mjs";
import { c as twd, n as cn, r as formatDate, s as todayISO } from "./utils-LnXesLjR.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { h as Copy, o as Sparkles } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as listProducts, D as listSuppliers, S as listCategories, a as Route$2, k as suggestRestock, m as createPurchase, u as PageHeader, v as getPurchase, w as listPurchases } from "./router-D07CxSB1.mjs";
import { t as Button } from "./button-BzOIsd-r.mjs";
import { n as DialogContent, t as Dialog } from "./dialog-D38LEC-T.mjs";
import { o as setLastSupplierId, r as lastSupplierId } from "./prefs-BO-t2bDO.mjs";
import { n as ProductPad, t as CartStrip } from "./product-pad-NeEEhMQ8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/purchases-DG21PamA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PurchasesPage() {
	const qc = useQueryClient();
	const seeded = Route$2.useLoaderData();
	const search = Route$2.useSearch();
	const navigate = useNavigate({ from: "/purchases" });
	const [tab, setTab] = (0, import_react.useState)("pad");
	const [lines, setLines] = (0, import_react.useState)([]);
	const [supplierId, setSupplierId] = (0, import_react.useState)(() => lastSupplierId());
	const [detailId, setDetailId] = (0, import_react.useState)(null);
	const list = useQuery({
		queryKey: ["purchases"],
		queryFn: () => listPurchases(),
		initialData: seeded.purchases
	});
	const products = useQuery({
		queryKey: ["products"],
		queryFn: () => listProducts({ data: { includeInactive: true } }),
		initialData: seeded.products
	});
	const suppliers = useQuery({
		queryKey: ["suppliers"],
		queryFn: () => listSuppliers(),
		initialData: seeded.suppliers
	});
	const cats = useQuery({
		queryKey: ["categories"],
		queryFn: () => listCategories(),
		initialData: seeded.categories
	});
	const detail = useQuery({
		queryKey: ["purchase", detailId],
		queryFn: () => getPurchase({ data: { id: detailId } }),
		enabled: detailId != null
	});
	const create = useMutation({
		mutationFn: createPurchase,
		onSuccess: (r) => {
			toast.success(`已入庫 ${r.number}`);
			setLines([]);
			qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	(0, import_react.useEffect)(() => {
		if (search.fill !== "low") return;
		let cancelled = false;
		(async () => {
			const s = await suggestRestock();
			if (cancelled) return;
			if (s.lines.length === 0) toast.error("目前沒有低於安全庫存的商品");
			else {
				setLines(s.lines);
				if (s.supplierId) {
					setSupplierId(s.supplierId);
					setLastSupplierId(s.supplierId);
				}
				setTab("pad");
				toast.success(`已帶入 ${s.lines.length} 款低庫存`);
			}
			await navigate({
				search: {},
				replace: true
			});
		})();
		return () => {
			cancelled = true;
		};
	}, [search.fill, navigate]);
	function pickSupplier(id) {
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
		setLines(d.items.map((i) => ({
			key: String(i.productId),
			productId: i.productId,
			name: i.name,
			sku: i.sku,
			stock: products.data?.find((p) => p.id === i.productId)?.stock ?? 0,
			qty: i.qty,
			unit: i.unitCost
		})));
		const match = (suppliers.data ?? []).find((s) => s.name === d.supplierName);
		if (match) pickSupplier(match.id);
		setTab("pad");
		toast.success("已帶入上一張進貨");
	}
	const supplierName = (suppliers.data ?? []).find((s) => s.id === supplierId)?.name ?? "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: tab === "pad" ? "pb-28" : "",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				kicker: "Inbound",
				title: "進貨",
				action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-1 rounded-full bg-surface p-1 shadow-[0_0_0_1px_var(--color-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: tab === "pad" ? "subtle" : "ghost",
						className: "rounded-full",
						onClick: () => setTab("pad"),
						children: "點貨"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: tab === "list" ? "subtle" : "ghost",
						className: "rounded-full",
						onClick: () => setTab("list"),
						children: "紀錄"
					})]
				})
			}),
			tab === "pad" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-sm text-muted",
					children: "點商品入籃，進價用上次成本。低庫存可一鍵帶入。"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex flex-wrap gap-1",
					children: [
						(suppliers.data ?? []).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => pickSupplier(s.id),
							className: cn("h-9 rounded-full px-3 text-xs font-medium", supplierId === s.id ? "bg-primary text-primary-fg" : "bg-surface text-muted shadow-[0_0_0_1px_var(--color-border)]"),
							children: s.name
						}, s.id)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => void fillLow(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5" }), "低庫存"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => void repeatLast(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" }), "上一張"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductPad, {
					products: products.data ?? [],
					categories: cats.data ?? [],
					lines,
					onChange: setLines,
					mode: "purchase"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartStrip, {
					lines,
					onChange: setLines,
					mode: "purchase",
					saving: create.isPending,
					actionLabel: "入庫",
					onSubmit: () => {
						create.mutate({ data: {
							occurredOn: todayISO(),
							supplierId: supplierId || void 0,
							supplierName,
							note: "",
							lines: lines.map((l) => ({
								productId: l.productId,
								qty: l.qty,
								unit: l.unit
							}))
						} });
					}
				})
			] }) : (list.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "還沒有進貨紀錄。"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-xl bg-surface shadow-[var(--shadow-card)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[36rem] text-left text-sm",
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
									children: "供應商"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium text-right",
									children: "件數"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium text-right",
									children: "金額"
								})
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: (list.data ?? []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "cursor-pointer border-b border-border last:border-0 hover:bg-tint/50",
						onClick: () => setDetailId(p.id),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 font-medium",
								children: p.number
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-muted",
								children: formatDate(p.occurredOn)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: p.supplierName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-right tabular-nums",
								children: p.qty
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-right tabular-nums",
								children: twd(p.total)
							})
						]
					}, p.id)) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: detailId != null,
				onOpenChange: (o) => !o && setDetailId(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
					title: detail.data?.number ?? "進貨單",
					description: detail.data ? `${formatDate(detail.data.occurredOn)} · ${detail.data.supplierName}` : void 0,
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
										i.qty
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums",
									children: twd(i.qty * i.unitCost)
								})]
							}, i.productId)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex justify-between border-t border-border pt-2 font-medium",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "合計" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums",
									children: twd(detail.data.total)
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							className: "w-full",
							onClick: () => {
								const d = detail.data;
								if (!d) return;
								setLines(d.items.map((i) => ({
									key: String(i.productId),
									productId: i.productId,
									name: i.name,
									sku: i.sku,
									stock: products.data?.find((p) => p.id === i.productId)?.stock ?? 0,
									qty: i.qty,
									unit: i.unitCost
								})));
								const match = (suppliers.data ?? []).find((s) => s.name === d.supplierName);
								if (match) pickSupplier(match.id);
								setDetailId(null);
								setTab("pad");
							},
							children: "再進一筆相同"
						})]
					})
				})
			})
		]
	});
}
//#endregion
export { PurchasesPage as component };
