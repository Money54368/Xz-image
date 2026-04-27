"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import webConfig from "@/constants/common-env";
import { clearStoredConnection } from "@/store/auth";
import { cn } from "@/lib/utils";

const navItems = [{ href: "/image", label: "绘图" }];

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await clearStoredConnection();
    router.replace("/login");
  };

  if (pathname === "/login") {
    return null;
  }

  return (
    <header className="border-b border-stone-200/60">
      <div className="flex h-14 items-center justify-between px-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/image" className="text-base font-semibold tracking-tight text-stone-950">
            Xz-Image
          </Link>
        </div>

        <div className="flex flex-1 justify-center gap-8">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative py-1 text-sm font-medium transition sm:text-[15px]",
                  active ? "font-semibold text-stone-950" : "text-stone-500 hover:text-stone-900",
                )}
              >
                {item.label}
                {active ? <span className="absolute inset-x-0 -bottom-[9px] h-0.5 bg-stone-950" /> : null}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-500">
            v{webConfig.appVersion}
          </span>
          <button
            type="button"
            className="text-sm text-stone-400 transition hover:text-stone-700"
            onClick={() => void handleLogout()}
          >
            退出
          </button>
        </div>
      </div>
    </header>
  );
}
