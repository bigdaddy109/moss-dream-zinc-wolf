import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { getReport } from "@/lib/inventory/server";
import { addDaysISO, formatDateShort, pct, todayISO, twd } from "@/lib/utils";

function monthStart(iso: string) {
  return `${iso.slice(0, 7)}-01`;
}

export const Route = createFileRoute("/reports")({
  loader: () => {
    const today = todayISO();
    return getReport({ data: { from: monthStart(today), to: today } });
  },
  component: ReportsPage,
});

function ReportsPage() {
  const seeded = Route.useLoaderData();
  const today = todayISO();
  const [from, setFrom] = useState(monthStart(today));
  const [to, setTo] = useState(today);

  const report = useQuery({
    queryKey: ["report", from, to],
    queryFn: () => getReport({ data: { from, to } }),
    initialData: from === seeded.from && to === seeded.to ? seeded : undefined,
  });

  const presets = useMemo(
    () => [
      { label: "本月", from: monthStart(today), to: today },
      { label: "近 7 日", from: addDaysISO(today, -6), to: today },
      { label: "近 30 日", from: addDaysISO(today, -29), to: today },
    ],
    [today],
  );

  const d = report.data;
  const margin = d && d.sales > 0 ? d.profit / d.sales : 0;

  return (
    <div>
      <PageHeader kicker="Insight" title="報表" />

      <div className="mb-5 flex flex-col gap-3 rounded-xl bg-surface p-4 shadow-[var(--shadow-card)] sm:flex-row sm:items-end">
        <div className="flex flex-wrap gap-1">
          {presets.map((p) => (
            <Button
              key={p.label}
              size="sm"
              variant={from === p.from && to === p.to ? "subtle" : "outline"}
              onClick={() => {
                setFrom(p.from);
                setTo(p.to);
              }}
            >
              {p.label}
            </Button>
          ))}
        </div>
        <div className="grid flex-1 grid-cols-2 gap-2">
          <Field label="起">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="迄">
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
        </div>
      </div>

      {!d ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card className="p-3">
              <p className="text-xs text-muted">銷售額</p>
              <p className="mt-1 font-display text-xl tabular-nums">{twd(d.sales)}</p>
              <p className="text-[11px] text-subtle">{d.orderCount} 筆</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-muted">銷貨成本</p>
              <p className="mt-1 font-display text-xl tabular-nums">{twd(d.cost)}</p>
              <p className="text-[11px] text-subtle">{d.qty} 件</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-muted">毛利</p>
              <p className="mt-1 font-display text-xl tabular-nums text-ok">
                {twd(d.profit)}
              </p>
              <p className="text-[11px] text-subtle">毛利率 {pct(margin)}</p>
            </Card>
            <Card className="p-3">
              <p className="text-xs text-muted">客單價</p>
              <p className="mt-1 font-display text-xl tabular-nums">
                {twd(d.orderCount ? d.sales / d.orderCount : 0)}
              </p>
              <p className="text-[11px] text-subtle">依銷貨單</p>
            </Card>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card>
              <h2 className="mb-3 font-display text-lg">每日銷售</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={d.series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDateShort}
                      tick={{ fill: "var(--color-subtle)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
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
                    <Bar dataKey="sales" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <h2 className="mb-3 font-display text-lg">通路占比</h2>
              {d.byChannel.length === 0 ? (
                <p className="text-sm text-muted">這段期間沒有銷貨。</p>
              ) : (
                <ul className="space-y-3">
                  {d.byChannel.map((c) => {
                    const share = d.sales > 0 ? c.sales / d.sales : 0;
                    return (
                      <li key={c.channel}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span>{c.channel}</span>
                          <span className="tabular-nums text-muted">
                            {twd(c.sales)} · {pct(share)}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-border">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.max(share * 100, share > 0 ? 2 : 0)}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>

          <h2 className="mt-8 mb-3 font-display text-lg">商品毛利排行</h2>
          <div className="overflow-x-auto rounded-xl bg-surface shadow-[var(--shadow-card)]">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="text-xs text-muted">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 font-medium">商品</th>
                  <th className="px-4 py-3 font-medium text-right">件數</th>
                  <th className="px-4 py-3 font-medium text-right">銷售</th>
                  <th className="px-4 py-3 font-medium text-right">成本</th>
                  <th className="px-4 py-3 font-medium text-right">毛利</th>
                </tr>
              </thead>
              <tbody>
                {d.byProduct.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted">
                      沒有資料
                    </td>
                  </tr>
                ) : (
                  d.byProduct.map((p) => (
                    <tr key={p.productId} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted">{p.sku}</div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{p.qty}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{twd(p.sales)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted">
                        {twd(p.cost)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-ok">
                        {twd(p.profit)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
