"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";

export default function AdminPage() {
  const { isAdmin, isAuthenticated } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const users = api.getAdminUsers();
  const scoringRules = api.getScoringRules();
  const liveMatches = api.getAdminLiveMatches();
  const [scores, setScores] = useState(liveMatches.map((m) => ({ a: m.scoreA, b: m.scoreB })));

  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isAdmin, router]);

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <span className="material-symbols-outlined text-error text-6xl block">gpp_bad</span>
            <h2 className="text-xl font-black text-on-surface">Acceso denegado</h2>
            <p className="text-on-surface-variant text-sm">No tienes permisos para acceder al panel de administración.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-4 lg:p-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-on-surface">Panel de Administración</h2>
            <p className="text-on-surface-variant text-sm mt-1">Estado en tiempo real del ecosistema Mundial Predictor.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-full border border-outline-variant text-xs font-bold text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-secondary-container pulse-live" />
            SISTEMAS OPERATIVOS
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: "person", label: "Usuarios registrados", value: "1,284,092", badge: "+12%", color: "text-secondary-container" },
            { icon: "sports_soccer", label: "Partidos activos", value: "12", badge: "EN VIVO", color: "text-secondary-container", live: true },
            { icon: "meeting_room", label: "Salas privadas creadas", value: "45,201", badge: "+84", color: "text-secondary-container" },
            { icon: "query_stats", label: "Predicciones procesadas", value: "4.2M", badge: "99.9%", color: "text-secondary-container" },
          ].map((s) => (
            <div key={s.label} className="bg-surface-container p-6 rounded-2xl border border-outline-variant hover:border-secondary-container transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined text-secondary-container bg-secondary-container/10 p-2 rounded-xl">{s.icon}</span>
                {s.live ? (
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary-container pulse-live" />
                    <span className="text-xs font-bold text-secondary-container">{s.badge}</span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-secondary-container">{s.badge}</span>
                )}
              </div>
              <div className="text-2xl font-black text-on-surface">{s.value}</div>
              <div className="text-xs text-on-surface-variant mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* User Management + Scoring Rules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Table */}
          <div className="lg:col-span-2 bg-surface-container-high rounded-2xl border border-outline-variant overflow-hidden flex flex-col">
            <div className="p-5 flex justify-between items-center border-b border-outline-variant">
              <h3 className="font-bold text-on-surface">Gestión de Usuarios</h3>
              <div className="flex gap-2">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">search</span>
                  <input
                    type="text"
                    placeholder="Buscar usuarios..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-surface-container border border-outline-variant rounded-full pl-8 pr-4 py-1.5 text-xs text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-secondary-container"
                  />
                </div>
                <button className="p-2 bg-surface-container border border-outline-variant rounded-xl hover:bg-surface-bright transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">filter_list</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-highest text-xs font-bold text-on-surface-variant uppercase border-b border-outline-variant">
                  <tr>
                    <th className="px-5 py-3">Usuario</th>
                    <th className="px-5 py-3">Registro</th>
                    <th className="px-5 py-3">Puntos</th>
                    <th className="px-5 py-3">Estado</th>
                    <th className="px-5 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {filtered.map((u) => (
                    <tr key={u.email} className="hover:bg-surface-variant/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-container border border-outline-variant flex items-center justify-center text-lg">
                            🙂
                          </div>
                          <div>
                            <p className="text-sm font-bold text-on-surface">{u.name}</p>
                            <p className="text-xs text-on-surface-variant">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-on-surface-variant">{u.joined}</td>
                      <td className="px-5 py-4 text-sm font-bold text-secondary-container">{u.pts}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-widest border ${
                          u.status === "active"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-error/10 text-error border-error/20"
                        }`}>
                          {u.status === "active" ? "Activo" : "Suspendido"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button className="p-2 text-on-surface-variant hover:text-secondary-container transition-colors">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button className="p-2 text-on-surface-variant hover:text-error transition-colors">
                            <span className="material-symbols-outlined text-[18px]">{u.status === "banned" ? "lock_open" : "block"}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-surface-container flex justify-between items-center text-xs text-on-surface-variant border-t border-outline-variant/30">
              <span>Mostrando 1-10 de 1.2M usuarios</span>
              <div className="flex gap-1">
                <button className="px-3 py-1 bg-surface-container-high border border-outline-variant rounded hover:bg-surface-bright disabled:opacity-40" disabled>Anterior</button>
                <button className="px-3 py-1 bg-surface-container-high border border-outline-variant rounded hover:bg-surface-bright">Siguiente</button>
              </div>
            </div>
          </div>

          {/* Scoring Rules */}
          <div className="bg-surface-container p-6 rounded-2xl border border-outline-variant h-fit">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-secondary-container">rule</span>
              <h3 className="font-bold text-on-surface">Lógica de Puntuación</h3>
            </div>
            <div className="space-y-3">
              {scoringRules.map((r) => (
                <div key={r.label} className="p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-on-surface">{r.label}</span>
                    <span className="text-sm font-black text-secondary-container">{r.pts}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">{r.desc}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-3 border border-dashed border-outline rounded-xl text-on-surface-variant hover:text-secondary-container hover:border-secondary-container transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase">
              <span className="material-symbols-outlined text-[16px]">add</span>
              Agregar nueva regla
            </button>
          </div>
        </div>

        {/* Live Match Score Updates */}
        <div className="bg-surface-container-high rounded-2xl border border-outline-variant overflow-hidden">
          <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-outline-variant">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-on-surface">Actualización de Marcadores</h3>
              <span className="px-2 py-0.5 bg-error/10 text-error text-[10px] font-bold rounded-full border border-error/20 uppercase tracking-widest">Solo en vivo</span>
            </div>
            <button className="flex items-center gap-2 bg-secondary-container text-on-secondary px-4 py-2 rounded-xl text-xs font-bold hover:brightness-110 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-[16px]">save</span>
              Guardar todos los cambios
            </button>
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            {liveMatches.map((match, i) => (
              <div
                key={i}
                className={`bg-surface-container p-5 rounded-2xl border border-outline-variant flex flex-col gap-4 ${!match.live ? "opacity-75 grayscale hover:grayscale-0 hover:opacity-100 transition-all" : ""}`}
              >
                <div className="flex justify-between text-xs text-on-surface-variant">
                  <span className="font-bold">{match.groupTime}</span>
                  {match.live ? (
                    <span className="flex items-center gap-1.5 text-secondary-container font-bold">
                      <span className="w-2 h-2 rounded-full bg-secondary-container pulse-live" />
                      EN VIVO
                    </span>
                  ) : (
                    <span>Empieza en 2h 45m</span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="text-4xl">{match.teamA}</div>
                    <span className="text-sm font-bold text-on-surface">{match.nameA}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={scores[i].a}
                      onChange={(e) => setScores((prev) => prev.map((s, idx) => idx === i ? { ...s, a: Number(e.target.value) } : s))}
                      disabled={!match.live}
                      className="w-16 h-16 bg-surface-bright border-2 border-outline-variant rounded-xl text-center text-2xl font-black text-on-surface focus:border-secondary-container focus:outline-none disabled:opacity-50"
                      min={0}
                    />
                    <span className="text-2xl font-black text-on-surface-variant">–</span>
                    <input
                      type="number"
                      value={scores[i].b}
                      onChange={(e) => setScores((prev) => prev.map((s, idx) => idx === i ? { ...s, b: Number(e.target.value) } : s))}
                      disabled={!match.live}
                      className="w-16 h-16 bg-surface-bright border-2 border-outline-variant rounded-xl text-center text-2xl font-black text-on-surface focus:border-secondary-container focus:outline-none disabled:opacity-50"
                      min={0}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="text-4xl">{match.teamB}</div>
                    <span className="text-sm font-bold text-on-surface">{match.nameB}</span>
                  </div>
                </div>

                <div className="flex justify-between mt-1">
                  <button className="text-xs text-secondary-container hover:underline">Ver flujo de predicciones</button>
                  <button className="text-xs text-on-surface-variant hover:text-error transition-colors">
                    {match.live ? "Anular partido" : "Ajustar cuotas"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
