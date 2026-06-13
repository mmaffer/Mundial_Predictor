"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { fetchGlobalRanking, fetchMyRank, type BackendRankingEntry } from "@/services/api";

function playerName(e: BackendRankingEntry) {
  return [e.firstName, e.lastName].filter(Boolean).join(" ");
}

export default function RankingPage() {
  const { user } = useAuth();
  const [topThree, setTopThree] = useState<BackendRankingEntry[]>([]);
  const [rest, setRest] = useState<BackendRankingEntry[]>([]);
  const [myRank, setMyRank] = useState<{ rank: number; totalPoints: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [global, rankData] = await Promise.all([
          fetchGlobalRanking(1, 20),
          fetchMyRank().catch(() => null),
        ]);
        setTopThree(global.rankings.slice(0, 3));
        setRest(global.rankings.slice(3));
        setMyRank(rankData);
      } catch {
        setTopThree([]);
        setRest([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const badges = ["🥇", "🥈", "🥉"];
  const podiumColors = [
    "border-yellow-400 bg-yellow-500/10",
    "border-slate-400 bg-slate-400/10",
    "border-amber-600 bg-amber-600/10",
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-4 lg:p-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-black text-on-surface">Ranking Global</h2>
            <p className="text-on-surface-variant text-sm max-w-xl mt-1">
              Únete a los mejores predictores del Mundial 2026. Los puntos se otorgan por resultados, marcadores exactos y rachas de aciertos.
            </p>
          </div>
          {myRank && (
            <div className="flex items-center gap-4 bg-surface-container-high p-3 px-4 rounded-2xl border border-outline-variant/30">
              <div className="text-right">
                <p className="text-xs font-bold text-on-surface-variant uppercase">Tu Posición</p>
                <p className="text-lg font-black text-secondary-container">#{myRank.rank.toLocaleString()}</p>
              </div>
              <div className="w-px h-8 bg-outline-variant/50" />
              <div className="text-right">
                <p className="text-xs font-bold text-on-surface-variant uppercase">Tus Puntos</p>
                <p className="text-lg font-black text-primary">{myRank.totalPoints}</p>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-surface-container rounded-2xl h-48 animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            <section className="mb-8">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">Top Predictores</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topThree.map((player, i) => (
                  <div key={player.id} className={`bg-surface-container rounded-2xl p-6 border-2 ${podiumColors[i]} text-center`}>
                    <div className="text-5xl mb-3">{badges[i]}</div>
                    <div className="text-3xl mb-2">{player.country ?? "🌍"}</div>
                    <h4 className="font-bold text-on-surface text-base">{playerName(player)}</h4>
                    <p className="text-xs text-on-surface-variant">@{player.username}</p>
                    <div className="mt-3 space-y-1">
                      <div className="text-2xl font-black text-secondary-container">{player.totalPoints}</div>
                      <div className="text-xs text-on-surface-variant">puntos</div>
                      {player.streak > 0 && (
                        <div className="text-xs font-semibold text-orange-400 bg-orange-900/20 rounded-full px-3 py-0.5 inline-block mt-1">
                          🔥 Racha ×{player.streak}
                        </div>
                      )}
                    </div>
                    {user?.id === player.id && (
                      <div className="mt-2 text-[10px] font-bold text-secondary-container bg-secondary-container/10 rounded-full px-3 py-0.5 inline-block">
                        TÚ
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Scoring Reference */}
            <section className="mb-8 bg-surface-container rounded-2xl border border-outline-variant p-5">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">Sistema de Puntuación</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: "Marcador exacto", pts: "5 pts", icon: "target", color: "text-secondary-container" },
                  { label: "Ganador correcto", pts: "3 pts", icon: "emoji_events", color: "text-primary" },
                  { label: "Dif. de goles", pts: "2 pts", icon: "trending_up", color: "text-tertiary" },
                  { label: "Bonus de racha", pts: "+2 pts", icon: "local_fire_department", color: "text-orange-400" },
                  { label: "Predicción anticipada", pts: "+1 pto", icon: "stars", color: "text-yellow-400" },
                ].map((r) => (
                  <div key={r.label} className="text-center p-3 bg-surface-container-high rounded-xl">
                    <span className={`material-symbols-outlined ${r.color} text-xl block mb-1`} style={{ fontVariationSettings: "'FILL' 1" }}>{r.icon}</span>
                    <p className={`text-base font-black ${r.color}`}>{r.pts}</p>
                    <p className="text-xs text-on-surface-variant mt-1 leading-tight">{r.label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Leaderboard Table */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Tabla Completa</h3>
              </div>

              <div className="bg-surface-container rounded-2xl border border-outline-variant overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-6 py-3 bg-surface-container-high text-xs font-bold text-on-surface-variant uppercase border-b border-outline-variant">
                  <div className="col-span-1">#</div>
                  <div className="col-span-6">Predictor</div>
                  <div className="col-span-3 text-right">Puntos</div>
                  <div className="col-span-2 text-right">Racha</div>
                </div>

                {rest.map((player, i) => {
                  const isMe = user?.id === player.id;
                  return (
                    <div
                      key={player.id}
                      className={`grid grid-cols-12 gap-2 px-6 py-4 items-center transition-colors ${
                        isMe
                          ? "bg-secondary-container/10 border-y border-secondary-container/20"
                          : "hover:bg-surface-container-high"
                      } ${i < rest.length - 1 && !isMe ? "border-b border-outline-variant/30" : ""}`}
                    >
                      <div className="col-span-1 text-sm font-black text-on-surface-variant">
                        {player.rank <= 3 ? badges[player.rank - 1] : player.rank}
                      </div>
                      <div className="col-span-6 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-lg">
                          {player.country ?? "🌍"}
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${isMe ? "text-secondary-container" : "text-on-surface"}`}>
                            {playerName(player)}{isMe ? " (Tú)" : ""}
                          </p>
                          <p className="text-xs text-on-surface-variant">@{player.username}</p>
                        </div>
                      </div>
                      <div className="col-span-3 text-right font-black text-on-surface text-sm">
                        {player.totalPoints}
                      </div>
                      <div className="col-span-2 text-right text-xs font-semibold text-orange-400">
                        {player.streak > 0 ? `🔥×${player.streak}` : "—"}
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-center text-xs text-on-surface-variant mt-4">
                Actualizado en tiempo real
              </p>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
