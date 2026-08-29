import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowUpRight,
  Package,
  ShoppingBag,
  TrendingUp,
  Warehouse,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDashboard } from "@/lib/inventory/server";
import { formatDateShort, twd } from "@/lib/utils";

export const Route = createFileRoute("/")({
  loader: () => getDashboard(),
  component: DashboardPage,
});

function DashboardPage() {
  const initial = Route.useLoaderData();
  const q = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getDashboard(),
    initialData: initial,
  });

  if (q.isLoading) {
    return (
      <div className="grid gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-surface" />
        ))}
      </div>
    );
  }
  if (q.isError || !q.data) {
    return (
      <p className="text-sm text-danger">
        無法載入總覽：{q.error instanceof Error ? q.error.message : "請再試一次"}
      </p>
    );
  }

  const d = q.data;
  const margin = d.monthSales > 0 ? d.monthProfit / d.monthSales : 0;

  return (
    <div>
      <PageHeader
        kicker="今日店鋪"
        title="總覽"
        action={
          <div className="flex gap-2">
            {d.lowStock.length > 0 && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/purchases" search={{ fill: "low" }}>
                  低庫存補貨
                </Link>
              </Button>
            )}
            <Button size="sm" asChild>
              <Link to="/sales">收銀結帳</Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat
          label="今日銷售"
          value={twd(d.todaySales)}
          hint={`${d.todayCount} 筆`}
          icon={ShoppingBag}
        />
        <Stat
          label="本月營收"
          value={twd(d.monthSales)}
          hint={`${d.monthCount} 筆訂單`}
          icon={TrendingUp}
        />
        <Stat
          label="本月毛利"
          value={twd(d.monthProfit)}
          hint={`毛利率 ${(margin * 100).toFixed(0)}%`}
          icon={ArrowUpRight}
        />
        <Stat
          label="庫存成本"
          value={twd(d.inventoryValue)}
          hint={`${d.skuCount} 款 · ${d.unitCount} 件`}
          icon={Warehouse}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-lg">近 14 日銷售</h2>
            <span className="text-xs text-muted">依成交日</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={d.series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDateShort}
                  tick={{ fill: "var(--color-subtle)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
                  tick={{ fill: "var(--color-subtle)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(value) => [twd(Number(value ?? 0)), "銷售"]}
                  labelFormatter={(l) => formatDateShort(String(l))}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#salesFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 font-display text-lg">本月熱銷</h2>
          {d.topProducts.length === 0 ? (
            <p className="text-sm text-muted">這個月還沒有銷貨。</p>
          ) : (
            <ol className="space-y-3">
              {d.topProducts.map((p, i) => (
                <li key={p.name} className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="w-5 font-display text-muted">{i + 1}</span>
                    <span className="truncate text-sm">{p.name}</span>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-muted">
                    {p.qty} 件 · {twd(p.sales)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-lg">
              <AlertTriangle className="size-4 text-warn" />
              低庫存
            </h2>
            {d.lowStock.length > 0 ? (
              <Link
                to="/purchases"
                search={{ fill: "low" }}
                className="text-xs text-primary"
              >
                一鍵補貨
              </Link>
            ) : (
              <Link to="/inventory" className="text-xs text-primary">
                查看庫存
              </Link>
            )}
          </div>
          {d.lowStock.length === 0 ? (
            <p className="text-sm text-muted">目前沒有低於安全庫存的商品。</p>
          ) : (
            <ul className="divide-y divide-border">
              {d.lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted">
                      {p.sku} · 安全 {p.minStock}
                    </p>
                  </div>
                  <Badge tone={p.stock === 0 ? "danger" : "warn"}>
                    {p.stock === 0 ? "缺貨" : `剩 ${p.stock}`}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-lg">
              <Package className="size-4 text-primary" />
              最近銷貨
            </h2>
            <Link to="/sales" className="text-xs text-primary">
              收銀
            </Link>
          </div>
          {d.recentSales.length === 0 ? (
            <p className="text-sm text-muted">還沒有銷貨紀錄。</p>
          ) : (
            <ul className="divide-y divide-border">
              {d.recentSales.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium">{s.number}</p>
                    <p className="text-xs text-muted">
                      {s.occurredOn.slice(5)} · {s.channel} · {s.qty} 件
                    </p>
                  </div>
                  <span className="text-sm tabular-nums">{twd(s.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof ShoppingBag;
}) {
  return (
    <Card className="p-3 md:p-4">
      <div className="flex items-start justify-between">
        <p className="text-xs text-muted">{label}</p>
        <Icon className="size-4 text-subtle" strokeWidth={1.75} />
      </div>
      <p className="mt-2 font-display text-xl tabular-nums tracking-tight md:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-subtle">{hint}</p>
    </Card>
  );
}
