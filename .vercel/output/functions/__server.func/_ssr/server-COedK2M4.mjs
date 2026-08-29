import { a as num, s as todayISO } from "./utils-LnXesLjR.mjs";
import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { n as array, o as object, r as boolean, s as string, t as number } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-COedK2M4.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
async function db() {
	const { getSql } = await import("./db-C1_6VLEU.mjs");
	const { ensureSeed } = await import("./seed-Jy_EB_3e.mjs");
	const sql = await getSql();
	await ensureSeed(sql);
	return sql;
}
function mapProduct(r) {
	return {
		id: num(r.id),
		sku: String(r.sku),
		name: String(r.name),
		categoryId: num(r.category_id),
		categoryName: String(r.category_name ?? ""),
		color: String(r.color ?? ""),
		spec: String(r.spec ?? ""),
		cost: num(r.cost),
		price: num(r.price),
		stock: num(r.stock),
		minStock: num(r.min_stock),
		isActive: Boolean(r.is_active)
	};
}
var PRODUCT_SQL = `
  select p.id, p.sku, p.name, p.category_id, c.name as category_name,
         p.color, p.spec, p.cost, p.price, p.stock, p.min_stock, p.is_active
  from products p
  join categories c on c.id = p.category_id
`;
async function nextNumber(sql, table, prefix, date) {
	const head = `${prefix}-${date.slice(2, 4)}${date.slice(5, 7)}${date.slice(8, 10)}-`;
	const last = (await sql.query(`select number from ${table} where number like $1 order by number desc limit 1`, [`${head}%`]))[0]?.number;
	const n = last ? Number(last.slice(head.length)) + 1 : 1;
	return `${head}${String(Number.isFinite(n) ? n : 1).padStart(2, "0")}`;
}
var SKU_PREFIX = {
	髮夾: "HC",
	髮圈: "HT",
	髮箍: "HB",
	髮帶: "BD",
	耳環: "ER",
	項鍊: "NK",
	手鍊: "BR",
	套組: "ST"
};
async function allocateSku(sql, categoryId) {
	const prefix = SKU_PREFIX[(await sql.query("select name from categories where id = $1", [categoryId]))[0]?.name ?? ""] ?? "ACC";
	const rows = await sql.query("select sku from products where sku like $1 order by sku desc limit 20", [`${prefix}-%`]);
	let max = 0;
	for (const r of rows) {
		const n = Number(r.sku.slice(prefix.length + 1));
		if (Number.isFinite(n) && n > max) max = n;
	}
	return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}
async function firstCategoryId(sql) {
	const rows = await sql.query("select id from categories order by sort_order, id limit 1");
	if (!rows[0]) throw new Error("請先新增一個分類");
	return rows[0].id;
}
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
var listCategories_createServerFn_handler = createServerRpc({
	id: "c1361515dd935fef648e109305d13cf48a49f650e50a6652b295ce1c5b195f26",
	name: "listCategories",
	filename: "src/lib/inventory/server.ts"
}, (opts) => listCategories.__executeServer(opts));
var listCategories = createServerFn({ method: "GET" }).handler(listCategories_createServerFn_handler, async () => {
	return (await (await db()).query("select id, name, sort_order from categories order by sort_order, id")).map((r) => ({
		id: r.id,
		name: r.name,
		sortOrder: r.sort_order
	}));
});
var listSuppliers_createServerFn_handler = createServerRpc({
	id: "53d01ae56826a0e6e80ecb58059e68101ca601cb8e0daaa0176a80e41991c257",
	name: "listSuppliers",
	filename: "src/lib/inventory/server.ts"
}, (opts) => listSuppliers.__executeServer(opts));
var listSuppliers = createServerFn({ method: "GET" }).handler(listSuppliers_createServerFn_handler, async () => {
	return (await (await db()).query("select id, name, note from suppliers order by name")).map((r) => ({
		id: r.id,
		name: r.name,
		note: r.note
	}));
});
var listProducts_createServerFn_handler = createServerRpc({
	id: "92a569a7eaff3a3fd874d6bcac03b2afde52a4ae5184b8a8eca6e1853b83d943",
	name: "listProducts",
	filename: "src/lib/inventory/server.ts"
}, (opts) => listProducts.__executeServer(opts));
var listProducts = createServerFn({ method: "GET" }).validator((data) => object({
	q: string().optional().default(""),
	categoryId: number().int().optional(),
	includeInactive: boolean().optional().default(false)
}).parse(data ?? {})).handler(listProducts_createServerFn_handler, async ({ data }) => {
	const sql = await db();
	const params = [];
	const where = [];
	if (!data.includeInactive) where.push("p.is_active = true");
	if (data.q.trim()) {
		params.push(`%${data.q.trim()}%`);
		const i = params.length;
		where.push(`(p.name ilike $${i} or p.sku ilike $${i} or p.color ilike $${i} or c.name ilike $${i})`);
	}
	if (data.categoryId && data.categoryId > 0) {
		params.push(data.categoryId);
		where.push(`p.category_id = $${params.length}`);
	}
	const clause = where.length ? `where ${where.join(" and ")}` : "";
	return (await sql.query(`${PRODUCT_SQL} ${clause} order by p.is_active desc, p.sku`, params)).map(mapProduct);
});
var saveProduct_createServerFn_handler = createServerRpc({
	id: "a2f8749c6746146fe46304240eef2351f24dd821b8955b2ea1eef1ea3dad75b6",
	name: "saveProduct",
	filename: "src/lib/inventory/server.ts"
}, (opts) => saveProduct.__executeServer(opts));
var saveProduct = createServerFn({ method: "POST" }).validator((data) => productInput.parse(data)).handler(saveProduct_createServerFn_handler, async ({ data }) => {
	const sql = await db();
	const categoryId = data.categoryId ?? await firstCategoryId(sql);
	const sku = data.sku?.trim() || await allocateSku(sql, categoryId);
	if (data.id) {
		const updated = await sql.query(`update products
           set sku=$2, name=$3, category_id=$4, color=$5, spec=$6,
               cost=$7, price=$8, min_stock=$9, updated_at=now()
         where id=$1
         returning id`, [
			data.id,
			sku,
			data.name,
			categoryId,
			data.color,
			data.spec,
			data.cost,
			data.price,
			data.minStock
		]);
		if (!updated[0]) throw new Error("找不到這個商品");
		return {
			id: updated[0].id,
			sku
		};
	}
	const stock = data.stock ?? 0;
	try {
		const id = (await sql.query(`insert into products
           (sku, name, category_id, color, spec, cost, price, stock, min_stock)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         returning id`, [
			sku,
			data.name,
			categoryId,
			data.color,
			data.spec,
			data.cost,
			data.price,
			stock,
			data.minStock
		]))[0].id;
		if (stock !== 0) await sql.query(`insert into stock_moves (product_id, kind, qty_delta, ref_type, note)
           values ($1,'adjust',$2,'product','開帳庫存')`, [id, stock]);
		return {
			id,
			sku
		};
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		if (msg.includes("products_sku") || msg.toLowerCase().includes("unique")) throw new Error("貨號已存在，請換一個 SKU");
		throw err;
	}
});
var archiveProduct_createServerFn_handler = createServerRpc({
	id: "a112451e1fc28447f74d6951254ea7a855bf63096c801b98762ff0b9bd4d023e",
	name: "archiveProduct",
	filename: "src/lib/inventory/server.ts"
}, (opts) => archiveProduct.__executeServer(opts));
var archiveProduct = createServerFn({ method: "POST" }).validator((data) => object({ id: number().int().positive() }).parse(data)).handler(archiveProduct_createServerFn_handler, async ({ data }) => {
	await (await db()).query("update products set is_active = not is_active, updated_at = now() where id = $1", [data.id]);
	return { ok: true };
});
var addCategory_createServerFn_handler = createServerRpc({
	id: "ca860ed935bbe772428ccf46f73895256dd3d3dbc43d9240ee4eef46c3f12f1e",
	name: "addCategory",
	filename: "src/lib/inventory/server.ts"
}, (opts) => addCategory.__executeServer(opts));
var addCategory = createServerFn({ method: "POST" }).validator((data) => object({ name: string().trim().min(1).max(20) }).parse(data)).handler(addCategory_createServerFn_handler, async ({ data }) => {
	const sql = await db();
	try {
		const max = await sql.query("select coalesce(max(sort_order),0)::int as n from categories");
		return { id: (await sql.query("insert into categories (name, sort_order) values ($1,$2) returning id", [data.name, (max[0]?.n ?? 0) + 1]))[0].id };
	} catch {
		throw new Error("分類名稱已存在");
	}
});
var addSupplier_createServerFn_handler = createServerRpc({
	id: "3d0cda0f4c8eaa717becd12bbdfdf1216d1db522a05b466e4dad8ba87ac27d99",
	name: "addSupplier",
	filename: "src/lib/inventory/server.ts"
}, (opts) => addSupplier.__executeServer(opts));
var addSupplier = createServerFn({ method: "POST" }).validator((data) => object({ name: string().trim().min(1).max(40) }).parse(data)).handler(addSupplier_createServerFn_handler, async ({ data }) => {
	const sql = await db();
	const existing = await sql.query("select id from suppliers where name = $1", [data.name]);
	if (existing[0]) return { id: existing[0].id };
	return { id: (await sql.query("insert into suppliers (name, note) values ($1,'') returning id", [data.name]))[0].id };
});
var duplicateProduct_createServerFn_handler = createServerRpc({
	id: "539e50b7750249205ba96c14ecf6e5049b0f4597e135ba9286f66e8d7449ed8a",
	name: "duplicateProduct",
	filename: "src/lib/inventory/server.ts"
}, (opts) => duplicateProduct.__executeServer(opts));
var duplicateProduct = createServerFn({ method: "POST" }).validator((data) => object({ id: number().int().positive() }).parse(data)).handler(duplicateProduct_createServerFn_handler, async ({ data }) => {
	const sql = await db();
	const src = await sql.query(`${PRODUCT_SQL} where p.id = $1`, [data.id]);
	if (!src[0]) throw new Error("找不到商品");
	const p = mapProduct(src[0]);
	const sku = await allocateSku(sql, p.categoryId);
	const name = p.name.endsWith(" 副本") ? p.name : `${p.name} 副本`;
	return {
		id: (await sql.query(`insert into products
         (sku, name, category_id, color, spec, cost, price, stock, min_stock)
       values ($1,$2,$3,$4,$5,$6,$7,0,$8)
       returning id`, [
			sku,
			name,
			p.categoryId,
			p.color,
			p.spec,
			p.cost,
			p.price,
			p.minStock
		]))[0].id,
		sku
	};
});
var importProducts_createServerFn_handler = createServerRpc({
	id: "45fbb47ca3936343c993ef0c0a74737e959a62b12b8bb57a2aab7d3a101ad989",
	name: "importProducts",
	filename: "src/lib/inventory/server.ts"
}, (opts) => importProducts.__executeServer(opts));
var importProducts = createServerFn({ method: "POST" }).validator((data) => object({ text: string().min(1).max(2e4) }).parse(data)).handler(importProducts_createServerFn_handler, async ({ data }) => {
	const sql = await db();
	const cats = await sql.query("select id, name from categories");
	const catByName = new Map(cats.map((c) => [c.name, c.id]));
	const fallback = cats[0]?.id;
	if (!fallback) throw new Error("請先新增一個分類");
	const lines = data.text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("名稱") && !l.startsWith("#"));
	let created = 0;
	for (const line of lines) {
		const parts = line.includes(",") ? line.split(",").map((s) => s.trim()) : line.split(/\s+/);
		if (parts.length === 0) continue;
		let name = "";
		let price = 0;
		let cost = 0;
		let categoryId = fallback;
		let color = "";
		if (line.includes(",")) {
			name = parts[0] ?? "";
			price = Number(parts[1]) || 0;
			cost = Number(parts[2]) || 0;
			if (parts[3] && catByName.has(parts[3])) categoryId = catByName.get(parts[3]);
			color = parts[4] ?? "";
		} else {
			const last = parts[parts.length - 1];
			const n = Number(last);
			if (Number.isFinite(n) && parts.length >= 2) {
				price = n;
				name = parts.slice(0, -1).join(" ");
			} else name = line;
		}
		if (!name) continue;
		const sku = await allocateSku(sql, categoryId);
		await sql.query(`insert into products
           (sku, name, category_id, color, spec, cost, price, stock, min_stock)
         values ($1,$2,$3,$4,'',$5,$6,0,5)`, [
			sku,
			name.slice(0, 80),
			categoryId,
			color.slice(0, 40),
			cost,
			price
		]);
		created += 1;
	}
	if (created === 0) throw new Error("沒有讀到可匯入的列");
	return { created };
});
var suggestRestock_createServerFn_handler = createServerRpc({
	id: "46690abd992f1bf1f0bf5f30bafb031210e7cdcd2a5fb48d1dc36bffccf61794",
	name: "suggestRestock",
	filename: "src/lib/inventory/server.ts"
}, (opts) => suggestRestock.__executeServer(opts));
var suggestRestock = createServerFn({ method: "GET" }).handler(suggestRestock_createServerFn_handler, async () => {
	const sql = await db();
	const low = await sql.query(`${PRODUCT_SQL}
       where p.is_active = true and p.stock <= p.min_stock
       order by (p.stock = 0) desc, p.stock asc, p.sku`);
	const lastSup = await sql.query(`select s.id, s.name
       from purchases pu
       join suppliers s on s.id = pu.supplier_id
       order by pu.occurred_on desc, pu.id desc
       limit 1`);
	const lines = low.map((r) => {
		const p = mapProduct(r);
		const target = Math.max(p.minStock * 2, p.minStock + 4);
		const qty = Math.max(target - p.stock, 1);
		return {
			key: String(p.id),
			productId: p.id,
			name: p.name,
			sku: p.sku,
			stock: p.stock,
			qty,
			unit: p.cost
		};
	});
	return {
		supplierId: lastSup[0]?.id ?? null,
		supplierName: lastSup[0]?.name ?? "",
		lines
	};
});
var listPurchases_createServerFn_handler = createServerRpc({
	id: "9840c9f131d72ff64b417c6a21f8746c809c02f54d32076ec781bea3d32b3100",
	name: "listPurchases",
	filename: "src/lib/inventory/server.ts"
}, (opts) => listPurchases.__executeServer(opts));
var listPurchases = createServerFn({ method: "GET" }).handler(listPurchases_createServerFn_handler, async () => {
	return (await (await db()).query(`select pu.id, pu.number, pu.occurred_on::text as occurred_on, pu.note,
              coalesce(s.name, '未指定') as supplier_name,
              count(i.id)::int as item_count,
              coalesce(sum(i.qty),0)::int as qty,
              coalesce(sum(i.qty * i.unit_cost),0) as total
       from purchases pu
       left join suppliers s on s.id = pu.supplier_id
       left join purchase_items i on i.purchase_id = pu.id
       group by pu.id, s.name
       order by pu.occurred_on desc, pu.id desc
       limit 200`)).map((r) => ({
		id: num(r.id),
		number: String(r.number),
		occurredOn: String(r.occurred_on).slice(0, 10),
		supplierName: String(r.supplier_name),
		note: String(r.note ?? ""),
		itemCount: num(r.item_count),
		qty: num(r.qty),
		total: num(r.total)
	}));
});
var getPurchase_createServerFn_handler = createServerRpc({
	id: "ec9dbde553d56573cf081524a47ea21128160e5f355e2679b1bb758c3b8628de",
	name: "getPurchase",
	filename: "src/lib/inventory/server.ts"
}, (opts) => getPurchase.__executeServer(opts));
var getPurchase = createServerFn({ method: "GET" }).validator((data) => object({ id: number().int().positive() }).parse(data)).handler(getPurchase_createServerFn_handler, async ({ data }) => {
	const sql = await db();
	const head = await sql.query(`select pu.id, pu.number, pu.occurred_on::text as occurred_on, pu.note,
              coalesce(s.name, '未指定') as supplier_name
       from purchases pu
       left join suppliers s on s.id = pu.supplier_id
       where pu.id = $1`, [data.id]);
	if (!head[0]) throw new Error("找不到進貨單");
	const mapped = (await sql.query(`select i.product_id, i.qty, i.unit_cost, p.name, p.sku
       from purchase_items i
       join products p on p.id = i.product_id
       where i.purchase_id = $1
       order by i.id`, [data.id])).map((i) => ({
		productId: num(i.product_id),
		name: String(i.name),
		sku: String(i.sku),
		qty: num(i.qty),
		unitCost: num(i.unit_cost)
	}));
	const h = head[0];
	return {
		id: num(h.id),
		number: String(h.number),
		occurredOn: String(h.occurred_on).slice(0, 10),
		supplierName: String(h.supplier_name),
		note: String(h.note ?? ""),
		itemCount: mapped.length,
		qty: mapped.reduce((a, x) => a + x.qty, 0),
		total: mapped.reduce((a, x) => a + x.qty * x.unitCost, 0),
		items: mapped
	};
});
var createPurchase_createServerFn_handler = createServerRpc({
	id: "53f79f1e9a277f81ee6e41b4640d893018a20f0bfa13670b598b489e2653c2bf",
	name: "createPurchase",
	filename: "src/lib/inventory/server.ts"
}, (opts) => createPurchase.__executeServer(opts));
var createPurchase = createServerFn({ method: "POST" }).validator((data) => object({
	occurredOn: string().regex(/^\d{4}-\d{2}-\d{2}$/),
	supplierId: number().int().positive().optional(),
	supplierName: string().trim().max(40).optional().default(""),
	note: string().trim().max(200).optional().default(""),
	lines: array(lineSchema).min(1, "請至少加入一項商品")
}).parse(data)).handler(createPurchase_createServerFn_handler, async ({ data }) => {
	const sql = await db();
	let supplierId = data.supplierId;
	if (!supplierId && data.supplierName) {
		const existing = await sql.query("select id from suppliers where name = $1", [data.supplierName]);
		if (existing[0]) supplierId = existing[0].id;
		else supplierId = (await sql.query("insert into suppliers (name, note) values ($1,'') returning id", [data.supplierName]))[0].id;
	}
	const number = await nextNumber(sql, "purchases", "IN", data.occurredOn);
	const id = (await sql.query("insert into purchases (number, supplier_id, occurred_on, note) values ($1,$2,$3,$4) returning id", [
		number,
		supplierId ?? null,
		data.occurredOn,
		data.note
	]))[0].id;
	for (const line of data.lines) {
		if (!(await sql.query("select id, name from products where id = $1", [line.productId]))[0]) throw new Error("商品不存在");
		await sql.query("insert into purchase_items (purchase_id, product_id, qty, unit_cost) values ($1,$2,$3,$4)", [
			id,
			line.productId,
			line.qty,
			line.unit
		]);
		await sql.query("update products set stock = stock + $2, cost = $3, updated_at = now() where id = $1", [
			line.productId,
			line.qty,
			line.unit
		]);
		await sql.query(`insert into stock_moves (product_id, kind, qty_delta, ref_type, ref_id, note)
         values ($1,'purchase',$2,'purchase',$3,'進貨')`, [
			line.productId,
			line.qty,
			id
		]);
	}
	return {
		id,
		number
	};
});
var listSales_createServerFn_handler = createServerRpc({
	id: "df9df99ac3d1ab085e104cfdf26b1f6e6a8540bb5bd7a1376cc8807858e3ade4",
	name: "listSales",
	filename: "src/lib/inventory/server.ts"
}, (opts) => listSales.__executeServer(opts));
var listSales = createServerFn({ method: "GET" }).handler(listSales_createServerFn_handler, async () => {
	return (await (await db()).query(`select sa.id, sa.number, sa.occurred_on::text as occurred_on, sa.channel, sa.note,
            count(i.id)::int as item_count,
            coalesce(sum(i.qty),0)::int as qty,
            coalesce(sum(i.qty * i.unit_price),0) as total,
            coalesce(sum(i.qty * i.unit_cost),0) as cost
     from sales sa
     left join sale_items i on i.sale_id = sa.id
     group by sa.id
     order by sa.occurred_on desc, sa.id desc
     limit 200`)).map((r) => {
		const total = num(r.total);
		const cost = num(r.cost);
		return {
			id: num(r.id),
			number: String(r.number),
			occurredOn: String(r.occurred_on).slice(0, 10),
			channel: String(r.channel),
			note: String(r.note ?? ""),
			itemCount: num(r.item_count),
			qty: num(r.qty),
			total,
			cost,
			profit: total - cost
		};
	});
});
var getSale_createServerFn_handler = createServerRpc({
	id: "a25e873473396af24c59560cf187207720942832294da7b666f93b9a7d31c384",
	name: "getSale",
	filename: "src/lib/inventory/server.ts"
}, (opts) => getSale.__executeServer(opts));
var getSale = createServerFn({ method: "GET" }).validator((data) => object({ id: number().int().positive() }).parse(data)).handler(getSale_createServerFn_handler, async ({ data }) => {
	const sql = await db();
	const head = await sql.query(`select id, number, occurred_on::text as occurred_on, channel, note
       from sales where id = $1`, [data.id]);
	if (!head[0]) throw new Error("找不到銷貨單");
	const mapped = (await sql.query(`select i.product_id, i.qty, i.unit_price, i.unit_cost, p.name, p.sku
       from sale_items i
       join products p on p.id = i.product_id
       where i.sale_id = $1
       order by i.id`, [data.id])).map((i) => ({
		productId: num(i.product_id),
		name: String(i.name),
		sku: String(i.sku),
		qty: num(i.qty),
		unitPrice: num(i.unit_price),
		unitCost: num(i.unit_cost)
	}));
	const total = mapped.reduce((a, x) => a + x.qty * x.unitPrice, 0);
	const cost = mapped.reduce((a, x) => a + x.qty * x.unitCost, 0);
	const h = head[0];
	return {
		id: num(h.id),
		number: String(h.number),
		occurredOn: String(h.occurred_on).slice(0, 10),
		channel: String(h.channel),
		note: String(h.note ?? ""),
		itemCount: mapped.length,
		qty: mapped.reduce((a, x) => a + x.qty, 0),
		total,
		cost,
		profit: total - cost,
		items: mapped
	};
});
var createSale_createServerFn_handler = createServerRpc({
	id: "1db10e5aabb5ec238c4e69e6b624ebaa903ea1af36d72f587162d3a36fd184c7",
	name: "createSale",
	filename: "src/lib/inventory/server.ts"
}, (opts) => createSale.__executeServer(opts));
var createSale = createServerFn({ method: "POST" }).validator((data) => object({
	occurredOn: string().regex(/^\d{4}-\d{2}-\d{2}$/),
	channel: string().trim().min(1).max(20),
	note: string().trim().max(200).optional().default(""),
	lines: array(lineSchema).min(1, "請至少加入一項商品")
}).parse(data)).handler(createSale_createServerFn_handler, async ({ data }) => {
	const sql = await db();
	for (const line of data.lines) {
		const p = await sql.query("select name, stock, is_active from products where id = $1", [line.productId]);
		if (!p[0] || !p[0].is_active) throw new Error(`商品不存在或已下架`);
		if (p[0].stock < line.qty) throw new Error(`${p[0].name} 庫存不足（現有 ${p[0].stock} 件）`);
	}
	const number = await nextNumber(sql, "sales", "OUT", data.occurredOn);
	const id = (await sql.query("insert into sales (number, channel, occurred_on, note) values ($1,$2,$3,$4) returning id", [
		number,
		data.channel,
		data.occurredOn,
		data.note
	]))[0].id;
	for (const line of data.lines) {
		const p = await sql.query("select cost, name from products where id = $1", [line.productId]);
		const cost = num(p[0]?.cost);
		if (!(await sql.query(`update products
            set stock = stock - $2, updated_at = now()
          where id = $1 and stock >= $2
          returning id`, [line.productId, line.qty]))[0]) throw new Error(`${p[0]?.name ?? "商品"} 庫存不足，銷貨未完成`);
		await sql.query("insert into sale_items (sale_id, product_id, qty, unit_price, unit_cost) values ($1,$2,$3,$4,$5)", [
			id,
			line.productId,
			line.qty,
			line.unit,
			cost
		]);
		await sql.query(`insert into stock_moves (product_id, kind, qty_delta, ref_type, ref_id, note)
         values ($1,'sale',$2,'sale',$3,'銷貨')`, [
			line.productId,
			-line.qty,
			id
		]);
	}
	return {
		id,
		number
	};
});
var adjustStock_createServerFn_handler = createServerRpc({
	id: "ebfa04f890d64d71549d61fa41d91ba94e9c0a8beb371dda13440880fb163f09",
	name: "adjustStock",
	filename: "src/lib/inventory/server.ts"
}, (opts) => adjustStock.__executeServer(opts));
var adjustStock = createServerFn({ method: "POST" }).validator((data) => object({
	productId: number().int().positive(),
	newQty: number().int().nonnegative(),
	note: string().trim().max(120).optional().default("盤點調整")
}).parse(data)).handler(adjustStock_createServerFn_handler, async ({ data }) => {
	const sql = await db();
	const p = await sql.query("select stock, name from products where id = $1", [data.productId]);
	if (!p[0]) throw new Error("找不到商品");
	const delta = data.newQty - p[0].stock;
	if (delta === 0) return {
		ok: true,
		delta: 0
	};
	await sql.query("update products set stock = $2, updated_at = now() where id = $1", [data.productId, data.newQty]);
	await sql.query(`insert into stock_moves (product_id, kind, qty_delta, ref_type, note)
       values ($1,'adjust',$2,'adjust',$3)`, [
		data.productId,
		delta,
		data.note || "盤點調整"
	]);
	return {
		ok: true,
		delta
	};
});
var listStockMoves_createServerFn_handler = createServerRpc({
	id: "1eb90ed6baa7f187627ba5aa78d889217fe4063d32c899a5e2cdf769d34f8f44",
	name: "listStockMoves",
	filename: "src/lib/inventory/server.ts"
}, (opts) => listStockMoves.__executeServer(opts));
var listStockMoves = createServerFn({ method: "GET" }).validator((data) => object({ productId: number().int().positive().optional() }).parse(data ?? {})).handler(listStockMoves_createServerFn_handler, async ({ data }) => {
	const sql = await db();
	const params = [];
	let where = "";
	if (data.productId) {
		params.push(data.productId);
		where = `where m.product_id = $1`;
	}
	return (await sql.query(`select m.id, m.product_id, p.name as product_name, p.sku, m.kind,
              m.qty_delta, m.note, m.created_at::text as created_at
       from stock_moves m
       join products p on p.id = m.product_id
       ${where}
       order by m.created_at desc, m.id desc
       limit 150`, params)).map((r) => ({
		id: num(r.id),
		productId: num(r.product_id),
		productName: String(r.product_name),
		sku: String(r.sku),
		kind: String(r.kind),
		qtyDelta: num(r.qty_delta),
		note: String(r.note ?? ""),
		createdAt: String(r.created_at)
	}));
});
var getDashboard_createServerFn_handler = createServerRpc({
	id: "2834875938522524f82d22285f32ee725ef8521dd02e4911423f3fe6a1ffa75d",
	name: "getDashboard",
	filename: "src/lib/inventory/server.ts"
}, (opts) => getDashboard.__executeServer(opts));
var getDashboard = createServerFn({ method: "GET" }).handler(getDashboard_createServerFn_handler, async () => {
	const sql = await db();
	const today = todayISO();
	const monthStart = `${today.slice(0, 7)}-01`;
	const todayRow = await sql.query(`select coalesce(sum(i.qty * i.unit_price),0) as sales,
              count(distinct sa.id)::int as n
       from sales sa
       join sale_items i on i.sale_id = sa.id
       where sa.occurred_on = $1`, [today]);
	const monthRow = await sql.query(`select coalesce(sum(i.qty * i.unit_price),0) as sales,
              coalesce(sum(i.qty * i.unit_cost),0) as cost,
              count(distinct sa.id)::int as n
       from sales sa
       join sale_items i on i.sale_id = sa.id
       where sa.occurred_on >= $1 and sa.occurred_on <= $2`, [monthStart, today]);
	const inv = await sql.query(`select coalesce(sum(stock * cost),0) as value,
              count(*) filter (where is_active)::int as skus,
              coalesce(sum(stock) filter (where is_active),0)::int as units
       from products`);
	const low = await sql.query(`${PRODUCT_SQL}
       where p.is_active = true and p.stock <= p.min_stock
       order by (p.stock = 0) desc, p.stock asc, p.sku
       limit 12`);
	const recent = await sql.query(`select sa.id, sa.number, sa.occurred_on::text as occurred_on, sa.channel, sa.note,
              count(i.id)::int as item_count,
              coalesce(sum(i.qty),0)::int as qty,
              coalesce(sum(i.qty * i.unit_price),0) as total,
              coalesce(sum(i.qty * i.unit_cost),0) as cost
       from sales sa
       left join sale_items i on i.sale_id = sa.id
       group by sa.id
       order by sa.occurred_on desc, sa.id desc
       limit 6`);
	const seriesRows = await sql.query(`select sa.occurred_on::text as d,
              coalesce(sum(i.qty * i.unit_price),0) as sales,
              coalesce(sum(i.qty),0)::int as qty
       from sales sa
       join sale_items i on i.sale_id = sa.id
       where sa.occurred_on >= ($1::date - 13) and sa.occurred_on <= $1::date
       group by sa.occurred_on
       order by sa.occurred_on`, [today]);
	const top = await sql.query(`select p.name, coalesce(sum(i.qty),0)::int as qty,
              coalesce(sum(i.qty * i.unit_price),0) as sales
       from sale_items i
       join sales sa on sa.id = i.sale_id
       join products p on p.id = i.product_id
       where sa.occurred_on >= $1 and sa.occurred_on <= $2
       group by p.id, p.name
       order by qty desc, sales desc
       limit 5`, [monthStart, today]);
	const seriesMap = new Map(seriesRows.map((r) => [r.d.slice(0, 10), {
		sales: num(r.sales),
		qty: r.qty
	}]));
	const series = [];
	for (let i = 13; i >= 0; i -= 1) {
		const dt = /* @__PURE__ */ new Date();
		dt.setDate(dt.getDate() - i);
		const z = (n) => String(n).padStart(2, "0");
		const key = `${dt.getFullYear()}-${z(dt.getMonth() + 1)}-${z(dt.getDate())}`;
		const hit = seriesMap.get(key);
		series.push({
			date: key,
			sales: hit?.sales ?? 0,
			qty: hit?.qty ?? 0
		});
	}
	const monthSales = num(monthRow[0]?.sales);
	const monthCost = num(monthRow[0]?.cost);
	return {
		todaySales: num(todayRow[0]?.sales),
		todayCount: todayRow[0]?.n ?? 0,
		monthSales,
		monthCost,
		monthProfit: monthSales - monthCost,
		monthCount: monthRow[0]?.n ?? 0,
		inventoryValue: num(inv[0]?.value),
		skuCount: inv[0]?.skus ?? 0,
		unitCount: inv[0]?.units ?? 0,
		lowStock: low.map(mapProduct),
		recentSales: recent.map((r) => {
			const total = num(r.total);
			const cost = num(r.cost);
			return {
				id: num(r.id),
				number: String(r.number),
				occurredOn: String(r.occurred_on).slice(0, 10),
				channel: String(r.channel),
				note: String(r.note ?? ""),
				itemCount: num(r.item_count),
				qty: num(r.qty),
				total,
				cost,
				profit: total - cost
			};
		}),
		series,
		topProducts: top.map((t) => ({
			name: t.name,
			qty: t.qty,
			sales: num(t.sales)
		}))
	};
});
var getReport_createServerFn_handler = createServerRpc({
	id: "3b90563c1211d84aa7b63c2852cf82b194b4a26ab9557181eb1bfdf42dd32a2f",
	name: "getReport",
	filename: "src/lib/inventory/server.ts"
}, (opts) => getReport.__executeServer(opts));
var getReport = createServerFn({ method: "GET" }).validator((data) => object({
	from: string().regex(/^\d{4}-\d{2}-\d{2}$/),
	to: string().regex(/^\d{4}-\d{2}-\d{2}$/)
}).parse(data)).handler(getReport_createServerFn_handler, async ({ data }) => {
	const sql = await db();
	const summary = await sql.query(`select coalesce(sum(i.qty * i.unit_price),0) as sales,
              coalesce(sum(i.qty * i.unit_cost),0) as cost,
              count(distinct sa.id)::int as n,
              coalesce(sum(i.qty),0)::int as qty
       from sales sa
       join sale_items i on i.sale_id = sa.id
       where sa.occurred_on >= $1 and sa.occurred_on <= $2`, [data.from, data.to]);
	const byChannel = await sql.query(`select sa.channel,
              coalesce(sum(i.qty * i.unit_price),0) as sales,
              coalesce(sum(i.qty),0)::int as qty
       from sales sa
       join sale_items i on i.sale_id = sa.id
       where sa.occurred_on >= $1 and sa.occurred_on <= $2
       group by sa.channel
       order by sales desc`, [data.from, data.to]);
	const byProduct = await sql.query(`select p.id as product_id, p.name, p.sku,
              coalesce(sum(i.qty),0)::int as qty,
              coalesce(sum(i.qty * i.unit_price),0) as sales,
              coalesce(sum(i.qty * i.unit_cost),0) as cost
       from sale_items i
       join sales sa on sa.id = i.sale_id
       join products p on p.id = i.product_id
       where sa.occurred_on >= $1 and sa.occurred_on <= $2
       group by p.id, p.name, p.sku
       order by sales desc
       limit 30`, [data.from, data.to]);
	const seriesRows = await sql.query(`select sa.occurred_on::text as d,
              coalesce(sum(i.qty * i.unit_price),0) as sales
       from sales sa
       join sale_items i on i.sale_id = sa.id
       where sa.occurred_on >= $1 and sa.occurred_on <= $2
       group by sa.occurred_on
       order by sa.occurred_on`, [data.from, data.to]);
	const sales = num(summary[0]?.sales);
	const cost = num(summary[0]?.cost);
	return {
		from: data.from,
		to: data.to,
		sales,
		cost,
		profit: sales - cost,
		orderCount: summary[0]?.n ?? 0,
		qty: summary[0]?.qty ?? 0,
		byChannel: byChannel.map((c) => ({
			channel: c.channel,
			sales: num(c.sales),
			qty: c.qty
		})),
		byProduct: byProduct.map((p) => {
			const s = num(p.sales);
			const c = num(p.cost);
			return {
				productId: num(p.product_id),
				name: String(p.name),
				sku: String(p.sku),
				qty: num(p.qty),
				sales: s,
				cost: c,
				profit: s - c
			};
		}),
		series: seriesRows.map((r) => ({
			date: r.d.slice(0, 10),
			sales: num(r.sales)
		}))
	};
});
//#endregion
export { addCategory_createServerFn_handler, addSupplier_createServerFn_handler, adjustStock_createServerFn_handler, archiveProduct_createServerFn_handler, createPurchase_createServerFn_handler, createSale_createServerFn_handler, duplicateProduct_createServerFn_handler, getDashboard_createServerFn_handler, getPurchase_createServerFn_handler, getReport_createServerFn_handler, getSale_createServerFn_handler, importProducts_createServerFn_handler, listCategories_createServerFn_handler, listProducts_createServerFn_handler, listPurchases_createServerFn_handler, listSales_createServerFn_handler, listStockMoves_createServerFn_handler, listSuppliers_createServerFn_handler, saveProduct_createServerFn_handler, suggestRestock_createServerFn_handler };
