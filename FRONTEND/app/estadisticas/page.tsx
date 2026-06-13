"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { fetchMyStats, type UserStats } from "@/services/api";

export default function EstadisticasPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const kpis = stats
    ? [
        {
          label: "PUNTOS TOTALES",
          value: stats.kpis.totalPoints.toLocaleString(),
          sub: `Racha actual: ${stats.kpis.currentStreak}`,
          subColor: "text-orange-400",
          icon: "trending_up",
        },
        {
          label: "PRECISIÓN",
          value: `${stats.kpis.accuracyPercent.toFixed(1)}%`,
          sub: `${stats.kpis.correctWinners} acertados / ${stats.kpis.totalPredictions} totales`,
          subColor: "text-green-400",
          icon: "target",
        },
        {
          label: "RANKING",
          value: stats.kpis.globalRank ? `#${stats.kpis.globalRank.toLocaleString()}` : "—",
          sub: "Ranking global",
          subColor: "text-on-surface-variant",
          icon: "military_tech",
        },
        {
          label: "MARCADORES EXACTOS",
          value: String(stats.kpis.exactScores),
          sub: `de ${stats.kpis.totalPredictions} predicciones`,
          subColor: "text-secondary-container",
          icon: "workspace_premium",
        },
      ]
    : [];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-4 lg:p-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-on-surface">Centro de Estadísticas</h2>
            <p className="text-on-surface-variant text-sm mt-1">Análisis detallado de tu rendimiento en predicciones.</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl h-28 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {kpis.map((k) => (
                <div key={k.label} className="glass-card p-6 rounded-2xl flex flex-col gap-1.5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                    <span className="material-symbols-outlined text-4xl">{k.icon}</span>
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{k.label}</span>
                  <span className="text-2xl font-black text-secondary-container">{k.value}</span>
                  <span className={`text-xs ${k.subColor}`}>{k.sub}</span>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
              {/* Trend Chart (decorative) */}
              <div className="lg:col-span-8 glass-card p-6 rounded-2xl flex flex-col min-h-[380px]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-base font-bold text-on-surface">Tendencia de Rendimiento</h3>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                      <div className="w-3 h-3 rounded-full bg-secondary-container" /> Tú
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                      <div className="w-3 h-3 rounded-full bg-outline opacity-50" /> Promedio global
                    </span>
                  </div>
                </div>
                <div className="flex-grow relative h-64">
                  <svg className="absolute inset-0 w-full h-full p-4" preserveAspectRatio="none" viewBox="0 0 800 200">
                    <path d="M0,150 Q200,140 400,160 T800,145" fill="none" stroke="#8f9098" strokeDasharray="8 4" strokeWidth="2" opacity="0.3" />
                    <path d="M0,180 Q100,150 200,160 T400,100 T600,120 T800,40" fill="none" stroke="#00d2fd" strokeLinecap="round" strokeWidth="4" style={{ filter: "drop-shadow(0 0 10px rgba(0,210,253,0.5))" }} />
                  </svg>
                </div>
              </div>

              {/* Donut */}
              <div className="lg:col-span-4 glass-card p-6 rounded-2xl flex flex-col">
                <h3 className="text-base font-bold text-on-surface mb-6">Tipo de Predicción</h3>
                <div className="relative w-44 h-44 mx-auto my-4">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#2d3449" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#00d2fd"
                      strokeDasharray={`${stats ? stats.kpis.accuracyPercent : 68} 100`}
                      strokeLinecap="round" strokeWidth="3" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-on-surface">
                      {stats ? `${stats.kpis.accuracyPercent.toFixed(0)}%` : "—"}
                    </span>
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Aciertos</span>
                  </div>
                </div>
                <div className="space-y-2 mt-auto">
                  {[
                    { color: "bg-secondary-container", label: "Resultado correcto", val: stats?.kpis.correctWinners ?? 0 },
                    { color: "bg-primary", label: "Marcador exacto", val: stats?.kpis.exactScores ?? 0 },
                    { color: "bg-surface-variant", label: "Incorrecto", val: (stats?.kpis.totalPredictions ?? 0) - (stats?.kpis.correctWinners ?? 0) },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-xs text-on-surface-variant">{item.label}</span>
                      </div>
                      <span className="text-xs font-bold text-on-surface">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Best Teams */}
            {stats && stats.bestPredictedTeams.length > 0 && (
              <div className="glass-card p-6 rounded-2xl mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-base font-bold text-on-surface">Mejores Equipos Predichos</h3>
                  <span className="text-xs text-on-surface-variant">Por rendimiento</span>
                </div>
                <div className="space-y-4">
                  {stats.bestPredictedTeams.map((t) => (
                    <div key={t.name}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="flex items-center gap-2 text-on-surface-variant">
                          <span>{t.flag}</span> {t.name}
                        </span>
                        <span className="font-bold text-on-surface">{t.accuracy}% ({t.correct}/{t.total})</span>
                      </div>
                      <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                        <div className="h-full bg-secondary-container rounded-full" style={{ width: `${t.accuracy}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats && stats.kpis.totalPredictions === 0 && (
              <div className="glass-card p-10 rounded-2xl text-center">
                <span className="material-symbols-outlined text-6xl text-on-surface-variant block mb-4">query_stats</span>
                <p className="text-on-surface font-bold">Aún no tienes predicciones registradas.</p>
                <p className="text-on-surface-variant text-sm mt-2">Ve a Partidos y haz tu primera predicción para ver tus estadísticas aquí.</p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
