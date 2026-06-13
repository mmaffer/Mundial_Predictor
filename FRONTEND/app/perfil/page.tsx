"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { fetchMyStats, api, type UserStats } from "@/services/api";

// ─── Admin Profile ────────────────────────────────────────────────────────────

function AdminProfile() {
  const { user, logout } = useAuth();
  const adminStats = api.getAdminProfileStats();
  const adminSettings = api.getAdminSettings();

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-10">
      <div className="bg-surface-container-high rounded-3xl p-8 border border-error/20 mb-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-error/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-error/40 bg-error/10 flex items-center justify-center text-5xl">🛡️</div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-error rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
              <h2 className="text-2xl font-black text-on-surface">{user?.name}</h2>
              <span className="text-[10px] font-black text-error bg-error/10 border border-error/20 px-2 py-0.5 rounded uppercase tracking-widest">Admin</span>
            </div>
            <p className="text-on-surface-variant text-sm">@{user?.username} · Administrador del sistema</p>
            <p className="text-on-surface-variant text-sm mt-2 max-w-md">
              Gestiona la plataforma Mundial Predictor: usuarios, partidos, salas y reglas del torneo.
            </p>
          </div>
          <div className="flex flex-col items-center gap-1 bg-surface-container rounded-2xl p-4 border border-outline-variant">
            <span className="material-symbols-outlined text-error text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            <span className="text-xs font-bold text-error uppercase tracking-widest mt-1">Super Admin</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {adminStats.map((s) => (
          <div key={s.label} className="bg-surface-container rounded-2xl p-5 border border-outline-variant text-center">
            <span className="material-symbols-outlined text-secondary-container text-3xl block mb-2">{s.icon}</span>
            <div className="text-2xl font-black text-on-surface">{s.value}</div>
            <div className="text-xs text-on-surface-variant mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-4 bg-surface-container rounded-2xl p-5 border border-outline-variant mb-6">
        <span className="material-symbols-outlined text-secondary-container text-2xl flex-shrink-0 mt-0.5">info</span>
        <div>
          <p className="text-sm font-semibold text-on-surface">El administrador no participa en predicciones</p>
          <p className="text-xs text-on-surface-variant mt-1">Para mantener la integridad del torneo, la cuenta de administrador no puede realizar predicciones ni aparecer en el ranking global.</p>
        </div>
      </div>

      <div className="bg-surface-container rounded-2xl border border-outline-variant overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-high">
          <h3 className="font-bold text-on-surface text-sm uppercase tracking-widest">Acceso Rápido</h3>
        </div>
        {adminSettings.map((item, i, arr) => (
          <a
            key={item.label}
            href={item.href}
            className={`w-full flex items-center gap-4 px-6 py-4 hover:bg-surface-container-high transition-colors text-left ${i < arr.length - 1 ? "border-b border-outline-variant/30" : ""}`}
          >
            <span className="material-symbols-outlined text-[20px] text-secondary-container">{item.icon}</span>
            <div>
              <p className="text-sm font-semibold text-on-surface">{item.label}</p>
              <p className="text-xs text-on-surface-variant">{item.desc}</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-[18px] ml-auto">chevron_right</span>
          </a>
        ))}
      </div>

      <div className="bg-surface-container rounded-2xl border border-outline-variant overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-high">
          <h3 className="font-bold text-on-surface text-sm uppercase tracking-widest">Cuenta</h3>
        </div>
        <button
          onClick={() => { logout(); window.location.href = "/"; }}
          className="w-full flex items-center gap-4 px-6 py-4 hover:bg-surface-container-high transition-colors text-left"
        >
          <span className="material-symbols-outlined text-[20px] text-error">logout</span>
          <div>
            <p className="text-sm font-semibold text-error">Cerrar sesión</p>
            <p className="text-xs text-on-surface-variant">Salir del panel de administración</p>
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── User Profile ─────────────────────────────────────────────────────────────

function UserProfile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const badges = api.getUserBadges();

  useEffect(() => {
    fetchMyStats().then(setStats).catch(() => setStats(null));
  }, []);

  const handleLogout = () => { logout(); router.push("/"); };

  const profileStats = stats
    ? [
        { label: "Puntos totales", value: stats.kpis.totalPoints.toLocaleString(), icon: "stars" },
        { label: "Tasa de aciertos", value: `${stats.kpis.accuracyPercent.toFixed(1)}%`, icon: "trending_up" },
        { label: "Predicciones", value: String(stats.kpis.totalPredictions), icon: "list_alt" },
      ]
    : [
        { label: "Puntos totales", value: user?.totalPoints?.toLocaleString() ?? "0", icon: "stars" },
        { label: "Tasa de aciertos", value: "—", icon: "trending_up" },
        { label: "Predicciones", value: "0", icon: "list_alt" },
      ];

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-10">
      <div className="bg-surface-container-high rounded-3xl p-8 border border-outline-variant mb-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-secondary-container/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-secondary-container bg-primary-container flex items-center justify-center text-5xl">🧑‍💻</div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-secondary-container rounded-full flex items-center justify-center hover:brightness-110 transition-all">
              <span className="material-symbols-outlined text-on-secondary text-[16px]">edit</span>
            </button>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-black text-on-surface">{user?.name || "Usuario"}</h2>
            <p className="text-secondary-container font-semibold text-sm">@{user?.username || "usuario"}</p>
            <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
              {badges.map((b) => (
                <div key={b.label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${b.color} text-xs font-bold`}>
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>{b.icon}</span>
                  {b.label}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 bg-surface-container rounded-2xl p-4 border border-outline-variant">
            <span className="text-3xl font-black text-secondary-container">
              {stats?.kpis.globalRank ? `#${stats.kpis.globalRank.toLocaleString()}` : user?.globalRank ? `#${user.globalRank}` : "—"}
            </span>
            <span className="text-xs text-on-surface-variant">Posición global</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {profileStats.map((s) => (
          <div key={s.label} className="bg-surface-container rounded-2xl p-5 border border-outline-variant text-center">
            <span className="material-symbols-outlined text-secondary-container text-3xl block mb-2">{s.icon}</span>
            <div className="text-2xl font-black text-on-surface">{s.value}</div>
            <div className="text-xs text-on-surface-variant mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Prediction Breakdown */}
      {stats && stats.kpis.totalPredictions > 0 && (
        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant mb-6">
          <h3 className="font-bold text-on-surface text-sm mb-4 uppercase tracking-widest">Desglose de Predicciones</h3>
          {[
            { label: "Marcador exacto (5 pts)", count: stats.kpis.exactScores, total: stats.kpis.totalPredictions, color: "bg-secondary-container" },
            { label: "Ganador correcto (3 pts)", count: stats.kpis.correctWinners, total: stats.kpis.totalPredictions, color: "bg-primary" },
            { label: "Incorrectas", count: stats.kpis.totalPredictions - stats.kpis.correctWinners, total: stats.kpis.totalPredictions, color: "bg-error" },
          ].map((item) => (
            <div key={item.label} className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-on-surface-variant">{item.label}</span>
                <span className="text-on-surface font-semibold">{item.count}</span>
              </div>
              <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.total > 0 ? (item.count / item.total) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
          <div className="mt-4 pt-4 border-t border-outline-variant/30 flex justify-between text-xs">
            <span className="text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-orange-400 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              Racha máxima
            </span>
            <span className="text-orange-400 font-bold">×{stats.kpis.maxStreak}</span>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="bg-surface-container rounded-2xl border border-outline-variant overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-high">
          <h3 className="font-bold text-on-surface text-sm uppercase tracking-widest">Configuración de Cuenta</h3>
        </div>
        {[
          { icon: "person", label: "Editar perfil", desc: "Nombre, foto, descripción", danger: false },
          { icon: "notifications", label: "Notificaciones", desc: "Alertas de partidos y predicciones", danger: false },
          { icon: "logout", label: "Cerrar sesión", desc: "Salir de la cuenta", danger: true },
        ].map((item, i, arr) => (
          <button
            key={item.label}
            onClick={item.danger ? handleLogout : undefined}
            className={`w-full flex items-center gap-4 px-6 py-4 hover:bg-surface-container-high transition-colors text-left ${i < arr.length - 1 ? "border-b border-outline-variant/30" : ""}`}
          >
            <span className={`material-symbols-outlined text-[20px] ${item.danger ? "text-error" : "text-on-surface-variant"}`}>{item.icon}</span>
            <div>
              <p className={`text-sm font-semibold ${item.danger ? "text-error" : "text-on-surface"}`}>{item.label}</p>
              <p className="text-xs text-on-surface-variant">{item.desc}</p>
            </div>
            {!item.danger && <span className="material-symbols-outlined text-on-surface-variant text-[18px] ml-auto">chevron_right</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Page entry ───────────────────────────────────────────────────────────────

export default function PerfilPage() {
  const { isAdmin } = useAuth();

  return (
    <DashboardLayout>
      {isAdmin ? <AdminProfile /> : <UserProfile />}
    </DashboardLayout>
  );
}
