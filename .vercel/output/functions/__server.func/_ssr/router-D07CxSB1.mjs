import { o as __toESM } from "../_runtime.mjs";
import { n as cn, s as todayISO } from "./utils-LnXesLjR.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as createRootRoute, b as useRouter, d as useRouterState, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as number$1, c as union, i as literal, n as array, o as object, r as boolean, s as string, t as number } from "../_libs/zod.mjs";
import { _ as Boxes, d as PackagePlus, g as ChartLine, m as Flower2, p as LayoutDashboard, r as TriangleAlert, s as ShoppingBag } from "../_libs/lucide-react.mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-C0G-LivT.js
var import_jsx_runtime = require_jsx_runtime();
var NAV = [
	{
		to: "/",
		label: "總覽",
		icon: LayoutDashboard
	},
	{
		to: "/products",
		label: "商品",
		icon: Flower2
	},
	{
		to: "/purchases",
		label: "進貨",
		icon: PackagePlus
	},
	{
		to: "/sales",
		label: "銷貨",
		icon: ShoppingBag
	},
	{
		to: "/inventory",
		label: "庫存",
		icon: Boxes
	},
	{
		to: "/reports",
		label: "報表",
		icon: ChartLine
	}
];
function isActive(pathname, to) {
	if (to === "/") return pathname === "/";
	return pathname === to || pathname.startsWith(`${to}/`);
}
function AppShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-border bg-surface/90 px-4 py-6 backdrop-blur-sm md:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "mt-8 flex flex-1 flex-col gap-1",
						children: NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-150", isActive(pathname, item.to) ? "bg-tint text-primary" : "text-muted hover:bg-tint/60 hover:text-fg"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
								className: "size-4",
								strokeWidth: 1.75
							}), item.label]
						}, item.to))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "px-3 text-[11px] leading-relaxed text-subtle",
						children: [
							"髮飾／飾品進銷存",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"示範資料可直接改"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-20 flex items-center justify-between border-b border-border bg-bg/90 px-4 py-3 backdrop-blur-sm md:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { compact: true }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-muted",
					children: "進銷存"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "pb-24 md:ml-56 md:pb-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto max-w-6xl px-4 py-5 md:px-8 md:py-8",
					children
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-border bg-surface/95 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-sm md:hidden",
				children: NAV.map((item) => {
					const active = isActive(pathname, item.to);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: item.to,
						className: cn("flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-md text-[10px] font-medium", active ? "text-primary" : "text-subtle"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
							className: "size-4",
							strokeWidth: active ? 2.2 : 1.75
						}), item.label]
					}, item.to);
				})
			})
		]
	});
}
function Brand({ compact }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex size-9 items-center justify-center rounded-md bg-primary text-primary-fg",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 32 32",
				className: "size-5",
				"aria-hidden": true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M8 21c4-8 12-8 16 0",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "2.4",
					strokeLinecap: "round"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "16",
					cy: "11.5",
					r: "2.1",
					fill: "currentColor"
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "leading-none",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-display text-lg tracking-wide",
				children: "飾記"
			}), !compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-[10px] tracking-[0.18em] text-subtle uppercase",
				children: "Atelier Ledger"
			})]
		})]
	});
}
function PageHeader({ title, kicker, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-5 flex flex-wrap items-end justify-between gap-3 md:mb-7",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [kicker && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-1 text-[11px] font-medium tracking-[0.16em] text-subtle uppercase",
			children: kicker
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl text-fg md:text-3xl",
			children: title
		})] }), action]
	});
}
function EmptyState({ title, body, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/50 px-6 py-14 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-lg",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-sm text-sm text-muted",
				children: body
			}),
			action && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: action
			})
		]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var lineSchema = object({
	productId: number().int().positive(),
	qty: number().int().positive(),
	unit: number().nonnegative()
});
var productInput = object({
	id: number().int().positive().optional(),
	sku: string().trim().max(40).optional().default(""),
	name: string().trim().min(1).max(80),
	categoryId: number().int().positive().optional(),
	color: string().trim().max(40).optional().default(""),
	spec: string().trim().max(80).optional().default(""),
	cost: number().nonnegative().optional().default(0),
	price: number().nonnegative(),
	minStock: number().int().nonnegative().optional().default(5),
	stock: number().int().nonnegative().optional()
});
var listCategories = createServerFn({ method: "GET" }).handler(createSsrRpc("c1361515dd935fef648e109305d13cf48a49f650e50a6652b295ce1c5b195f26"));
var listSuppliers = createServerFn({ method: "GET" }).handler(createSsrRpc("53d01ae56826a0e6e80ecb58059e68101ca601cb8e0daaa0176a80e41991c257"));
var listProducts = createServerFn({ method: "GET" }).validator((data) => object({
	q: string().optional().default(""),
	categoryId: number().int().optional(),
	includeInactive: boolean().optional().default(false)
}).parse(data ?? {})).handler(createSsrRpc("92a569a7eaff3a3fd874d6bcac03b2afde52a4ae5184b8a8eca6e1853b83d943"));
var saveProduct = createServerFn({ method: "POST" }).validator((data) => productInput.parse(data)).handler(createSsrRpc("a2f8749c6746146fe46304240eef2351f24dd821b8955b2ea1eef1ea3dad75b6"));
var archiveProduct = createServerFn({ method: "POST" }).validator((data) => object({ id: number().int().positive() }).parse(data)).handler(createSsrRpc("a112451e1fc28447f74d6951254ea7a855bf63096c801b98762ff0b9bd4d023e"));
var addCategory = createServerFn({ method: "POST" }).validator((data) => object({ name: string().trim().min(1).max(20) }).parse(data)).handler(createSsrRpc("ca860ed935bbe772428ccf46f73895256dd3d3dbc43d9240ee4eef46c3f12f1e"));
createServerFn({ method: "POST" }).validator((data) => object({ name: string().trim().min(1).max(40) }).parse(data)).handler(createSsrRpc("3d0cda0f4c8eaa717becd12bbdfdf1216d1db522a05b466e4dad8ba87ac27d99"));
var duplicateProduct = createServerFn({ method: "POST" }).validator((data) => object({ id: number().int().positive() }).parse(data)).handler(createSsrRpc("539e50b7750249205ba96c14ecf6e5049b0f4597e135ba9286f66e8d7449ed8a"));
var importProducts = createServerFn({ method: "POST" }).validator((data) => object({ text: string().min(1).max(2e4) }).parse(data)).handler(createSsrRpc("45fbb47ca3936343c993ef0c0a74737e959a62b12b8bb57a2aab7d3a101ad989"));
var suggestRestock = createServerFn({ method: "GET" }).handler(createSsrRpc("46690abd992f1bf1f0bf5f30bafb031210e7cdcd2a5fb48d1dc36bffccf61794"));
var listPurchases = createServerFn({ method: "GET" }).handler(createSsrRpc("9840c9f131d72ff64b417c6a21f8746c809c02f54d32076ec781bea3d32b3100"));
var getPurchase = createServerFn({ method: "GET" }).validator((data) => object({ id: number().int().positive() }).parse(data)).handler(createSsrRpc("ec9dbde553d56573cf081524a47ea21128160e5f355e2679b1bb758c3b8628de"));
var createPurchase = createServerFn({ method: "POST" }).validator((data) => object({
	occurredOn: string().regex(/^\d{4}-\d{2}-\d{2}$/),
	supplierId: number().int().positive().optional(),
	supplierName: string().trim().max(40).optional().default(""),
	note: string().trim().max(200).optional().default(""),
	lines: array(lineSchema).min(1, "請至少加入一項商品")
}).parse(data)).handler(createSsrRpc("53f79f1e9a277f81ee6e41b4640d893018a20f0bfa13670b598b489e2653c2bf"));
var listSales = createServerFn({ method: "GET" }).handler(createSsrRpc("df9df99ac3d1ab085e104cfdf26b1f6e6a8540bb5bd7a1376cc8807858e3ade4"));
var getSale = createServerFn({ method: "GET" }).validator((data) => object({ id: number().int().positive() }).parse(data)).handler(createSsrRpc("a25e873473396af24c59560cf187207720942832294da7b666f93b9a7d31c384"));
var createSale = createServerFn({ method: "POST" }).validator((data) => object({
	occurredOn: string().regex(/^\d{4}-\d{2}-\d{2}$/),
	channel: string().trim().min(1).max(20),
	note: string().trim().max(200).optional().default(""),
	lines: array(lineSchema).min(1, "請至少加入一項商品")
}).parse(data)).handler(createSsrRpc("1db10e5aabb5ec238c4e69e6b624ebaa903ea1af36d72f587162d3a36fd184c7"));
var adjustStock = createServerFn({ method: "POST" }).validator((data) => object({
	productId: number().int().positive(),
	newQty: number().int().nonnegative(),
	note: string().trim().max(120).optional().default("盤點調整")
}).parse(data)).handler(createSsrRpc("ebfa04f890d64d71549d61fa41d91ba94e9c0a8beb371dda13440880fb163f09"));
var listStockMoves = createServerFn({ method: "GET" }).validator((data) => object({ productId: number().int().positive().optional() }).parse(data ?? {})).handler(createSsrRpc("1eb90ed6baa7f187627ba5aa78d889217fe4063d32c899a5e2cdf769d34f8f44"));
var getDashboard = createServerFn({ method: "GET" }).handler(createSsrRpc("2834875938522524f82d22285f32ee725ef8521dd02e4911423f3fe6a1ffa75d"));
var getReport = createServerFn({ method: "GET" }).validator((data) => object({
	from: string().regex(/^\d{4}-\d{2}-\d{2}$/),
	to: string().regex(/^\d{4}-\d{2}-\d{2}$/)
}).parse(data)).handler(createSsrRpc("3b90563c1211d84aa7b63c2852cf82b194b4a26ab9557181eb1bfdf42dd32a2f"));
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-D07CxSB1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-danger",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-lg",
				children: "出了一點問題"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-muted",
				children: error.message || "發生未預期的錯誤，請重新整理頁面。"
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number$1().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	if (typeof window === "undefined") return () => {};
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	const parentOrigin = resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		if (envelope.data.type === "hello") {
			if (!HelloSchema.safeParse(event.data).success) return;
			announce();
			return;
		}
		if (envelope.data.type === "navigate") {
			const parsed = NavigateSchema.safeParse(event.data);
			if (!parsed.success) return;
			navigate(parsed.data.path);
			queueMicrotask(reportLocation);
			return;
		}
		if (envelope.data.type === "history") {
			const parsed = HistorySchema.safeParse(event.data);
			if (!parsed.success) return;
			if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
			window.history.go(parsed.data.delta);
		}
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-BBdv4Whz.css";
var APP_NAME = "飾記";
var Route$6 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#6B3940"
			},
			{
				name: "description",
				content: "飾記 — 髮飾與女性飾品進銷存，商品、進貨、銷貨、庫存一次完成。"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600;700&family=Noto+Serif+TC:wght@500;600;700&display=swap"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: RootComponent
});
function RootComponent() {
	const [queryClient] = (0, import_react.useState)(() => new QueryClient({ defaultOptions: { queries: {
		staleTime: 8e3,
		retry: 1,
		refetchOnWindowFocus: false
	} } }));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "zh-Hant",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "antialiased",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
					client: queryClient,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
						position: "top-center",
						toastOptions: { className: "font-sans" }
					})]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	});
}
var $$splitComponentImporter$5 = () => import("./routes-BE1K1nKn.mjs");
var Route$5 = createFileRoute("/")({
	loader: () => getDashboard(),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./inventory-BBS3-TNM.mjs");
var Route$4 = createFileRoute("/inventory")({
	loader: async () => {
		const [categories, products, moves] = await Promise.all([
			listCategories(),
			listProducts({ data: { includeInactive: false } }),
			listStockMoves({ data: {} })
		]);
		return {
			categories,
			products,
			moves
		};
	},
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./products-Bnrtru55.mjs");
var Route$3 = createFileRoute("/products")({
	loader: async () => {
		const [categories, products] = await Promise.all([listCategories(), listProducts({ data: { includeInactive: true } })]);
		return {
			categories,
			products
		};
	},
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./purchases-DG21PamA.mjs");
var Route$2 = createFileRoute("/purchases")({
	validateSearch: (raw) => ({ fill: raw.fill === "low" ? "low" : void 0 }),
	loader: async () => {
		const [purchases, products, suppliers, categories] = await Promise.all([
			listPurchases(),
			listProducts({ data: { includeInactive: false } }),
			listSuppliers(),
			listCategories()
		]);
		return {
			purchases,
			products,
			suppliers,
			categories
		};
	},
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
function monthStart(iso) {
	return `${iso.slice(0, 7)}-01`;
}
var $$splitComponentImporter$1 = () => import("./reports-B81Y-KWq.mjs");
var Route$1 = createFileRoute("/reports")({
	loader: () => {
		const today = todayISO();
		return getReport({ data: {
			from: monthStart(today),
			to: today
		} });
	},
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./sales-BW8H_ajj.mjs");
var Route = createFileRoute("/sales")({
	loader: async () => {
		const [sales, products, categories] = await Promise.all([
			listSales(),
			listProducts({ data: { includeInactive: false } }),
			listCategories()
		]);
		return {
			sales,
			products,
			categories
		};
	},
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var rootRouteChildren = {
	IndexRoute: Route$5.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$6
	}),
	InventoryRoute: Route$4.update({
		id: "/inventory",
		path: "/inventory",
		getParentRoute: () => Route$6
	}),
	ProductsRoute: Route$3.update({
		id: "/products",
		path: "/products",
		getParentRoute: () => Route$6
	}),
	PurchasesRoute: Route$2.update({
		id: "/purchases",
		path: "/purchases",
		getParentRoute: () => Route$6
	}),
	ReportsRoute: Route$1.update({
		id: "/reports",
		path: "/reports",
		getParentRoute: () => Route$6
	}),
	SalesRoute: Route.update({
		id: "/sales",
		path: "/sales",
		getParentRoute: () => Route$6
	})
};
var routeTree = Route$6._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { listProducts as C, listSuppliers as D, listStockMoves as E, saveProduct as O, listCategories as S, listSales as T, getDashboard as _, Route$2 as a, getSale as b, Route$5 as c, addCategory as d, adjustStock as f, duplicateProduct as g, createSale as h, monthStart as i, suggestRestock as k, EmptyState as l, createPurchase as m, Route as n, Route$3 as o, archiveProduct as p, Route$1 as r, Route$4 as s, router_exports as t, PageHeader as u, getPurchase as v, listPurchases as w, importProducts as x, getReport as y };
