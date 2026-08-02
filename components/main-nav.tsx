"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MainNavProps {
  // 부서 선택 완료 여부. false면 온보딩 강제 상태로, 프로필 메뉴만 노출한다.
  hasDepartment: boolean;
  // 관리자(role = 'admin') 여부. true면 "전체 부서 조회" 메뉴가 추가된다.
  isAdmin: boolean;
}

interface NavItem {
  label: string;
  href: string;
}

function buildNavItems({ hasDepartment, isAdmin }: MainNavProps): NavItem[] {
  const items: NavItem[] = [];

  if (hasDepartment) {
    items.push({ label: "주간업무 목록", href: "/protected/reports" });
    items.push({ label: "주간업무 작성", href: "/protected/reports/new" });

    if (isAdmin) {
      items.push({ label: "전체 부서 조회", href: "/protected/admin" });
    }
  }

  items.push({ label: "프로필", href: "/protected/profile" });

  return items;
}

export function MainNav({ hasDepartment, isAdmin }: MainNavProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const items = buildNavItems({ hasDepartment, isAdmin });

  // 키보드 사용자가 모바일 메뉴를 Esc로 닫을 수 있게 한다.
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <nav className="w-full border-b border-b-foreground/10">
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between p-3 px-5 text-sm">
        <div className="flex items-center gap-6">
          <Link href="/protected/reports" className="font-semibold">
            주간업무 일지
          </Link>
          <div className="hidden md:flex items-center gap-4">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-muted-foreground transition-colors hover:text-foreground",
                  pathname === item.href && "font-medium text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden md:block">
          <LogoutButton />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        >
          {isMobileMenuOpen ? (
            <X size={20} aria-hidden="true" />
          ) : (
            <Menu size={20} aria-hidden="true" />
          )}
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div className="flex flex-col gap-1 border-t border-t-foreground/10 px-5 py-3 md:hidden">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "py-2 text-sm text-muted-foreground hover:text-foreground",
                pathname === item.href && "font-medium text-foreground",
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2">
            <LogoutButton />
          </div>
        </div>
      )}
    </nav>
  );
}
