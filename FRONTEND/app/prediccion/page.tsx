"use client";
import { useState, useEffect, Suspense } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import {
  fetchMatchById,
  fetchUpcomingMatches,
  fetchMyPredictions,
  submitPrediction,
  updatePrediction,
  transformMatch,
} from "@/services/api";

type UIMatch = ReturnType<typeof transformMatch>;

function PrediccionContent() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("matchId");

  const [match, setMatch] = useState<UIMatch | null>(null);
  const [loadingMatch, setLoadingMatch] = useState(true);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [existingPrediction, setExistingPrediction] = useState(false);

  useEffect(() => {
    if (isAdmin) { router.replace("/admin"); return; }

    async function load() {
      try {
        let raw = null;
        if (matchId) {
          raw = await fetchMatchById(matchId);
        } else {
          const upcoming = await fetchUpcomingMatches(1);
          if (upcoming.length > 0) raw = upcoming[0];
        }

        if (!raw) { setLoadingMatch(false); return; }

        const [predictions] = await Promise.all([
          fetchMyPredictions().catch(() => []),
        ]);

        const predictedIds = new Set(predictions.map((p) => p.matchId));
        const predForMatch = predictions.find((p) => p.matchId === raw!.id);

        if (predForMatch) {
          setScoreA(predForMatch.homeScore);
          setScoreB(predForMatch.awayScore);
          setExistingPrediction(true);
        }

        setMatch(transformMatch(raw, predictedIds));
      } catch {
        // match not found, keep null
      } finally {
        setLoadingMatch(false);
      }
    }
    load();
  }, [isAdmin, router, matchId]);

  if (isAdmin) return null;

  const adjust = (team: "A" | "B", delta: number) => {
    if (team === "A") setScoreA((v) => Math.max(0, v + delta));
    else setScoreB((v) => Math.max(0, v + delta));
  };

  const handleSubmit = async () => {
    if (!match) return;
    setError("");
    setSubmitting(true);
    try {
      if (existingPrediction) {
        await updatePrediction(match.id, scoreA, scoreB);
      } else {
        await submitPrediction(match.id, scoreA, scoreB);
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar la predicción.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingMatch) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-secondary-container border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!match) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="text-center space-y-4">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant block">sports_soccer</span>
            <p className="text-on-surface font-bold">No hay partidos disponibles para predecir.</p>
            <Link href="/partidos" className="text-secondary-container text-sm hover:underline">← Ver todos los partidos</Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (submitted) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-surface-container rounded-3xl p-10 max-w-md w-full text-center space-y-6 border border-outline-variant">
            <div className="w-20 h-20 bg-secondary-container/20 rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-secondary-container text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h2 className="text-2xl font-black text-on-surface">¡Predicción Registrada!</h2>
            <div className="flex items-center justify-center gap-6 py-4 bg-surface-container-high rounded-2xl">
              <div className="text-center">
                <div className="text-4xl mb-2">{match.teamA}</div>
                <div className="text-2xl font-black text-on-surface">{scoreA}</div>
                <div className="text-xs text-on-surface-variant">{match.nameA}</div>
              </div>
              <div className="text-on-surface-variant text-xl font-bold">–</div>
              <div className="text-center">
                <div className="text-4xl mb-2">{match.teamB}</div>
                <div className="text-2xl font-black text-on-surface">{scoreB}</div>
                <div className="text-xs text-on-surface-variant">{match.nameB}</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSubmitted(false)}
                className="flex-1 border border-outline text-on-surface py-3 rounded-xl text-sm font-semibold hover:bg-surface-variant transition-colors"
              >
                Editar
              </button>
              <Link
                href="/partidos"
                className="flex-1 bg-secondary-container text-on-secondary py-3 rounded-xl text-sm font-bold text-center hover:brightness-110 transition-all"
              >
                Ver Partidos
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isLocked = match.status === "finished" || match.status === "live";
  const hoursDiff = (new Date(match.scheduledAt).getTime() - Date.now()) / 3600000;
  const hasEarlyBonus = hoursDiff > 24;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-4 lg:p-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-6">
          <Link href="/partidos" className="hover:text-secondary-container transition-colors">Partidos</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface">{match.nameA} vs {match.nameB}</span>
        </div>

        {/* Hero Prediction Card */}
        <div className="relative bg-surface-container-high rounded-3xl p-6 lg:p-10 overflow-hidden shadow-2xl border border-outline-variant/30">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-secondary-container/10 blur-[100px] rounded-full pointer-events-none" />

          <header className="flex justify-between items-start mb-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-secondary-container/10 text-secondary-container px-3 py-1 rounded-full text-xs font-bold uppercase border border-secondary-container/20 mb-2">
                <span className="w-2 h-2 bg-secondary-container rounded-full pulse-live" />
                {existingPrediction ? "Editar Predicción" : "Predicción de Partido"}
              </div>
              <h1 className="text-xl font-black text-on-surface">{match.group}</h1>
              <p className="text-on-surface-variant text-sm mt-1">
                {match.time}
                {match.stadium && ` · ${match.stadium.name}, ${match.stadium.city}`}
              </p>
            </div>
            {hasEarlyBonus && (
              <div className="flex items-center gap-2 bg-surface-bright px-4 py-2 rounded-xl border border-secondary-container/30 shadow-lg">
                <span className="material-symbols-outlined text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                <div>
                  <div className="text-[10px] font-black uppercase text-secondary-container">Bonus Anticipado</div>
                  <div className="text-sm font-bold text-on-surface">+1 PTO</div>
                </div>
              </div>
            )}
          </header>

          {/* Score Input */}
          <div className="grid grid-cols-3 items-center gap-6 mb-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-surface-variant flex items-center justify-center text-6xl lg:text-7xl shadow-inner">
                {match.teamA}
              </div>
              <h2 className="font-bold text-on-surface text-center">{match.nameA}</h2>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-2">
                  <button onClick={() => adjust("A", 1)} className="material-symbols-outlined text-on-surface-variant hover:text-secondary-container transition-colors">expand_less</button>
                  <div className="w-16 h-16 bg-surface-container-lowest rounded-2xl flex items-center justify-center text-3xl font-black text-on-surface border-2 border-secondary-container/40 select-none">
                    {scoreA}
                  </div>
                  <button onClick={() => adjust("A", -1)} className="material-symbols-outlined text-on-surface-variant hover:text-secondary-container transition-colors">expand_more</button>
                </div>
                <span className="text-on-surface-variant font-black text-2xl">–</span>
                <div className="flex flex-col items-center gap-2">
                  <button onClick={() => adjust("B", 1)} className="material-symbols-outlined text-on-surface-variant hover:text-secondary-container transition-colors">expand_less</button>
                  <div className="w-16 h-16 bg-surface-container-lowest rounded-2xl flex items-center justify-center text-3xl font-black text-on-surface border-2 border-secondary-container/40 select-none">
                    {scoreB}
                  </div>
                  <button onClick={() => adjust("B", -1)} className="material-symbols-outlined text-on-surface-variant hover:text-secondary-container transition-colors">expand_more</button>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant text-center">Toca las flechas para ajustar</p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-surface-variant flex items-center justify-center text-6xl lg:text-7xl shadow-inner">
                {match.teamB}
              </div>
              <h2 className="font-bold text-on-surface text-center">{match.nameB}</h2>
            </div>
          </div>

          {/* Quick Scores */}
          <div className="mb-8">
            <p className="text-xs text-on-surface-variant font-semibold uppercase mb-3">Resultados rápidos</p>
            <div className="flex flex-wrap gap-2">
              {[["1-0","A"],["2-0","A"],["2-1","A"],["0-0","Draw"],["1-1","Draw"],["0-1","B"],["0-2","B"]].map(([score]) => {
                const [a, b] = score.split("-").map(Number);
                return (
                  <button
                    key={score}
                    onClick={() => { setScoreA(a); setScoreB(b); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      scoreA === a && scoreB === b
                        ? "bg-secondary-container text-on-secondary border-transparent"
                        : "border-outline-variant text-on-surface-variant hover:border-secondary-container hover:text-on-surface"
                    }`}
                  >
                    {score}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Points Info */}
          <div className="grid grid-cols-4 gap-3 mb-8 p-4 bg-surface-container rounded-2xl">
            <div className="text-center">
              <div className="text-2xl font-black text-secondary-container">5</div>
              <div className="text-xs text-on-surface-variant mt-1">Marcador exacto</div>
            </div>
            <div className="text-center border-x border-outline-variant/30">
              <div className="text-2xl font-black text-primary">3</div>
              <div className="text-xs text-on-surface-variant mt-1">Ganador correcto</div>
            </div>
            <div className="text-center border-r border-outline-variant/30">
              <div className="text-2xl font-black text-secondary">2</div>
              <div className="text-xs text-on-surface-variant mt-1">Dif. de goles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-yellow-400">+1</div>
              <div className="text-xs text-on-surface-variant mt-1">Anticipada</div>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 text-error text-xs bg-error/10 border border-error/20 rounded-xl px-4 py-3">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </div>
          )}

          {isLocked ? (
            <div className="w-full flex items-center justify-center gap-2 bg-surface-container text-on-surface-variant font-bold py-4 rounded-2xl text-sm border border-outline-variant">
              <span className="material-symbols-outlined text-[20px]">lock</span>
              Predicciones cerradas para este partido
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-secondary-container text-on-secondary font-black py-4 rounded-2xl text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-secondary-container/20 disabled:opacity-60"
            >
              {submitting
                ? "Guardando..."
                : existingPrediction
                  ? `✏️ Actualizar Predicción — ${scoreA} : ${scoreB}`
                  : `⚡ Confirmar Predicción — ${scoreA} : ${scoreB}`}
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function PrediccionPage() {
  return (
    <Suspense fallback={null}>
      <PrediccionContent />
    </Suspense>
  );
}
