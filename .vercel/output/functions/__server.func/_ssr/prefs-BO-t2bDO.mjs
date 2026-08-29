//#region node_modules/.nitro/vite/services/ssr/assets/prefs-BO-t2bDO.js
var KEYS = {
	channel: "shiji.lastChannel",
	supplierId: "shiji.lastSupplierId",
	categoryId: "shiji.lastCategoryId"
};
function read(key, fallback) {
	if (typeof window === "undefined") return fallback;
	return window.localStorage.getItem(key) ?? fallback;
}
function write(key, value) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(key, value);
}
function lastChannel() {
	return read(KEYS.channel, "門市");
}
function setLastChannel(v) {
	write(KEYS.channel, v);
}
function lastSupplierId() {
	return Number(read(KEYS.supplierId, "0")) || 0;
}
function setLastSupplierId(id) {
	write(KEYS.supplierId, String(id));
}
function lastCategoryId() {
	return Number(read(KEYS.categoryId, "0")) || 0;
}
function setLastCategoryId(id) {
	write(KEYS.categoryId, String(id));
}
//#endregion
export { setLastChannel as a, setLastCategoryId as i, lastChannel as n, setLastSupplierId as o, lastSupplierId as r, lastCategoryId as t };
