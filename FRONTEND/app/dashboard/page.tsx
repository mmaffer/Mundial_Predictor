"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchUpcomingMatches,
  fetchMyPredictions,
  fetchMyStats,
  fetchPlatformStats,
  transformMatch,
  api,
  type BackendMatch,
  type BackendPrediction,
} from "@/services/api";

// ─── Admin dashboard ──────────────────────────────────────────────────────────

function AdminDashboard({ name }: { name: string }) {
  const [platformStats, setPlatformStats] = useState<{
    totalUsers: number; liveMatches: number; totalRooms: number; predictionsToday: number;
  } | null>(null);
  const recentEvents = api.getRecentEvents();
  const quickActions = api.getQuickActions();

  useEffect(() => {
    fetchPlatformStats().then(setPlatformStats).catch(() => setPlatformStats(null));
  }, []);

  const stats = platformStats
    ? [
        { icon: "group", label: "Usuarios registrados", value: platformStats.totalUsers.toLocaleString(), badge: "total", color: "text-secondary-container" },
        { icon: "sports_soccer", label: "Partidos en vivo", value: String(platformStats.liveMatches), badge: "EN VIVO", live: true, color: "text-secondary-container" },
        { icon: "meeting_room", label: "Salas activas", value: platformStats.totalRooms.toLocaleString(), badge: "total", color: "text-secondary-container" },
        { icon: "query_stats", label: "Predicciones hoy", value: platformStats.predictionsToday.toLocaleString(), badge: "hoy", color: "text-secondary-container" },
      ]
    : api.getPlatformStats();

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-10 flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-error text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
            Panel de Administración
          </p>
          <h2 className="text-2xl font-black text-on-surface mt-1">Bienvenido, {name}</h2>
          <p className="text-on-surface-variant text-sm mt-1">
            {new Date().toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-xl border border-outline-variant">
          <span className="w-2 h-2 rounded-full bg-secondary-container pulse-live" />
          <span className="text-xs font-bold text-on-surface-variant">Sistemas operativos</span>
        </div>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface-container rounded-2xl p-5 border border-outline-variant hover:border-secondary-container transition-colors">
            <div className="flex justify-between items-start mb-3">
              <span className={`material-symbols-outlined text-2xl ${s.color} bg-secondary-container/10 p-2 rounded-xl`}>{s.icon}</span>
              {(s as typeof s & { live?: boolean }).live ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-secondary-container">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-container pulse-live" />{s.badge}
                </span>
              ) : (
                <span className="text-[10px] font-bold text-secondary-container">{s.badge}</span>
              )}
            </div>
            <p className="text-xl font-black text-on-surface">{s.value}</p>
            <p className="text-xs text-on-surface-variant mt-1">{s.label}</p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container rounded-2xl border border-outline-variant overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-high flex justify-between items-center">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest">Actividad Reciente</h3>
            <span className="text-xs text-on-surface-variant">Tiempo real</span>
          </div>
          <div className="divide-y divide-outline-variant/30">
            {recentEvents.map((e, i) => (
              <div key={i} className="flex items-start gap-4 px-6 py-4 hover:bg-surface-container-high transition-colors">
                <span className={`material-symbols-outlined text-[20px] mt-0.5 flex-shrink-0 ${e.color}`}>{e.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-on-surface">{e.text}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{e.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container rounded-2xl border border-outline-variant overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-high">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest">Acciones Rápidas</h3>
          </div>
          <div className="p-4 flex flex-col gap-2">
            {quickActions.map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-container-high hover:bg-surface-bright border border-outline-variant/50 hover:border-secondary-container transition-all group"
              >
                <span className="material-symbols-outlined text-secondary-container text-[20px]">{a.icon}</span>
                <span className="text-sm font-semibold text-on-surface group-hover:text-secondary-container transition-colors">{a.label}</span>
                <span className="material-symbols-outlined text-on-surface-variant text-[16px] ml-auto">chevron_right</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── User dashboard ───────────────────────────────────────────────────────────

function UserDashboard({ name }: { name: string }) {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState<ReturnType<typeof transformMatch>[]>([]);
  const [predictions, setPredictions] = useState<BackendPrediction[]>([]);
  const [myStats, setMyStats] = useState<{ totalPoints: number; accuracyPercent: number; totalPredictions: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [rawMatches, preds, stats] = await Promise.all([
          fetchUpcomingMatches(3),
          fetchMyPredictions().catch(() => [] as BackendPrediction[]),
          fetchMyStats().catch(() => null),
        ]);
        const predictedIds = new Set(preds.map((p) => p.matchId));
        setUpcoming(rawMatches.map((m: BackendMatch) => transformMatch(m, predictedIds)));
        setPredictions(preds.slice(0, 3));
        if (stats) setMyStats(stats.kpis);
      } catch {
        setUpcoming([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const userStats = [
    {
      icon: "stars",
      label: "Puntos Totales",
      value: myStats ? myStats.totalPoints.toLocaleString() : (user?.totalPoints?.toLocaleString() ?? "0"),
      badge: user?.globalRank ? `Global #${user.globalRank.toLocaleString()}` : "—",
    },
    {
      icon: "trending_up",
      label: "Tasa de Aciertos",
      value: myStats ? `${myStats.accuracyPercent.toFixed(1)}%` : "—",
      badge: "Tu precisión",
    },
    {
      icon: "list_alt",
      label: "Predicciones",
      value: myStats ? String(myStats.totalPredictions) : "0",
      badge: `${predictions.filter((p) => p.pointsTotal > 0).length} con puntos`,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-10 flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-secondary-container text-xs font-bold uppercase tracking-widest">Bienvenido de vuelta</p>
          <h2 className="text-2xl font-black text-on-surface mt-1">{name}</h2>
          <p className="text-on-surface-variant text-sm mt-1">
            {new Date().toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {userStats.map((s) => (
          <div key={s.label} className="bg-surface-container rounded-2xl p-6 border border-outline-variant hover:border-secondary-container transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-secondary-container text-3xl">{s.icon}</span>
              <span className="bg-primary-container text-primary text-xs px-2 py-1 rounded-lg font-semibold">{s.badge}</span>
            </div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-2xl font-black text-on-surface group-hover:text-secondary-container transition-colors">{s.value}</p>
          </div>
        ))}
      </section>

      {user?.streak && user.streak >= 3 && (
        <div className="flex items-center gap-4 bg-surface-container rounded-2xl p-4 border border-outline-variant">
          <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-orange-400 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-on-surface">¡Racha de {user.streak} aciertos consecutivos!</p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Obtuviste <span className="text-orange-400 font-bold">+2 puntos bonus</span> de racha. ¡Mantén la racha!
            </p>
          </div>
          <Link href="/estadisticas" className="text-xs font-bold text-secondary-container hover:underline whitespace-nowrap">Ver estadísticas →</Link>
        </div>
      )}

      {/* Upcoming Matches */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest">Próximos Partidos</h3>
          <Link href="/partidos" className="text-secondary-container text-xs font-semibold hover:underline">Ver todos →</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-surface-container rounded-2xl h-40 animate-pulse" />)}
          </div>
        ) : upcoming.length === 0 ? (
          <p className="text-xs text-on-surface-variant">No hay partidos próximos.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcoming.map((m) => (
              <div key={m.id} className="bg-surface-container rounded-2xl p-5 border border-outline-variant hover:border-secondary-container transition-all">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-on-surface-variant">{m.group}</span>
                  <span className="text-xs font-semibold text-secondary-container bg-secondary-container/10 px-2 py-0.5 rounded-full">{m.time}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-3xl">{m.teamA}</span>
                    <span className="text-xs font-semibold text-on-surface text-center">{m.nameA}</span>
                  </div>
                  <span className="text-on-surface-variant text-sm font-bold">VS</span>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-3xl">{m.teamB}</span>
                    <span className="text-xs font-semibold text-on-surface text-center">{m.nameB}</span>
                  </div>
                </div>
                <Link
                  href={`/prediccion?matchId=${m.id}`}
                  className="w-full block text-center bg-secondary-container/10 hover:bg-secondary-container/20 text-secondary-container text-xs font-bold py-2 rounded-xl transition-colors"
                >
                  {m.predicted ? "✓ Ver predicción" : "Predecir →"}
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Predictions */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest">Mis Últimas Predicciones</h3>
          <Link href="/estadisticas" className="text-secondary-container text-xs font-semibold hover:underline">Ver estadísticas →</Link>
        </div>
        {predictions.length === 0 && !loading ? (
          <div className="bg-surface-container rounded-2xl border border-outline-variant p-6 text-center">
            <p className="text-xs text-on-surface-variant">Aún no tienes predicciones. <Link href="/partidos" className="text-secondary-container hover:underline">¡Haz tu primera predicción!</Link></p>
          </div>
        ) : (
          <div className="bg-surface-container rounded-2xl border border-outline-variant overflow-hidden">
            {predictions.map((p, i) => (
              <div key={p.id} className={`flex items-center gap-3 p-4 ${i < predictions.length - 1 ? "border-b border-outline-variant/30" : ""}`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  p.status === "SCORED" && p.pointsTotal > 0 ? "bg-green-400" : p.status === "PENDING" ? "bg-yellow-400" : "bg-red-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-on-surface truncate">
                    Predicción: {p.homeScore} – {p.awayScore}
                  </p>
                  <p className="text-xs text-on-surface-variant">{p.status === "PENDING" ? "Pendiente de resultado" : "Puntuada"}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${
                  p.pointsTotal > 0 ? "bg-green-900/30 text-green-400" : "bg-surface-container-high text-on-surface-variant"
                }`}>
                  {p.pointsTotal > 0 ? `+${p.pointsTotal} pts` : p.status === "PENDING" ? "—" : "0 pts"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Page entry ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();

  return (
    <DashboardLayout>
      {isAdmin
        ? <AdminDashboard name={user?.name || "Admin"} />
        : <UserDashboard name={user?.name || "Predictor"} />
      }
    </DashboardLayout>
  );
}
