import { o as __toESM } from "../_runtime.mjs";
import { c as twd } from "./utils-LnXesLjR.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as Search, h as Copy, l as Plus } from "../_libs/lucide-react.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as listProducts, O as saveProduct, S as listCategories, d as addCategory, g as duplicateProduct, l as EmptyState, o as Route$3, p as archiveProduct, u as PageHeader, x as importProducts } from "./router-D07CxSB1.mjs";
import { n as Card, t as Badge } from "./badge-B_WUBLc6.mjs";
import { t as Button } from "./button-BzOIsd-r.mjs";
import { n as DialogContent, t as Dialog } from "./dialog-D38LEC-T.mjs";
import { i as Textarea, n as Input, r as NativeSelect, t as Field } from "./input-BkY4Spsa.mjs";
import { i as setLastCategoryId, t as lastCategoryId } from "./prefs-BO-t2bDO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/products-Bnrtru55.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProductsPage() {
	const qc = useQueryClient();
	const seeded = Route$3.useLoaderData();
	const [q, setQ] = (0, import_react.useState)("");
	const [cat, setCat] = (0, import_react.useState)(0);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [showInactive, setShowInactive] = (0, import_react.useState)(false);
	const [quickName, setQuickName] = (0, import_react.useState)("");
	const [quickPrice, setQuickPrice] = (0, import_react.useState)("");
	const [quickCat, setQuickCat] = (0, import_react.useState)(() => lastCategoryId());
	const [pasteOpen, setPasteOpen] = (0, import_react.useState)(false);
	const [pasteText, setPasteText] = (0, import_react.useState)("");
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
	const save = useMutation({
		mutationFn: saveProduct,
		onSuccess: (r) => {
			toast.success(r.sku ? `已儲存 ${r.sku}` : "商品已儲存");
			setEditing(null);
			setQuickName("");
			setQuickPrice("");
			qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	const dup = useMutation({
		mutationFn: duplicateProduct,
		onSuccess: (r) => {
			toast.success(`已複製為 ${r.sku}`);
			qc.invalidateQueries({ queryKey: ["products"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const importer = useMutation({
		mutationFn: importProducts,
		onSuccess: (r) => {
			toast.success(`已匯入 ${r.created} 款`);
			setPasteOpen(false);
			setPasteText("");
			qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	const archive = useMutation({
		mutationFn: archiveProduct,
		onSuccess: () => {
			toast.success("已更新上架狀態");
			qc.invalidateQueries({ queryKey: ["products"] });
		}
	});
	const list = (0, import_react.useMemo)(() => {
		const s = q.trim().toLowerCase();
		return (products.data ?? []).filter((p) => {
			if (!showInactive && !p.isActive) return false;
			if (cat && p.categoryId !== cat) return false;
			if (!s) return true;
			return p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s) || p.color.toLowerCase().includes(s) || p.categoryName.toLowerCase().includes(s);
		});
	}, [
		products.data,
		q,
		cat,
		showInactive
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: "Catalog",
			title: "商品",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: () => setPasteOpen(true),
					children: "貼上清單"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => setEditing({}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "完整資料"]
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mb-4 flex flex-col gap-2 rounded-xl bg-surface p-3 shadow-[var(--shadow-card)] sm:flex-row sm:items-end",
			onSubmit: (e) => {
				e.preventDefault();
				if (!quickName.trim()) {
					toast.error("填名稱就能新增");
					return;
				}
				const cat = quickCat || cats.data?.[0]?.id;
				save.mutate({ data: {
					name: quickName.trim(),
					price: Number(quickPrice) || 0,
					categoryId: cat
				} });
				if (cat) setLastCategoryId(cat);
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "快速新增（名稱＋售價，貨號自動編）",
					className: "flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: quickName,
						onChange: (e) => setQuickName(e.target.value),
						placeholder: "例如：醋酸方形抓夾"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "售價",
					className: "sm:w-28",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "decimal",
						value: quickPrice,
						onChange: (e) => setQuickPrice(e.target.value),
						placeholder: "180"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "分類",
					className: "sm:w-32",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
						value: quickCat || cats.data?.[0]?.id || 0,
						onChange: (e) => {
							const id = Number(e.target.value);
							setQuickCat(id);
							setLastCategoryId(id);
						},
						children: (cats.data ?? []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: c.id,
							children: c.name
						}, c.id))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: save.isPending,
					className: "sm:mb-0",
					children: save.isPending ? "新增中…" : "加入"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex flex-col gap-2 sm:flex-row",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "搜尋名稱、貨號、顏色",
						className: "pl-9"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
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
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: showInactive ? "subtle" : "outline",
					size: "sm",
					onClick: () => setShowInactive((v) => !v),
					children: showInactive ? "含已下架" : "僅上架"
				})
			]
		}),
		products.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
			children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-36 animate-pulse rounded-xl bg-surface" }, i))
		}) : list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "還沒有商品",
			body: "先新增髮夾、髮圈或耳環，之後進貨與銷貨就能自動扣補庫存。",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => setEditing({}),
				children: "新增第一件商品"
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
			children: list.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "flex flex-col p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: p.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-0.5 text-xs text-muted",
							children: [
								p.sku,
								" · ",
								p.categoryName,
								p.color ? ` · ${p.color}` : "",
								p.spec ? ` · ${p.spec}` : ""
							]
						})] }), !p.isActive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "已下架" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex items-end justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-subtle",
							children: "售價 / 成本"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "tabular-nums",
							children: [twd(p.price), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-1 text-xs text-muted",
								children: twd(p.cost)
							})]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							tone: p.stock === 0 ? "danger" : p.stock <= p.minStock ? "warn" : "ok",
							children: ["庫存 ", p.stock]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								className: "flex-1",
								onClick: () => setEditing(p),
								children: "編輯"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								className: "shrink-0",
								onClick: () => dup.mutate({ data: { id: p.id } }),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" }), "複製"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								className: "shrink-0",
								onClick: () => archive.mutate({ data: { id: p.id } }),
								children: p.isActive ? "下架" : "上架"
							})
						]
					})
				]
			}, p.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: pasteOpen,
			onOpenChange: setPasteOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				title: "貼上清單",
				description: "一行一款。可寫「名稱 售價」或「名稱,售價,成本,分類,顏色」。",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					value: pasteText,
					onChange: (e) => setPasteText(e.target.value),
					rows: 8,
					placeholder: "法式珍珠抓夾 180\n磨砂幾何側夾,129,32,髮夾,霧杏"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex justify-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: importer.isPending,
						onClick: () => importer.mutate({ data: { text: pasteText } }),
						children: importer.isPending ? "匯入中…" : "匯入"
					})
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: editing !== null,
			onOpenChange: (o) => !o && setEditing(null),
			children: editing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductForm, {
				initial: editing,
				categories: cats.data ?? [],
				saving: save.isPending,
				onSave: (payload) => save.mutate({ data: payload }),
				onAddCategory: async (name) => {
					const r = await addCategory({ data: { name } });
					await qc.invalidateQueries({ queryKey: ["categories"] });
					return r.id;
				}
			})
		})
	] });
}
function ProductForm({ initial, categories, saving, onSave, onAddCategory }) {
	const isNew = !initial.id;
	const [sku, setSku] = (0, import_react.useState)(initial.sku ?? "");
	const [name, setName] = (0, import_react.useState)(initial.name ?? "");
	const [categoryId, setCategoryId] = (0, import_react.useState)(initial.categoryId ?? categories[0]?.id ?? 0);
	const [color, setColor] = (0, import_react.useState)(initial.color ?? "");
	const [spec, setSpec] = (0, import_react.useState)(initial.spec ?? "");
	const [cost, setCost] = (0, import_react.useState)(String(initial.cost ?? 0));
	const [price, setPrice] = (0, import_react.useState)(String(initial.price ?? 0));
	const [minStock, setMinStock] = (0, import_react.useState)(String(initial.minStock ?? 5));
	const [stock, setStock] = (0, import_react.useState)(String(initial.stock ?? 0));
	const [newCat, setNewCat] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
		title: isNew ? "新增商品" : "編輯商品",
		description: "貨號留空會依分類自動編號。成本用於庫存價值與毛利。",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "grid gap-3 sm:grid-cols-2",
			onSubmit: (e) => {
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
					stock: isNew ? Number(stock) || 0 : void 0
				});
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "名稱",
					className: "sm:col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: name,
						onChange: (e) => setName(e.target.value),
						placeholder: "法式珍珠抓夾",
						required: true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "貨號 SKU（留空自動編）",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: sku,
						onChange: (e) => setSku(e.target.value),
						placeholder: "例如 HC-024"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "分類",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
						value: categoryId,
						onChange: (e) => setCategoryId(Number(e.target.value)),
						children: categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: c.id,
							children: c.name
						}, c.id))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sm:col-span-2 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: newCat,
						onChange: (e) => setNewCat(e.target.value),
						placeholder: "新增分類名稱"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						onClick: async () => {
							if (!newCat.trim()) return;
							try {
								const id = await onAddCategory(newCat.trim());
								setCategoryId(id);
								setNewCat("");
								toast.success("分類已新增");
							} catch (err) {
								toast.error(err instanceof Error ? err.message : "無法新增分類");
							}
						},
						children: "加入分類"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "顏色",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: color,
						onChange: (e) => setColor(e.target.value),
						placeholder: "米白"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "規格",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: spec,
						onChange: (e) => setSpec(e.target.value),
						placeholder: "8cm / 大"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "成本",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "decimal",
						value: cost,
						onChange: (e) => setCost(e.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "售價",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "decimal",
						value: price,
						onChange: (e) => setPrice(e.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "安全庫存",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "numeric",
						value: minStock,
						onChange: (e) => setMinStock(e.target.value)
					})
				}),
				isNew && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "開帳庫存",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "numeric",
						value: stock,
						onChange: (e) => setStock(e.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "sm:col-span-2 mt-2 flex justify-end gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: saving,
						children: saving ? "儲存中…" : "儲存"
					})
				})
			]
		})
	});
}
//#endregion
export { ProductsPage as component };
