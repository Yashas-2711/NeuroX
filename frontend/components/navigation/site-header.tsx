"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Bell, Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useSyncExternalStore } from "react";

import { useAuth } from "@/hooks/use-auth";
import { getUnreadNotificationCount } from "@/services/notification.service";

const links = [
  { label: "Platform", href: "#platform" },
  { label: "How It Works", href: "#workflow" },
  { label: "Challenges", href: "#challenges" },
  { label: "About", href: "#about" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const { resolvedTheme, setTheme } = useTheme();
  const { user, hydrated: authHydrated, logout } = useAuth();

  const showAuthenticatedActions = authHydrated && Boolean(user);

  return (
    <header className="sticky top-0 z-50 border-b border-hairline/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:px-8 lg:px-12">
        <Link href="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center border border-foreground text-sm font-bold tracking-[-0.08em]">NX</span>
          <span className="text-sm font-bold uppercase tracking-[0.22em]">NeurX</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button type="button" className="icon-button" aria-label="Toggle color theme" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
            {mounted && resolvedTheme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          {showAuthenticatedActions ? (
            <>
              <NotificationLink />
              <Link href={`/${user?.role.toLowerCase()}`} className="button-secondary">{user?.name}</Link>
              <button type="button" className="button-primary" onClick={() => void logout()}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="button-secondary">Login</Link>
              <Link href="/register" className="button-primary">Register</Link>
            </>
          )}
        </div>

        <button type="button" className="icon-button md:hidden" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="border-t border-hairline bg-background px-5 py-6 md:hidden" aria-label="Mobile navigation">
            <div className="flex flex-col gap-5">
              {links.map((link) => (
                <a key={link.href} href={link.href} className="nav-link" onClick={() => setOpen(false)}>{link.label}</a>
              ))}
              <div className="flex gap-3 border-t border-hairline pt-5">
                {showAuthenticatedActions ? (
                  <button type="button" className="button-primary flex-1" onClick={() => { setOpen(false); void logout(); }}>Logout</button>
                ) : (
                  <>
                    <Link href="/login" className="button-secondary flex-1 text-center" onClick={() => setOpen(false)}>Login</Link>
                    <Link href="/register" className="button-primary flex-1 text-center" onClick={() => setOpen(false)}>Register</Link>
                  </>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function NotificationLink() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const load = () => { void getUnreadNotificationCount().then(setCount).catch(() => undefined); };
    load();
    window.addEventListener("neurox:notifications-changed", load);
    window.addEventListener("focus", load);
    return () => {
      window.removeEventListener("neurox:notifications-changed", load);
      window.removeEventListener("focus", load);
    };
  }, []);
  return <Link href="/notifications" className="icon-button relative" aria-label={count ? `${count} unread notifications` : "Notifications"}><Bell size={17} />{count > 0 && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-blue-400 px-1 text-center text-[10px] text-black">{count > 9 ? "9+" : count}</span>}</Link>;
}
