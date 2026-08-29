import type { Sql } from "@/lib/db";
import { addDaysISO, todayISO } from "@/lib/utils";

const CATEGORIES = [
  "髮夾",
  "髮圈",
  "髮箍",
  "髮帶",
  "耳環",
  "項鍊",
  "手鍊",
  "套組",
] as const;

type SeedProduct = {
  sku: string;
  name: string;
  category: (typeof CATEGORIES)[number];
  color: string;
  spec: string;
  cost: number;
  price: number;
  stock: number;
  minStock: number;
};

const PRODUCTS: SeedProduct[] = [
  {
    sku: "HC-001",
    name: "法式珍珠抓夾",
    category: "髮夾",
    color: "米白",
    spec: "8cm",
    cost: 45,
    price: 180,
    stock: 28,
    minStock: 8,
  },
  {
    sku: "HC-002",
    name: "磨砂幾何側夾",
    category: "髮夾",
    color: "霧杏",
    spec: "5cm 一對",
    cost: 32,
    price: 129,
    stock: 16,
    minStock: 6,
  },
  {
    sku: "HC-003",
    name: "絲絨香蕉夾",
    category: "髮夾",
    color: "勃艮第",
    spec: "13cm",
    cost: 55,
    price: 220,
    stock: 7,
    minStock: 8,
  },
  {
    sku: "HC-004",
    name: "水鑽一字夾兩件組",
    category: "髮夾",
    color: "香檳",
    spec: "兩件",
    cost: 38,
    price: 159,
    stock: 22,
    minStock: 8,
  },
  {
    sku: "HC-005",
    name: "壓克力花朵夾",
    category: "髮夾",
    color: "透明粉",
    spec: "6cm",
    cost: 25,
    price: 119,
    stock: 0,
    minStock: 6,
  },
  {
    sku: "HT-001",
    name: "緞面大腸圈",
    category: "髮圈",
    color: "藕粉",
    spec: "大",
    cost: 18,
    price: 79,
    stock: 48,
    minStock: 12,
  },
  {
    sku: "HT-002",
    name: "兒童星星髮圈五件",
    category: "髮圈",
    color: "混色",
    spec: "五件組",
    cost: 22,
    price: 99,
    stock: 5,
    minStock: 10,
  },
  {
    sku: "HB-001",
    name: "絲綢蝴蝶結髮箍",
    category: "髮箍",
    color: "象牙",
    spec: "寬 3cm",
    cost: 68,
    price: 280,
    stock: 12,
    minStock: 5,
  },
  {
    sku: "HB-002",
    name: "細版皮質髮箍",
    category: "髮箍",
    color: "摩卡",
    spec: "1.2cm",
    cost: 42,
    price: 169,
    stock: 9,
    minStock: 5,
  },
  {
    sku: "BD-001",
    name: "雪紡飄帶髮帶",
    category: "髮帶",
    color: "玫瑰霧",
    spec: "長 150cm",
    cost: 36,
    price: 149,
    stock: 14,
    minStock: 6,
  },
  {
    sku: "ER-001",
    name: "小珍珠耳釘",
    category: "耳環",
    color: "珍珠白",
    spec: "6mm",
    cost: 28,
    price: 129,
    stock: 31,
    minStock: 10,
  },
  {
    sku: "NK-001",
    name: "細鍊愛心項鍊",
    category: "項鍊",
    color: "杏銅",
    spec: "40+5cm",
    cost: 72,
    price: 320,
    stock: 8,
    minStock: 4,
  },
  {
    sku: "BR-001",
    name: "串珠手鍊",
    category: "手鍊",
    color: "奶茶",
    spec: "可調",
    cost: 35,
    price: 159,
    stock: 18,
    minStock: 6,
  },
  {
    sku: "ST-001",
    name: "婚禮珍珠套組",
    category: "套組",
    color: "珍珠白",
    spec: "夾+箍+耳釘",
    cost: 180,
    price: 680,
    stock: 3,
    minStock: 3,
  },
];

const SUPPLIERS = [
  { name: "台中工坊", note: "小量補貨、交期快" },
  { name: "義烏飾品行", note: "髮圈／小夾批發" },
  { name: "東莞金屬廠", note: "金屬夾、項鍊" },
];

export async function ensureSeed(sql: Sql): Promise<void> {
  const flagged = await sql.query<{ value: string }>(
    "select value from app_meta where key = $1",
    ["seeded"],
  );
  if (flagged[0]?.value === "1") return;

  const existing = await sql.query<{ n: number }>(
    "select count(*)::int as n from products",
  );
  if ((existing[0]?.n ?? 0) > 0) {
    await sql.query(
      "insert into app_meta (key, value) values ('seeded', '1') on conflict (key) do nothing",
    );
    return;
  }

  for (let i = 0; i < CATEGORIES.length; i += 1) {
    await sql.query(
      "insert into categories (name, sort_order) values ($1, $2) on conflict (name) do nothing",
      [CATEGORIES[i], i],
    );
  }
  for (const s of SUPPLIERS) {
    await sql.query(
      "insert into suppliers (name, note) values ($1, $2) on conflict (name) do nothing",
      [s.name, s.note],
    );
  }

  const cats = await sql.query<{ id: number; name: string }>(
    "select id, name from categories",
  );
  const catId = Object.fromEntries(cats.map((c) => [c.name, c.id]));
  const suppliers = await sql.query<{ id: number; name: string }>(
    "select id, name from suppliers",
  );
  const supplierId = Object.fromEntries(suppliers.map((s) => [s.name, s.id]));

  const productIds: Record<string, number> = {};
  for (const p of PRODUCTS) {
    const rows = await sql.query<{ id: number }>(
      `insert into products
        (sku, name, category_id, color, spec, cost, price, stock, min_stock)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       on conflict (sku) do nothing
       returning id`,
      [
        p.sku,
        p.name,
        catId[p.category],
        p.color,
        p.spec,
        p.cost,
        p.price,
        0,
        p.minStock,
      ],
    );
    if (rows[0]) {
      productIds[p.sku] = rows[0].id;
    } else {
      const found = await sql.query<{ id: number }>(
        "select id from products where sku = $1",
        [p.sku],
      );
      if (found[0]) productIds[p.sku] = found[0].id;
    }
  }

  const today = todayISO();

  async function purchase(
    dayOffset: number,
    supplier: string,
    number: string,
    items: Array<[string, number, number]>,
  ) {
    const date = addDaysISO(today, dayOffset);
    const rows = await sql.query<{ id: number }>(
      "insert into purchases (number, supplier_id, occurred_on, note) values ($1,$2,$3,$4) returning id",
      [number, supplierId[supplier], date, "示範進貨"],
    );
    const id = rows[0]!.id;
    for (const [sku, qty, cost] of items) {
      const pid = productIds[sku];
      await sql.query(
        "insert into purchase_items (purchase_id, product_id, qty, unit_cost) values ($1,$2,$3,$4)",
        [id, pid, qty, cost],
      );
      await sql.query(
        "update products set stock = stock + $2, updated_at = now() where id = $1",
        [pid, qty],
      );
      await sql.query(
        `insert into stock_moves (product_id, kind, qty_delta, ref_type, ref_id, note, created_at)
         values ($1,'purchase',$2,'purchase',$3,'進貨', $4::date + interval '10 hours')`,
        [pid, qty, id, date],
      );
    }
  }

  async function sale(
    dayOffset: number,
    channel: string,
    number: string,
    items: Array<[string, number]>,
  ) {
    const date = addDaysISO(today, dayOffset);
    const rows = await sql.query<{ id: number }>(
      "insert into sales (number, channel, occurred_on, note) values ($1,$2,$3,$4) returning id",
      [number, channel, date, ""],
    );
    const id = rows[0]!.id;
    for (const [sku, qty] of items) {
      const p = PRODUCTS.find((x) => x.sku === sku)!;
      const pid = productIds[sku];
      await sql.query(
        "insert into sale_items (sale_id, product_id, qty, unit_price, unit_cost) values ($1,$2,$3,$4,$5)",
        [id, pid, qty, p.price, p.cost],
      );
      await sql.query(
        "update products set stock = stock - $2, updated_at = now() where id = $1",
        [pid, qty],
      );
      await sql.query(
        `insert into stock_moves (product_id, kind, qty_delta, ref_type, ref_id, note, created_at)
         values ($1,'sale',$2,'sale',$3,'銷貨', $4::date + interval '15 hours')`,
        [pid, -qty, id, date],
      );
    }
  }

  await purchase(-18, "義烏飾品行", "IN-DEMO-01", [
    ["HT-001", 40, 18],
    ["HT-002", 12, 22],
    ["HC-005", 3, 25],
    ["BR-001", 20, 35],
  ]);
  await purchase(-11, "東莞金屬廠", "IN-DEMO-02", [
    ["HC-001", 24, 45],
    ["HC-002", 20, 32],
    ["HC-004", 18, 38],
    ["NK-001", 10, 72],
    ["ER-001", 30, 28],
  ]);
  await purchase(-5, "台中工坊", "IN-DEMO-03", [
    ["HC-003", 8, 55],
    ["HB-001", 10, 68],
    ["HB-002", 10, 42],
    ["BD-001", 12, 36],
    ["ST-001", 4, 180],
  ]);

  await sale(-12, "門市", "OUT-DEMO-01", [
    ["HT-001", 6],
    ["ER-001", 2],
  ]);
  await sale(-10, "蝦皮", "OUT-DEMO-02", [
    ["HC-001", 3],
    ["HC-004", 2],
  ]);
  await sale(-8, "IG", "OUT-DEMO-03", [
    ["HB-001", 1],
    ["BD-001", 2],
  ]);
  await sale(-7, "直播", "OUT-DEMO-04", [
    ["HT-001", 8],
    ["HT-002", 4],
    ["HC-005", 3],
  ]);
  await sale(-5, "門市", "OUT-DEMO-05", [
    ["HC-002", 2],
    ["BR-001", 1],
    ["ER-001", 2],
  ]);
  await sale(-4, "批發", "OUT-DEMO-06", [
    ["HT-001", 12],
    ["HC-004", 6],
  ]);
  await sale(-3, "蝦皮", "OUT-DEMO-07", [
    ["NK-001", 1],
    ["ST-001", 1],
  ]);
  await sale(-2, "門市", "OUT-DEMO-08", [
    ["HC-003", 2],
    ["HB-002", 1],
  ]);
  await sale(-1, "直播", "OUT-DEMO-09", [
    ["HC-001", 2],
    ["HT-002", 3],
    ["BD-001", 1],
  ]);
  await sale(0, "門市", "OUT-DEMO-10", [
    ["ER-001", 1],
    ["HT-001", 2],
  ]);

  await sql.query(
    "insert into app_meta (key, value) values ('seeded', '1') on conflict (key) do nothing",
  );
}
