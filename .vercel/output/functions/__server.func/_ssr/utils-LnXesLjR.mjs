import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-LnXesLjR.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function num(v) {
	if (v == null || v === "") return 0;
	const n = typeof v === "number" ? v : Number(v);
	return Number.isFinite(n) ? n : 0;
}
function todayISO() {
	const d = /* @__PURE__ */ new Date();
	const z = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}
function addDaysISO(iso, days) {
	const [y, m, d] = iso.split("-").map(Number);
	const dt = new Date(y, (m ?? 1) - 1, (d ?? 1) + days);
	const z = (n) => String(n).padStart(2, "0");
	return `${dt.getFullYear()}-${z(dt.getMonth() + 1)}-${z(dt.getDate())}`;
}
function formatDate(iso) {
	if (!iso) return "—";
	const [y, m, d] = iso.slice(0, 10).split("-");
	if (!y || !m || !d) return iso;
	return `${y}/${m}/${d}`;
}
function formatDateShort(iso) {
	const [, m, d] = iso.slice(0, 10).split("-");
	if (!m || !d) return iso;
	return `${Number(m)}/${Number(d)}`;
}
function twd(value, opts) {
	const n = Math.round(value);
	if (opts?.compact && Math.abs(n) >= 1e4) {
		const wan = n / 1e4;
		const digits = Math.abs(wan) >= 10 ? 0 : 1;
		return `NT$${wan.toFixed(digits)}萬`;
	}
	return new Intl.NumberFormat("zh-TW", {
		style: "currency",
		currency: "TWD",
		maximumFractionDigits: 0
	}).format(n);
}
function pct(value) {
	if (!Number.isFinite(value)) return "—";
	return `${(value * 100).toFixed(1)}%`;
}
//#endregion
export { num as a, twd as c, formatDateShort as i, cn as n, pct as o, formatDate as r, todayISO as s, addDaysISO as t };
