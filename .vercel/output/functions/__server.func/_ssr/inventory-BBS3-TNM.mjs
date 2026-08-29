import { o as __toESM } from "../_runtime.mjs";
import { c as twd } from "./utils-LnXesLjR.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as listProducts, E as listStockMoves, S as listCategories, f as adjustStock, s as Route$4, u as PageHeader } from "./router-D07CxSB1.mjs";
import { n as Card, t as Badge } from "./badge-B_WUBLc6.mjs";
import { t as Button } from "./button-BzOIsd-r.mjs";
import { n as DialogContent, t as Dialog } from "./dialog-D38LEC-T.mjs";
import { n as Input, r as NativeSelect, t as Field } from "./input-BkY4Spsa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/inventory-BBS3-TNM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KIND_LABEL = {
	purchase: "進貨",
	sale: "銷貨",
	adjust: "盤點"
};
function suggestQty(p) {
	const target = Math.max(p.minStock * 2, p.minStock + 4);
	return Math.max(target - p.stock, 1);
}
function InventoryPage() {
	const qc = useQueryClient();
	const seeded = Route$4.useLoaderData();
	const [cat, setCat] = (0, import_react.useState)(0);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [adjusting, setAdjusting] = (0, import_react.useState)(null);
	const [qty, setQty] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("盤點調整");
	const cats = useQuery({
		queryKey: ["categories"],
		queryFn: () => listCategories(),
		initialData: seeded.categories
	});
	const products = useQuery({
		queryKey: ["products"],
		queryFn: () => listProducts({ data: { includeInactive: true } }),
		initialData: seeded.products
	});
	const moves = useQuery({
		queryKey: ["moves"],
		queryFn: () => listStockMoves({ data: {} }),
		initialData: seeded.moves
	});
	const rows = (0, import_react.useMemo)(() => {
		let list = (products.data ?? []).filter((p) => p.isActive);
		if (cat) list = list.filter((p) => p.categoryId === cat);
		if (filter === "low") list = list.filter((p) => p.stock <= p.minStock);
		if (filter === "out") list = list.filter((p) => p.stock === 0);
		return list;
	}, [
		products.data,
		cat,
		filter
	]);
	const adjust = useMutation({
		mutationFn: adjustStock,
		onSuccess: (r) => {
			toast.success(r.delta === 0 ? "數量沒有變化" : `庫存已調整 ${r.delta > 0 ? "+" : ""}${r.delta}`);
			setAdjusting(null);
			qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	const units = rows.reduce((a, p) => a + p.stock, 0);
	const value = rows.reduce((a, p) => a + p.stock * p.cost, 0);
	const low = (products.data ?? []).filter((p) => p.isActive && p.stock <= p.minStock);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: "Stock",
			title: "庫存",
			action: low.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/purchases",
					search: { fill: "low" },
					children: [
						"一鍵補貨（",
						low.length,
						"）"
					]
				})
			}) : void 0
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 grid grid-cols-3 gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "現有件數"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-display text-xl tabular-nums",
						children: units
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "庫存成本"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-display text-xl tabular-nums",
						children: twd(value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "低庫存款"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-display text-xl tabular-nums",
						children: low.length
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex flex-col gap-2 sm:flex-row",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
				className: "sm:w-40",
				value: cat,
				onChange: (e) => setCat(Number(e.target.value)),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: 0,
					children: "全部分類"
				}), (cats.data ?? []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: c.id,
					children: c.name
				}, c.id))]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1",
				children: [
					["all", "全部"],
					["low", "低庫存"],
					["out", "缺貨"]
				].map(([k, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: filter === k ? "subtle" : "outline",
					onClick: () => setFilter(k),
					children: label
				}, k))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
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
								children: "商品"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "分類"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium text-right",
								children: "庫存"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium text-right",
								children: "安全"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium text-right",
								children: "建議補"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium text-right",
								children: "成本合計"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-4 py-3 font-medium" })
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border last:border-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-medium",
								children: p.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-muted",
								children: [p.sku, p.color ? ` · ${p.color}` : ""]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-muted",
							children: p.categoryName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: p.stock === 0 ? "danger" : p.stock <= p.minStock ? "warn" : "ok",
								children: p.stock
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-right tabular-nums text-muted",
							children: p.minStock
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-right tabular-nums",
							children: p.stock <= p.minStock ? suggestQty(p) : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-right tabular-nums",
							children: twd(p.stock * p.cost)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => {
									setAdjusting(p);
									setQty(String(p.stock));
									setNote("盤點調整");
								},
								children: "盤點"
							})
						})
					]
				}, p.id)) })]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-8 mb-3 font-display text-lg",
			children: "庫存異動"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "divide-y divide-border overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-card)]",
			children: (moves.data ?? []).slice(0, 25).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center justify-between gap-3 px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm",
					children: [m.productName, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2 text-xs text-muted",
						children: m.sku
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [
						KIND_LABEL[m.kind] ?? m.kind,
						m.note ? ` · ${m.note}` : "",
						m.createdAt ? ` · ${m.createdAt.slice(0, 16).replace("T", " ")}` : ""
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: m.qtyDelta < 0 ? "text-sm tabular-nums text-danger" : "text-sm tabular-nums text-ok",
					children: [m.qtyDelta > 0 ? "+" : "", m.qtyDelta]
				})]
			}, m.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: adjusting != null,
			onOpenChange: (o) => !o && setAdjusting(null),
			children: adjusting && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
				title: `盤點 · ${adjusting.name}`,
				description: `目前庫存 ${adjusting.stock} 件`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "space-y-3",
					onSubmit: (e) => {
						e.preventDefault();
						adjust.mutate({ data: {
							productId: adjusting.id,
							newQty: Math.max(0, Number(qty) || 0),
							note
						} });
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "實際數量",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								inputMode: "numeric",
								value: qty,
								onChange: (e) => setQty(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "原因",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: note,
								onChange: (e) => setNote(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex justify-end",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: adjust.isPending,
								children: "確認調整"
							})
						})
					]
				})
			})
		})
	] });
}
//#endregion
export { InventoryPage as component };
