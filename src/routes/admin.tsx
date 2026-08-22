import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { refreshContent } from "@/lib/content-store";


export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — HIR Industries" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

const ADMIN_KEY = "hir_admin_authed_v2";
const ADMIN_EMAIL = "info@hirgroup.in";
const ADMIN_PASSWORD = "Hir@2026";

function AdminLayout() {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const pathname = useRouterState({ select: s => s.location.pathname });

  useEffect(() => {
    const wasAuthed = typeof window !== "undefined" && localStorage.getItem(ADMIN_KEY) === "1";
    setAuthed(wasAuthed);
    setReady(true);
    if (wasAuthed) { refreshContent().catch(() => { /* ignore */ }); }
  }, []);


  if (!ready) return null;

  if (!authed) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <form
          onSubmit={e => {
            e.preventDefault();
            if (email.trim().toLowerCase() === ADMIN_EMAIL && pw === ADMIN_PASSWORD) {
              localStorage.setItem(ADMIN_KEY, "1");
              setAuthed(true);
              setErr("");
              refreshContent().catch(() => { /* ignore */ });
            } else {
              setErr("Invalid email or password.");
            }

          }}
          className="bg-white border border-border rounded-2xl shadow-elegant p-8 w-full max-w-sm"
        >
          <h1 className="text-2xl font-bold mb-1">Admin Login</h1>
          <p className="text-sm text-muted-foreground mb-6">Sign in with your admin credentials.</p>
          <input
            type="email"
            value={email}
            autoFocus
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-md border border-border px-3 py-2 text-sm mb-3"
          />
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="Password"
            className="w-full rounded-md border border-border px-3 py-2 text-sm mb-3"
          />
          {err && <p className="text-red-500 text-xs mb-3">{err}</p>}
          <button className="w-full bg-brand text-white rounded-md py-2 text-sm font-medium">Sign in</button>
        </form>
      </div>
    );
  }

  const tabs = [
    { to: "/admin", label: "Dashboard", exact: true },
    { to: "/admin/products", label: "Products", exact: false },
    { to: "/admin/blogs", label: "Blogs", exact: false },
    { to: "/admin/catalogue", label: "Catalogue", exact: false },
    { to: "/admin/newsletter", label: "Newsletter", exact: false },
    { to: "/admin/legal", label: "Legal Pages", exact: false },
    { to: "/admin/seo", label: "SEO Audit", exact: false },
  ] as const;

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Admin Top Bar */}
      <header className="sticky top-0 z-40 bg-brand-blue text-white shadow-elegant">
        <div className="max-w-7xl mx-auto px-0 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-md p-1.5">
              <img src="/images/hir-logo.png" alt="HIR" className="h-7 w-auto" />
            </div>
            <div className="leading-tight">
              <p className="text-[10px] font-semibold text-brand uppercase tracking-widest">HIR CMS</p>
              <p className="text-sm font-semibold">Admin Console</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map(t => {
              const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    active ? "bg-white text-brand-blue" : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { localStorage.removeItem(ADMIN_KEY); setAuthed(false); }}
              className="text-xs px-3 py-1.5 rounded-md bg-brand text-white hover:brightness-110 transition font-medium"
            >
              Sign out
            </button>
          </div>

        </div>
        {/* Mobile tabs */}
        <nav className="md:hidden flex gap-1 px-4 pb-2 overflow-x-auto">
          {tabs.map(t => {
            const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
                  active ? "bg-white text-brand-blue" : "text-white/80 bg-white/5"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-0 py-8">
        <Outlet />
      </div>

    </div>
  );
}
