"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-secondary-container text-4xl animate-spin">sports_soccer</span>
          <p className="text-on-surface-variant text-sm">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {/* Mobile Top Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-surface-container border-b border-outline-variant/30 shadow-md lg:hidden">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary-container text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
          <span className="text-base font-black text-secondary-container">Mundial Predictor</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-surface-bright transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant text-[22px]">notifications</span>
          </button>
          <button
            className="p-2 rounded-full hover:bg-surface-bright transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="material-symbols-outlined text-on-surface-variant text-[22px]">menu</span>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-64 bg-surface-container-low border-r border-outline-variant flex flex-col gap-1 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6 pt-2">
              <span className="text-base font-black text-secondary-container">Mundial Predictor</span>
              <button
                className="p-1 rounded-full hover:bg-surface-bright transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[22px]">close</span>
              </button>
            </div>
            {[
              { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
              { href: "/partidos", icon: "sports_soccer", label: "Partidos" },
              { href: "/salas", icon: "groups", label: "Salas Privadas" },
              { href: "/ranking", icon: "military_tech", label: "Ranking Global" },
              { href: "/estadisticas", icon: "leaderboard", label: "Estadísticas" },
              { href: "/perfil", icon: "person", label: "Mi Perfil" },
              ...(isAdmin ? [{ href: "/admin", icon: "admin_panel_settings", label: "Admin" }] : []),
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Mobile Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex lg:hidden bg-surface-container-highest border-t border-outline-variant/30 px-2 py-2 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.3)]">
        {[
          { href: "/dashboard", icon: "dashboard", label: "Inicio" },
          { href: "/partidos", icon: "sports_soccer", label: "Partidos" },
          { href: "/prediccion", icon: "add_chart", label: "Predecir" },
          { href: "/ranking", icon: "military_tech", label: "Ranking" },
          { href: "/perfil", icon: "person", label: "Perfil" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center flex-1 py-1 gap-0.5 text-on-surface-variant hover:text-secondary-container transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
            <span className="text-[10px] font-semibold">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Main Content */}
      <main className="lg:ml-64 pt-20 lg:pt-0 min-h-screen pb-20 lg:pb-0">
        {children}
      </main>
    </div>
  );
}
