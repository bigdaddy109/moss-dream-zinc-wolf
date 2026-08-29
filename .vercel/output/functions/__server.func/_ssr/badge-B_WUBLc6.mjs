import { n as cn } from "./utils-LnXesLjR.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-B_WUBLc6.js
var import_jsx_runtime = require_jsx_runtime();
function Badge({ children, tone = "neutral", className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide", tone === "neutral" && "bg-border/70 text-muted", tone === "ok" && "bg-ok-bg text-ok", tone === "warn" && "bg-warn-bg text-warn", tone === "danger" && "bg-danger-bg text-danger", tone === "primary" && "bg-tint text-primary", className),
		children
	});
}
function Card({ className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-xl bg-surface p-4 shadow-[var(--shadow-card)] md:p-5", className),
		children
	});
}
//#endregion
export { Card as n, Badge as t };
