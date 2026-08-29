import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { num, todayISO } from "@/lib/utils";
import type { Sql } from "@/lib/db";
import type {
  Category,
  DashboardData,
  LineDraft,
  Product,
  PurchaseDetail,
  PurchaseListItem,
  ReportData,
  RestockSuggestion,
  SaleDetail,
  SaleListItem,
  StockMove,
  Supplier,
} from "./types";

async function db(): Promise<Sql> {
  const { getSql } = await import("@/lib/db");
  const { ensureSeed } = await import("./seed");
  const sql = await getSql();
  await ensureSeed(sql);
  return sql;
}

function mapProduct(r: Record<string, unknown>): Product {
  return {
    id: num(r.id as number),
    sku: String(r.sku),
    name: String(r.name),
    categoryId: num(r.category_id as number),
    categoryName: String(r.category_name ?? ""),
    color: String(r.color ?? ""),
    spec: String(r.spec ?? ""),
    cost: num(r.cost as string),
    price: num(r.price as string),
    stock: num(r.stock as number),
    minStock: num(r.min_stock as number),
    isActive: Boolean(r.is_active),
  };
}

const PRODUCT_SQL = `
  select p.id, p.sku, p.name, p.category_id, c.name as category_name,
         p.color, p.spec, p.cost, p.price, p.stock, p.min_stock, p.is_active
  from products p
  join categories c on c.id = p.category_id
`;

async function nextNumber(
  sql: Sql,
  table: "sales" | "purchases",
  prefix: string,
  date: string,
): Promise<string> {
  const yy = date.slice(2, 4);
  const mm = date.slice(5, 7);
  const dd = date.slice(8, 10);
  const head = `${prefix}-${yy}${mm}${dd}-`;
  const rows = await sql.query<{ number: string }>(
    `select number from ${table} where number like $1 order by number desc limit 1`,
    [`${head}%`],
  );
  const last = rows[0]?.number;
  const n = last ? Number(last.slice(head.length)) + 1 : 1;
  return `${head}${String(Number.isFinite(n) ? n : 1).padStart(2, "0")}`;
}

const SKU_PREFIX: Record<string, string> = {
  髮夾: "HC",
  髮圈: "HT",
  髮箍: "HB",
  髮帶: "BD",
  耳環: "ER",
  項鍊: "NK",
  手鍊: "BR",
  套組: "ST",
};

async function allocateSku(sql: Sql, categoryId: number): Promise<string> {
  const cat = await sql.query<{ name: string }>(
    "select name from categories where id = $1",
    [categoryId],
  );
  const prefix = SKU_PREFIX[cat[0]?.name ?? ""] ?? "ACC";
  const rows = await sql.query<{ sku: string }>(
    "select sku from products where sku like $1 order by sku desc limit 20",
    [`${prefix}-%`],
  );
  let max = 0;
  for (const r of rows) {
    const n = Number(r.sku.slice(prefix.length + 1));
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}

async function firstCategoryId(sql: Sql): Promise<number> {
  const rows = await sql.query<{ id: number }>(
    "select id from categories order by sort_order, id limit 1",
  );
  if (!rows[0]) throw new Error("請先新增一個分類");
  return rows[0].id;
}

const lineSchema = z.object({
  productId: z.coerce.number().int().positive(),
  qty: z.coerce.number().int().positive(),
  unit: z.coerce.number().nonnegative(),
});

const productInput = z.object({
  id: z.coerce.number().int().positive().optional(),
  sku: z.string().trim().max(40).optional().default(""),
  name: z.string().trim().min(1).max(80),
  categoryId: z.coerce.number().int().positive().optional(),
  color: z.string().trim().max(40).optional().default(""),
  spec: z.string().trim().max(80).optional().default(""),
  cost: z.coerce.number().nonnegative().optional().default(0),
  price: z.coerce.number().nonnegative(),
  minStock: z.coerce.number().int().nonnegative().optional().default(5),
  stock: z.coerce.number().int().nonnegative().optional(),
});

export const listCategories = createServerFn({ method: "GET" }).handler(
  async () => {
    const sql = await db();
    const rows = await sql.query<{ id: number; name: string; sort_order: number }>(
      "select id, name, sort_order from categories order by sort_order, id",
    );
    return rows.map(
      (r): Category => ({
        id: r.id,
        name: r.name,
        sortOrder: r.sort_order,
      }),
    );
  },
);

export const listSuppliers = createServerFn({ method: "GET" }).handler(
  async () => {
    const sql = await db();
    const rows = await sql.query<{ id: number; name: string; note: string }>(
      "select id, name, note from suppliers order by name",
    );
    return rows.map(
      (r): Supplier => ({ id: r.id, name: r.name, note: r.note }),
    );
  },
);

export const listProducts = createServerFn({ method: "GET" })
  .validator((data: unknown) =>
    z
      .object({
        q: z.string().optional().default(""),
        categoryId: z.coerce.number().int().optional(),
        includeInactive: z.boolean().optional().default(false),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data }) => {
    const sql = await db();
    const params: unknown[] = [];
    const where: string[] = [];
    if (!data.includeInactive) where.push("p.is_active = true");
    if (data.q.trim()) {
      params.push(`%${data.q.trim()}%`);
      const i = params.length;
      where.push(
        `(p.name ilike $${i} or p.sku ilike $${i} or p.color ilike $${i} or c.name ilike $${i})`,
      );
    }
    if (data.categoryId && data.categoryId > 0) {
      params.push(data.categoryId);
      where.push(`p.category_id = $${params.length}`);
    }
    const clause = where.length ? `where ${where.join(" and ")}` : "";
    const rows = await sql.query<Record<string, unknown>>(
      `${PRODUCT_SQL} ${clause} order by p.is_active desc, p.sku`,
      params,
    );
    return rows.map(mapProduct);
  });

export const saveProduct = createServerFn({ method: "POST" })
  .validator((data: unknown) => productInput.parse(data))
  .handler(async ({ data }) => {
    const sql = await db();
    const categoryId = data.categoryId ?? (await firstCategoryId(sql));
    const sku = data.sku?.trim() || (await allocateSku(sql, categoryId));
    if (data.id) {
      const updated = await sql.query<{ id: number }>(
        `update products
           set sku=$2, name=$3, category_id=$4, color=$5, spec=$6,
               cost=$7, price=$8, min_stock=$9, updated_at=now()
         where id=$1
         returning id`,
        [
          data.id,
          sku,
          data.name,
          categoryId,
          data.color,
          data.spec,
          data.cost,
          data.price,
          data.minStock,
        ],
      );
      if (!updated[0]) throw new Error("找不到這個商品");
      return { id: updated[0].id, sku };
    }
    const stock = data.stock ?? 0;
    try {
      const inserted = await sql.query<{ id: number }>(
        `insert into products
           (sku, name, category_id, color, spec, cost, price, stock, min_stock)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         returning id`,
        [
          sku,
          data.name,
          categoryId,
          data.color,
          data.spec,
          data.cost,
          data.price,
          stock,
          data.minStock,
        ],
      );
      const id = inserted[0]!.id;
      if (stock !== 0) {
        await sql.query(
          `insert into stock_moves (product_id, kind, qty_delta, ref_type, note)
           values ($1,'adjust',$2,'product','開帳庫存')`,
          [id, stock],
        );
      }
      return { id, sku };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("products_sku") || msg.toLowerCase().includes("unique")) {
        throw new Error("貨號已存在，請換一個 SKU");
      }
      throw err;
    }
  });

export const archiveProduct = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ id: z.coerce.number().int().positive() }).parse(data),
  )
  .handler(async ({ data }) => {
    const sql = await db();
    await sql.query(
      "update products set is_active = not is_active, updated_at = now() where id = $1",
      [data.id],
    );
    return { ok: true };
  });

export const addCategory = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ name: z.string().trim().min(1).max(20) }).parse(data),
  )
  .handler(async ({ data }) => {
    const sql = await db();
    try {
      const max = await sql.query<{ n: number }>(
        "select coalesce(max(sort_order),0)::int as n from categories",
      );
      const rows = await sql.query<{ id: number }>(
        "insert into categories (name, sort_order) values ($1,$2) returning id",
        [data.name, (max[0]?.n ?? 0) + 1],
      );
      return { id: rows[0]!.id };
    } catch {
      throw new Error("分類名稱已存在");
    }
  });

export const addSupplier = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ name: z.string().trim().min(1).max(40) }).parse(data),
  )
  .handler(async ({ data }) => {
    const sql = await db();
    const existing = await sql.query<{ id: number }>(
      "select id from suppliers where name = $1",
      [data.name],
    );
    if (existing[0]) return { id: existing[0].id };
    const rows = await sql.query<{ id: number }>(
      "insert into suppliers (name, note) values ($1,'') returning id",
      [data.name],
    );
    return { id: rows[0]!.id };
  });

export const duplicateProduct = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ id: z.coerce.number().int().positive() }).parse(data),
  )
  .handler(async ({ data }) => {
    const sql = await db();
    const src = await sql.query<Record<string, unknown>>(
      `${PRODUCT_SQL} where p.id = $1`,
      [data.id],
    );
    if (!src[0]) throw new Error("找不到商品");
    const p = mapProduct(src[0]);
    const sku = await allocateSku(sql, p.categoryId);
    const name = p.name.endsWith(" 副本") ? p.name : `${p.name} 副本`;
    const rows = await sql.query<{ id: number }>(
      `insert into products
         (sku, name, category_id, color, spec, cost, price, stock, min_stock)
       values ($1,$2,$3,$4,$5,$6,$7,0,$8)
       returning id`,
      [sku, name, p.categoryId, p.color, p.spec, p.cost, p.price, p.minStock],
    );
    return { id: rows[0]!.id, sku };
  });

export const importProducts = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ text: z.string().min(1).max(20000) }).parse(data),
  )
  .handler(async ({ data }) => {
    const sql = await db();
    const cats = await sql.query<{ id: number; name: string }>(
      "select id, name from categories",
    );
    const catByName = new Map(cats.map((c) => [c.name, c.id]));
    const fallback = cats[0]?.id;
    if (!fallback) throw new Error("請先新增一個分類");
    const lines = data.text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("名稱") && !l.startsWith("#"));
    let created = 0;
    for (const line of lines) {
      const parts = line.includes(",")
        ? line.split(",").map((s) => s.trim())
        : line.split(/\s+/);
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
        if (parts[3] && catByName.has(parts[3])) categoryId = catByName.get(parts[3])!;
        color = parts[4] ?? "";
      } else {
        const last = parts[parts.length - 1];
        const n = Number(last);
        if (Number.isFinite(n) && parts.length >= 2) {
          price = n;
          name = parts.slice(0, -1).join(" ");
        } else {
          name = line;
        }
      }
      if (!name) continue;
      const sku = await allocateSku(sql, categoryId);
      await sql.query(
        `insert into products
           (sku, name, category_id, color, spec, cost, price, stock, min_stock)
         values ($1,$2,$3,$4,'',$5,$6,0,5)`,
        [sku, name.slice(0, 80), categoryId, color.slice(0, 40), cost, price],
      );
      created += 1;
    }
    if (created === 0) throw new Error("沒有讀到可匯入的列");
    return { created };
  });

export const suggestRestock = createServerFn({ method: "GET" }).handler(
  async () => {
    const sql = await db();
    const low = await sql.query<Record<string, unknown>>(
      `${PRODUCT_SQL}
       where p.is_active = true and p.stock <= p.min_stock
       order by (p.stock = 0) desc, p.stock asc, p.sku`,
    );
    const lastSup = await sql.query<{ id: number; name: string }>(
      `select s.id, s.name
       from purchases pu
       join suppliers s on s.id = pu.supplier_id
       order by pu.occurred_on desc, pu.id desc
       limit 1`,
    );
    const lines: LineDraft[] = low.map((r) => {
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
        unit: p.cost,
      };
    });
    const result: RestockSuggestion = {
      supplierId: lastSup[0]?.id ?? null,
      supplierName: lastSup[0]?.name ?? "",
      lines,
    };
    return result;
  },
);

export const listPurchases = createServerFn({ method: "GET" }).handler(
  async () => {
    const sql = await db();
    const rows = await sql.query<Record<string, unknown>>(
      `select pu.id, pu.number, pu.occurred_on::text as occurred_on, pu.note,
              coalesce(s.name, '未指定') as supplier_name,
              count(i.id)::int as item_count,
              coalesce(sum(i.qty),0)::int as qty,
              coalesce(sum(i.qty * i.unit_cost),0) as total
       from purchases pu
       left join suppliers s on s.id = pu.supplier_id
       left join purchase_items i on i.purchase_id = pu.id
       group by pu.id, s.name
       order by pu.occurred_on desc, pu.id desc
       limit 200`,
    );
    return rows.map(
      (r): PurchaseListItem => ({
        id: num(r.id as number),
        number: String(r.number),
        occurredOn: String(r.occurred_on).slice(0, 10),
        supplierName: String(r.supplier_name),
        note: String(r.note ?? ""),
        itemCount: num(r.item_count as number),
        qty: num(r.qty as number),
        total: num(r.total as string),
      }),
    );
  },
);

export const getPurchase = createServerFn({ method: "GET" })
  .validator((data: unknown) =>
    z.object({ id: z.coerce.number().int().positive() }).parse(data),
  )
  .handler(async ({ data }) => {
    const sql = await db();
    const head = await sql.query<Record<string, unknown>>(
      `select pu.id, pu.number, pu.occurred_on::text as occurred_on, pu.note,
              coalesce(s.name, '未指定') as supplier_name
       from purchases pu
       left join suppliers s on s.id = pu.supplier_id
       where pu.id = $1`,
      [data.id],
    );
    if (!head[0]) throw new Error("找不到進貨單");
    const items = await sql.query<Record<string, unknown>>(
      `select i.product_id, i.qty, i.unit_cost, p.name, p.sku
       from purchase_items i
       join products p on p.id = i.product_id
       where i.purchase_id = $1
       order by i.id`,
      [data.id],
    );
    const mapped = items.map((i) => ({
      productId: num(i.product_id as number),
      name: String(i.name),
      sku: String(i.sku),
      qty: num(i.qty as number),
      unitCost: num(i.unit_cost as string),
    }));
    const h = head[0];
    const detail: PurchaseDetail = {
      id: num(h.id as number),
      number: String(h.number),
      occurredOn: String(h.occurred_on).slice(0, 10),
      supplierName: String(h.supplier_name),
      note: String(h.note ?? ""),
      itemCount: mapped.length,
      qty: mapped.reduce((a, x) => a + x.qty, 0),
      total: mapped.reduce((a, x) => a + x.qty * x.unitCost, 0),
      items: mapped,
    };
    return detail;
  });

export const createPurchase = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        occurredOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        supplierId: z.coerce.number().int().positive().optional(),
        supplierName: z.string().trim().max(40).optional().default(""),
        note: z.string().trim().max(200).optional().default(""),
        lines: z.array(lineSchema).min(1, "請至少加入一項商品"),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const sql = await db();
    let supplierId = data.supplierId;
    if (!supplierId && data.supplierName) {
      const existing = await sql.query<{ id: number }>(
        "select id from suppliers where name = $1",
        [data.supplierName],
      );
      if (existing[0]) supplierId = existing[0].id;
      else {
        const ins = await sql.query<{ id: number }>(
          "insert into suppliers (name, note) values ($1,'') returning id",
          [data.supplierName],
        );
        supplierId = ins[0]!.id;
      }
    }
    const number = await nextNumber(sql, "purchases", "IN", data.occurredOn);
    const head = await sql.query<{ id: number }>(
      "insert into purchases (number, supplier_id, occurred_on, note) values ($1,$2,$3,$4) returning id",
      [number, supplierId ?? null, data.occurredOn, data.note],
    );
    const id = head[0]!.id;
    for (const line of data.lines) {
      const product = await sql.query<{ id: number; name: string }>(
        "select id, name from products where id = $1",
        [line.productId],
      );
      if (!product[0]) throw new Error("商品不存在");
      await sql.query(
        "insert into purchase_items (purchase_id, product_id, qty, unit_cost) values ($1,$2,$3,$4)",
        [id, line.productId, line.qty, line.unit],
      );
      await sql.query(
        "update products set stock = stock + $2, cost = $3, updated_at = now() where id = $1",
        [line.productId, line.qty, line.unit],
      );
      await sql.query(
        `insert into stock_moves (product_id, kind, qty_delta, ref_type, ref_id, note)
         values ($1,'purchase',$2,'purchase',$3,'進貨')`,
        [line.productId, line.qty, id],
      );
    }
    return { id, number };
  });

export const listSales = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await db();
  const rows = await sql.query<Record<string, unknown>>(
    `select sa.id, sa.number, sa.occurred_on::text as occurred_on, sa.channel, sa.note,
            count(i.id)::int as item_count,
            coalesce(sum(i.qty),0)::int as qty,
            coalesce(sum(i.qty * i.unit_price),0) as total,
            coalesce(sum(i.qty * i.unit_cost),0) as cost
     from sales sa
     left join sale_items i on i.sale_id = sa.id
     group by sa.id
     order by sa.occurred_on desc, sa.id desc
     limit 200`,
  );
  return rows.map((r): SaleListItem => {
    const total = num(r.total as string);
    const cost = num(r.cost as string);
    return {
      id: num(r.id as number),
      number: String(r.number),
      occurredOn: String(r.occurred_on).slice(0, 10),
      channel: String(r.channel),
      note: String(r.note ?? ""),
      itemCount: num(r.item_count as number),
      qty: num(r.qty as number),
      total,
      cost,
      profit: total - cost,
    };
  });
});

export const getSale = createServerFn({ method: "GET" })
  .validator((data: unknown) =>
    z.object({ id: z.coerce.number().int().positive() }).parse(data),
  )
  .handler(async ({ data }) => {
    const sql = await db();
    const head = await sql.query<Record<string, unknown>>(
      `select id, number, occurred_on::text as occurred_on, channel, note
       from sales where id = $1`,
      [data.id],
    );
    if (!head[0]) throw new Error("找不到銷貨單");
    const items = await sql.query<Record<string, unknown>>(
      `select i.product_id, i.qty, i.unit_price, i.unit_cost, p.name, p.sku
       from sale_items i
       join products p on p.id = i.product_id
       where i.sale_id = $1
       order by i.id`,
      [data.id],
    );
    const mapped = items.map((i) => ({
      productId: num(i.product_id as number),
      name: String(i.name),
      sku: String(i.sku),
      qty: num(i.qty as number),
      unitPrice: num(i.unit_price as string),
      unitCost: num(i.unit_cost as string),
    }));
    const total = mapped.reduce((a, x) => a + x.qty * x.unitPrice, 0);
    const cost = mapped.reduce((a, x) => a + x.qty * x.unitCost, 0);
    const h = head[0];
    const detail: SaleDetail = {
      id: num(h.id as number),
      number: String(h.number),
      occurredOn: String(h.occurred_on).slice(0, 10),
      channel: String(h.channel),
      note: String(h.note ?? ""),
      itemCount: mapped.length,
      qty: mapped.reduce((a, x) => a + x.qty, 0),
      total,
      cost,
      profit: total - cost,
      items: mapped,
    };
    return detail;
  });

export const createSale = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        occurredOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        channel: z.string().trim().min(1).max(20),
        note: z.string().trim().max(200).optional().default(""),
        lines: z.array(lineSchema).min(1, "請至少加入一項商品"),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const sql = await db();
    for (const line of data.lines) {
      const p = await sql.query<{ name: string; stock: number; is_active: boolean }>(
        "select name, stock, is_active from products where id = $1",
        [line.productId],
      );
      if (!p[0] || !p[0].is_active) {
        throw new Error(`商品不存在或已下架`);
      }
      if (p[0].stock < line.qty) {
        throw new Error(`${p[0].name} 庫存不足（現有 ${p[0].stock} 件）`);
      }
    }
    const number = await nextNumber(sql, "sales", "OUT", data.occurredOn);
    const head = await sql.query<{ id: number }>(
      "insert into sales (number, channel, occurred_on, note) values ($1,$2,$3,$4) returning id",
      [number, data.channel, data.occurredOn, data.note],
    );
    const id = head[0]!.id;
    for (const line of data.lines) {
      const p = await sql.query<{ cost: string; name: string }>(
        "select cost, name from products where id = $1",
        [line.productId],
      );
      const cost = num(p[0]?.cost);
      const updated = await sql.query<{ id: number }>(
        `update products
            set stock = stock - $2, updated_at = now()
          where id = $1 and stock >= $2
          returning id`,
        [line.productId, line.qty],
      );
      if (!updated[0]) {
        throw new Error(`${p[0]?.name ?? "商品"} 庫存不足，銷貨未完成`);
      }
      await sql.query(
        "insert into sale_items (sale_id, product_id, qty, unit_price, unit_cost) values ($1,$2,$3,$4,$5)",
        [id, line.productId, line.qty, line.unit, cost],
      );
      await sql.query(
        `insert into stock_moves (product_id, kind, qty_delta, ref_type, ref_id, note)
         values ($1,'sale',$2,'sale',$3,'銷貨')`,
        [line.productId, -line.qty, id],
      );
    }
    return { id, number };
  });

export const adjustStock = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        productId: z.coerce.number().int().positive(),
        newQty: z.coerce.number().int().nonnegative(),
        note: z.string().trim().max(120).optional().default("盤點調整"),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const sql = await db();
    const p = await sql.query<{ stock: number; name: string }>(
      "select stock, name from products where id = $1",
      [data.productId],
    );
    if (!p[0]) throw new Error("找不到商品");
    const delta = data.newQty - p[0].stock;
    if (delta === 0) return { ok: true, delta: 0 };
    await sql.query(
      "update products set stock = $2, updated_at = now() where id = $1",
      [data.productId, data.newQty],
    );
    await sql.query(
      `insert into stock_moves (product_id, kind, qty_delta, ref_type, note)
       values ($1,'adjust',$2,'adjust',$3)`,
      [data.productId, delta, data.note || "盤點調整"],
    );
    return { ok: true, delta };
  });

export const listStockMoves = createServerFn({ method: "GET" })
  .validator((data: unknown) =>
    z
      .object({
        productId: z.coerce.number().int().positive().optional(),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data }) => {
    const sql = await db();
    const params: unknown[] = [];
    let where = "";
    if (data.productId) {
      params.push(data.productId);
      where = `where m.product_id = $1`;
    }
    const rows = await sql.query<Record<string, unknown>>(
      `select m.id, m.product_id, p.name as product_name, p.sku, m.kind,
              m.qty_delta, m.note, m.created_at::text as created_at
       from stock_moves m
       join products p on p.id = m.product_id
       ${where}
       order by m.created_at desc, m.id desc
       limit 150`,
      params,
    );
    return rows.map(
      (r): StockMove => ({
        id: num(r.id as number),
        productId: num(r.product_id as number),
        productName: String(r.product_name),
        sku: String(r.sku),
        kind: String(r.kind) as StockMove["kind"],
        qtyDelta: num(r.qty_delta as number),
        note: String(r.note ?? ""),
        createdAt: String(r.created_at),
      }),
    );
  });

export const getDashboard = createServerFn({ method: "GET" }).handler(
  async () => {
    const sql = await db();
    const today = todayISO();
    const monthStart = `${today.slice(0, 7)}-01`;

    const todayRow = await sql.query<{ sales: string; n: number }>(
      `select coalesce(sum(i.qty * i.unit_price),0) as sales,
              count(distinct sa.id)::int as n
       from sales sa
       join sale_items i on i.sale_id = sa.id
       where sa.occurred_on = $1`,
      [today],
    );
    const monthRow = await sql.query<{
      sales: string;
      cost: string;
      n: number;
    }>(
      `select coalesce(sum(i.qty * i.unit_price),0) as sales,
              coalesce(sum(i.qty * i.unit_cost),0) as cost,
              count(distinct sa.id)::int as n
       from sales sa
       join sale_items i on i.sale_id = sa.id
       where sa.occurred_on >= $1 and sa.occurred_on <= $2`,
      [monthStart, today],
    );
    const inv = await sql.query<{ value: string; skus: number; units: number }>(
      `select coalesce(sum(stock * cost),0) as value,
              count(*) filter (where is_active)::int as skus,
              coalesce(sum(stock) filter (where is_active),0)::int as units
       from products`,
    );
    const low = await sql.query<Record<string, unknown>>(
      `${PRODUCT_SQL}
       where p.is_active = true and p.stock <= p.min_stock
       order by (p.stock = 0) desc, p.stock asc, p.sku
       limit 12`,
    );
    const recent = await sql.query<Record<string, unknown>>(
      `select sa.id, sa.number, sa.occurred_on::text as occurred_on, sa.channel, sa.note,
              count(i.id)::int as item_count,
              coalesce(sum(i.qty),0)::int as qty,
              coalesce(sum(i.qty * i.unit_price),0) as total,
              coalesce(sum(i.qty * i.unit_cost),0) as cost
       from sales sa
       left join sale_items i on i.sale_id = sa.id
       group by sa.id
       order by sa.occurred_on desc, sa.id desc
       limit 6`,
    );
    const seriesRows = await sql.query<{ d: string; sales: string; qty: number }>(
      `select sa.occurred_on::text as d,
              coalesce(sum(i.qty * i.unit_price),0) as sales,
              coalesce(sum(i.qty),0)::int as qty
       from sales sa
       join sale_items i on i.sale_id = sa.id
       where sa.occurred_on >= ($1::date - 13) and sa.occurred_on <= $1::date
       group by sa.occurred_on
       order by sa.occurred_on`,
      [today],
    );
    const top = await sql.query<{ name: string; qty: number; sales: string }>(
      `select p.name, coalesce(sum(i.qty),0)::int as qty,
              coalesce(sum(i.qty * i.unit_price),0) as sales
       from sale_items i
       join sales sa on sa.id = i.sale_id
       join products p on p.id = i.product_id
       where sa.occurred_on >= $1 and sa.occurred_on <= $2
       group by p.id, p.name
       order by qty desc, sales desc
       limit 5`,
      [monthStart, today],
    );

    const seriesMap = new Map(
      seriesRows.map((r) => [
        r.d.slice(0, 10),
        { sales: num(r.sales), qty: r.qty },
      ]),
    );
    const series: DashboardData["series"] = [];
    for (let i = 13; i >= 0; i -= 1) {
      const dt = new Date();
      dt.setDate(dt.getDate() - i);
      const z = (n: number) => String(n).padStart(2, "0");
      const key = `${dt.getFullYear()}-${z(dt.getMonth() + 1)}-${z(dt.getDate())}`;
      const hit = seriesMap.get(key);
      series.push({ date: key, sales: hit?.sales ?? 0, qty: hit?.qty ?? 0 });
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
        const total = num(r.total as string);
        const cost = num(r.cost as string);
        return {
          id: num(r.id as number),
          number: String(r.number),
          occurredOn: String(r.occurred_on).slice(0, 10),
          channel: String(r.channel),
          note: String(r.note ?? ""),
          itemCount: num(r.item_count as number),
          qty: num(r.qty as number),
          total,
          cost,
          profit: total - cost,
        };
      }),
      series,
      topProducts: top.map((t) => ({
        name: t.name,
        qty: t.qty,
        sales: num(t.sales),
      })),
    } satisfies DashboardData;
  },
);

export const getReport = createServerFn({ method: "GET" })
  .validator((data: unknown) =>
    z
      .object({
        from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const sql = await db();
    const summary = await sql.query<{
      sales: string;
      cost: string;
      n: number;
      qty: number;
    }>(
      `select coalesce(sum(i.qty * i.unit_price),0) as sales,
              coalesce(sum(i.qty * i.unit_cost),0) as cost,
              count(distinct sa.id)::int as n,
              coalesce(sum(i.qty),0)::int as qty
       from sales sa
       join sale_items i on i.sale_id = sa.id
       where sa.occurred_on >= $1 and sa.occurred_on <= $2`,
      [data.from, data.to],
    );
    const byChannel = await sql.query<{
      channel: string;
      sales: string;
      qty: number;
    }>(
      `select sa.channel,
              coalesce(sum(i.qty * i.unit_price),0) as sales,
              coalesce(sum(i.qty),0)::int as qty
       from sales sa
       join sale_items i on i.sale_id = sa.id
       where sa.occurred_on >= $1 and sa.occurred_on <= $2
       group by sa.channel
       order by sales desc`,
      [data.from, data.to],
    );
    const byProduct = await sql.query<Record<string, unknown>>(
      `select p.id as product_id, p.name, p.sku,
              coalesce(sum(i.qty),0)::int as qty,
              coalesce(sum(i.qty * i.unit_price),0) as sales,
              coalesce(sum(i.qty * i.unit_cost),0) as cost
       from sale_items i
       join sales sa on sa.id = i.sale_id
       join products p on p.id = i.product_id
       where sa.occurred_on >= $1 and sa.occurred_on <= $2
       group by p.id, p.name, p.sku
       order by sales desc
       limit 30`,
      [data.from, data.to],
    );
    const seriesRows = await sql.query<{ d: string; sales: string }>(
      `select sa.occurred_on::text as d,
              coalesce(sum(i.qty * i.unit_price),0) as sales
       from sales sa
       join sale_items i on i.sale_id = sa.id
       where sa.occurred_on >= $1 and sa.occurred_on <= $2
       group by sa.occurred_on
       order by sa.occurred_on`,
      [data.from, data.to],
    );
    const sales = num(summary[0]?.sales);
    const cost = num(summary[0]?.cost);
    const result: ReportData = {
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
        qty: c.qty,
      })),
      byProduct: byProduct.map((p) => {
        const s = num(p.sales as string);
        const c = num(p.cost as string);
        return {
          productId: num(p.product_id as number),
          name: String(p.name),
          sku: String(p.sku),
          qty: num(p.qty as number),
          sales: s,
          cost: c,
          profit: s - c,
        };
      }),
      series: seriesRows.map((r) => ({
        date: r.d.slice(0, 10),
        sales: num(r.sales),
      })),
    };
    return result;
  });
