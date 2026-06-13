"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/partidos", icon: "sports_soccer", label: "Partidos" },
  { href: "/salas", icon: "groups", label: "Salas Privadas" },
  { href: "/ranking", icon: "military_tech", label: "Ranking Global" },
  { href: "/estadisticas", icon: "leaderboard", label: "Estadísticas" },
  { href: "/perfil", icon: "person", label: "Mi Perfil" },
];

const adminItem = { href: "/admin", icon: "admin_panel_settings", label: "Admin" };

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const items = isAdmin ? [...navItems, adminItem] : navItems;

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 p-4 gap-1 bg-surface-container-low border-r border-outline-variant shadow-xl z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-6 px-2 pt-3 pb-2">
        <div className="w-9 h-9 bg-secondary-container rounded-xl flex items-center justify-center text-on-secondary flex-shrink-0">
          <span className="material-symbols-outlined text-[20px]">sports_soccer</span>
        </div>
        <div>
          <h1 className="text-sm font-black text-secondary-container leading-tight">Mundial Predictor</h1>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest opacity-70">World Cup 2026</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold ${
                isActive
                  ? "bg-primary-container text-on-primary-container"
                  : "text-on-surface-variant hover:bg-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        {/* Admin badge separator */}
        {isAdmin && (
          <div className="mt-1 pt-1 border-t border-outline-variant/30">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-3 py-1 opacity-50">
              Zona Admin
            </p>
          </div>
        )}
      </nav>

      {/* Bottom section */}
      <div className="flex flex-col gap-3 pt-3 border-t border-outline-variant/30">
        {/* User info */}
        {user && (
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-surface-container border border-outline-variant/50">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0 ${isAdmin ? "bg-error/20" : "bg-primary-container"}`}>
              {isAdmin ? "🛡️" : "🧑‍💻"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-on-surface truncate">{user.name}</p>
                {isAdmin && (
                  <span className="text-[9px] font-black text-error bg-error/10 px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0">Admin</span>
                )}
              </div>
              <p className="text-[10px] text-on-surface-variant truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="p-1 text-on-surface-variant hover:text-error transition-colors flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        )}

        {/* CTA — hidden for admin */}
        {!isAdmin && (
          <Link
            href="/prediccion"
            className="w-full bg-secondary-container text-on-secondary text-sm font-bold py-3 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <span className="material-symbols-outlined text-[18px]">add_chart</span>
            HACER PREDICCIÓN
          </Link>
        )}
      </div>
    </aside>
  );
}
