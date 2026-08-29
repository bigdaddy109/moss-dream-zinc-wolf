const KEYS = {
  channel: "shiji.lastChannel",
  supplierId: "shiji.lastSupplierId",
  categoryId: "shiji.lastCategoryId",
} as const;

function read(key: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return window.localStorage.getItem(key) ?? fallback;
}

function write(key: string, value: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
}

export function lastChannel(): string {
  return read(KEYS.channel, "門市");
}
export function setLastChannel(v: string) {
  write(KEYS.channel, v);
}

export function lastSupplierId(): number {
  return Number(read(KEYS.supplierId, "0")) || 0;
}
export function setLastSupplierId(id: number) {
  write(KEYS.supplierId, String(id));
}

export function lastCategoryId(): number {
  return Number(read(KEYS.categoryId, "0")) || 0;
}
export function setLastCategoryId(id: number) {
  write(KEYS.categoryId, String(id));
}
