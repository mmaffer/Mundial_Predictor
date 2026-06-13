"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { fetchMatches, fetchMyPredictions, transformMatch } from "@/services/api";

type Status = "live" | "upcoming" | "finished";

const tabs: { key: Status | "all"; label: string }[] = [
  { key: "all", label: "TODOS" },
  { key: "upcoming", label: "PRÓXIMOS" },
  { key: "live", label: "EN VIVO" },
  { key: "finished", label: "FINALIZADOS" },
];

export default function PartidosPage() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<Status | "all">("all");
  const [search, setSearch] = useState("");
  const [matches, setMatches] = useState<ReturnType<typeof transformMatch>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [rawMatches, predictions] = await Promise.all([
          fetchMatches(),
          fetchMyPredictions().catch(() => []),
        ]);
        const predictedIds = new Set(predictions.map((p) => p.matchId));
        setMatches(rawMatches.map((m) => transformMatch(m, predictedIds)));
      } catch {
        setMatches([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = matches.filter((m) => {
    const matchesTab = activeTab === "all" || m.status === activeTab;
    const matchesSearch =
      m.nameA.toLowerCase().includes(search.toLowerCase()) ||
      m.nameB.toLowerCase().includes(search.toLowerCase()) ||
      m.group.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const counts = {
    upcoming: matches.filter((m) => m.status === "upcoming").length,
    live: matches.filter((m) => m.status === "live").length,
    finished: matches.filter((m) => m.status === "finished").length,
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div>
            <h2 className="text-2xl font-black text-on-surface hidden md:block">Partidos del Torneo</h2>
            <p className="text-on-surface-variant text-sm">
              {isAdmin
                ? "Supervisa y gestiona todos los partidos del torneo."
                : "Predice resultados y sube en el ranking global."}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-surface-container-high border border-outline-variant rounded-full px-4 py-2">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
            <input
              type="text"
              placeholder="Buscar equipos o grupos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-sm text-on-surface placeholder-on-surface-variant/50 w-40 lg:w-56"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-outline-variant overflow-x-auto no-scrollbar mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 px-1 text-xs font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.key
                  ? "border-secondary-container text-secondary-container"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab.label}
              {tab.key === "live" && <span className="w-2 h-2 rounded-full bg-red-500 pulse-live" />}
              {tab.key !== "all" && counts[tab.key] > 0 && (
                <span className="bg-surface-container-high px-1.5 py-0.5 rounded text-xs">
                  {counts[tab.key as Status]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 h-48 animate-pulse bg-surface-container" />
            ))}
          </div>
        )}

        {/* Match Cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((match) => (
              <div
                key={match.id}
                className="glass-card rounded-2xl p-6 flex flex-col gap-4 match-card-hover transition-all duration-300 relative overflow-hidden"
              >
                {match.status === "live" && (
                  <div className="absolute top-0 right-0 p-3">
                    <span className="bg-red-500/10 text-red-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 pulse-live">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      EN VIVO
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs text-on-surface-variant">
                  <span>{match.group}</span>
                  {match.status !== "live" && (
                    <span
                      className={
                        match.status === "finished"
                          ? "text-on-surface-variant"
                          : "text-secondary-container font-semibold"
                      }
                    >
                      {match.time}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-4xl">{match.teamA}</span>
                    <span className="text-xs font-semibold text-on-surface text-center">{match.nameA}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 px-4">
                    {match.status !== "upcoming" ? (
                      <span className="text-2xl font-black text-on-surface">
                        {match.scoreA} – {match.scoreB}
                      </span>
                    ) : (
                      <span className="text-on-surface-variant text-sm font-bold">VS</span>
                    )}
                    {match.status === "finished" && (
                      <span className="text-xs text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
                        FIN
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-4xl">{match.teamB}</span>
                    <span className="text-xs font-semibold text-on-surface text-center">{match.nameB}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-outline-variant/30">
                  {isAdmin ? (
                    <Link
                      href="/admin"
                      className="w-full block text-center bg-surface-container-high text-on-surface-variant text-xs font-bold py-2.5 rounded-xl hover:bg-surface-bright transition-all"
                    >
                      {match.status === "live" ? "⚡ Actualizar marcador" : "Gestionar partido →"}
                    </Link>
                  ) : match.predicted ? (
                    <div className="flex items-center justify-center gap-2 text-green-400 text-xs font-semibold">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Predicción realizada
                    </div>
                  ) : match.status === "upcoming" || match.status === "live" ? (
                    <Link
                      href={`/prediccion?matchId=${match.id}`}
                      className="w-full block text-center bg-secondary-container text-on-secondary text-xs font-bold py-2.5 rounded-xl hover:brightness-110 transition-all"
                    >
                      {match.status === "live" ? "⚡ Predecir ahora" : "Hacer Predicción →"}
                    </Link>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-on-surface-variant text-xs">
                      <span className="material-symbols-outlined text-[16px]">lock</span>
                      Sin predicción
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl block mb-4">search_off</span>
            <p className="text-base font-semibold">No se encontraron partidos</p>
            <p className="text-sm mt-1">Intenta con otro término de búsqueda</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
