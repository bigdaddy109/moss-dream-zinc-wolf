import { Link, useRouterState } from "@tanstack/react-router";
import {
  Boxes,
  Flower2,
  LayoutDashboard,
  LineChart,
  PackagePlus,
  ShoppingBag,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "總覽", icon: LayoutDashboard },
  { to: "/products", label: "商品", icon: Flower2 },
  { to: "/purchases", label: "進貨", icon: PackagePlus },
  { to: "/sales", label: "銷貨", icon: ShoppingBag },
  { to: "/inventory", label: "庫存", icon: Boxes },
  { to: "/reports", label: "報表", icon: LineChart },
] as const;

function isActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-border bg-surface/90 px-4 py-6 backdrop-blur-sm md:flex">
        <Brand />
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-150",
                isActive(pathname, item.to)
                  ? "bg-tint text-primary"
                  : "text-muted hover:bg-tint/60 hover:text-fg",
              )}
            >
              <item.icon className="size-4" strokeWidth={1.75} />
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="px-3 text-[11px] leading-relaxed text-subtle">
          髮飾／飾品進銷存
          <br />
          示範資料可直接改
        </p>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-bg/90 px-4 py-3 backdrop-blur-sm md:hidden">
        <Brand compact />
        <span className="text-xs text-muted">進銷存</span>
      </header>

      <main className="pb-24 md:ml-56 md:pb-10">
        <div className="mx-auto max-w-6xl px-4 py-5 md:px-8 md:py-8">
          {children}
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-border bg-surface/95 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-sm md:hidden">
        {NAV.map((item) => {
          const active = isActive(pathname, item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-md text-[10px] font-medium",
                active ? "text-primary" : "text-subtle",
              )}
            >
              <item.icon
                className="size-4"
                strokeWidth={active ? 2.2 : 1.75}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-fg">
        <svg viewBox="0 0 32 32" className="size-5" aria-hidden>
          <path
            d="M8 21c4-8 12-8 16 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="16" cy="11.5" r="2.1" fill="currentColor" />
        </svg>
      </span>
      <div className="leading-none">
        <div className="font-display text-lg tracking-wide">飾記</div>
        {!compact && (
          <div className="mt-1 text-[10px] tracking-[0.18em] text-subtle uppercase">
            Atelier Ledger
          </div>
        )}
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  kicker,
  action,
}: {
  title: string;
  kicker?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 md:mb-7">
      <div>
        {kicker && (
          <p className="mb-1 text-[11px] font-medium tracking-[0.16em] text-subtle uppercase">
            {kicker}
          </p>
        )}
        <h1 className="text-2xl text-fg md:text-3xl">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/50 px-6 py-14 text-center">
      <p className="font-display text-lg">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Money({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <span className={cn("tabular-nums", className)}>
      {new Intl.NumberFormat("zh-TW", {
        style: "currency",
        currency: "TWD",
        maximumFractionDigits: 0,
      }).format(Math.round(value))}
    </span>
  );
}
