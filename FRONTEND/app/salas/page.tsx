"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import {
  fetchMyRooms,
  fetchPublicRooms,
  createRoom,
  joinRoom,
  transformRoom,
  type BackendRoom,
} from "@/services/api";

type UIRoom = ReturnType<typeof transformRoom>;

export default function SalasPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [code, setCode] = useState("");
  const [roomName, setRoomName] = useState("");
  const [maxMembers, setMaxMembers] = useState(20);
  const [isPrivate, setIsPrivate] = useState(true);

  const [myRooms, setMyRooms] = useState<UIRoom[]>([]);
  const [publicRooms, setPublicRooms] = useState<BackendRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [mine, pub] = await Promise.all([
          fetchMyRooms(),
          fetchPublicRooms(),
        ]);
        setMyRooms(mine.map(transformRoom));
        setPublicRooms(pub.rooms);
      } catch {
        setMyRooms([]);
        setPublicRooms([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCreate = async () => {
    if (!roomName.trim()) return;
    setActionError("");
    setActionLoading(true);
    try {
      const room = await createRoom(roomName.trim(), maxMembers, isPrivate);
      setMyRooms((prev) => [transformRoom(room), ...prev]);
      setShowCreate(false);
      setRoomName("");
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Error al crear sala.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!code.trim()) return;
    setActionError("");
    setActionLoading(true);
    try {
      const room = await joinRoom(code.trim().toUpperCase());
      setMyRooms((prev) => {
        const already = prev.some((r) => r.id === room.id);
        return already ? prev : [transformRoom(room), ...prev];
      });
      setShowJoin(false);
      setCode("");
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Código inválido o sala no encontrada.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-4 lg:p-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-on-surface">Salas Privadas</h2>
            <p className="text-on-surface-variant text-sm mt-1">Compite con tus amigos en un ranking exclusivo.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setActionError(""); setShowJoin(true); }}
              className="flex items-center gap-2 border border-outline text-on-surface text-sm font-semibold px-4 py-2 rounded-xl hover:bg-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              Unirse con código
            </button>
            <button
              onClick={() => { setActionError(""); setShowCreate(true); }}
              className="flex items-center gap-2 bg-secondary-container text-on-secondary text-sm font-bold px-4 py-2 rounded-xl hover:brightness-110 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Crear sala
            </button>
          </div>
        </div>

        {/* My Rooms */}
        <section className="mb-8">
          <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4">Mis Salas</h3>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-surface-container rounded-2xl p-6 h-44 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {myRooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-surface-container rounded-2xl p-6 border border-outline-variant hover:border-secondary-container transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-on-surface text-sm">{room.name}</h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">Creada por {room.creator}</p>
                    </div>
                    {room.rank && (
                      <div className="bg-secondary-container/10 border border-secondary-container/20 px-2 py-0.5 rounded-full text-xs text-secondary-container font-bold">
                        #{room.rank}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                        <span>Miembros</span>
                        <span>{room.members}/{room.maxMembers}</span>
                      </div>
                      <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-secondary-container h-full rounded-full"
                          style={{ width: `${(room.members / room.maxMembers) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-on-surface">{room.pts}</div>
                      <div className="text-xs text-on-surface-variant">pts</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px] text-on-surface-variant">key</span>
                      <code className="text-xs font-mono text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
                        {room.code}
                      </code>
                    </div>
                    <Link href={`/salas/${room.id}`} className="text-secondary-container text-xs font-semibold hover:underline">Ver sala →</Link>
                  </div>
                </div>
              ))}

              {/* Create Room Card */}
              <button
                onClick={() => { setActionError(""); setShowCreate(true); }}
                className="bg-surface-container rounded-2xl p-6 border-2 border-dashed border-outline-variant hover:border-secondary-container transition-all group flex flex-col items-center justify-center gap-3 min-h-[180px]"
              >
                <div className="w-12 h-12 rounded-full bg-secondary-container/10 flex items-center justify-center group-hover:bg-secondary-container/20 transition-colors">
                  <span className="material-symbols-outlined text-secondary-container text-2xl">add</span>
                </div>
                <p className="text-sm font-semibold text-on-surface-variant group-hover:text-on-surface transition-colors">
                  Crear nueva sala
                </p>
              </button>
            </div>
          )}
        </section>

        {/* Public Rooms */}
        <section>
          <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4">Salas Públicas</h3>
          <div className="bg-surface-container rounded-2xl border border-outline-variant overflow-hidden">
            {publicRooms.length === 0 && !loading && (
              <p className="p-6 text-xs text-on-surface-variant text-center">No hay salas públicas disponibles.</p>
            )}
            {publicRooms.map((room, i) => (
              <div
                key={room.id}
                className={`flex items-center justify-between p-4 hover:bg-surface-container-high transition-colors ${
                  i < publicRooms.length - 1 ? "border-b border-outline-variant/30" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary-container text-[20px]">public</span>
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface text-sm">{room.name}</p>
                    <p className="text-xs text-on-surface-variant">{room._count.members.toLocaleString()} miembros</p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    setActionLoading(true);
                    try {
                      await joinRoom(room.code);
                      const mine = await fetchMyRooms();
                      setMyRooms(mine.map(transformRoom));
                    } catch {
                      // already member or full
                    } finally {
                      setActionLoading(false);
                    }
                  }}
                  className="text-secondary-container text-xs font-semibold border border-secondary-container/30 px-3 py-1.5 rounded-lg hover:bg-secondary-container/10 transition-colors"
                >
                  Unirse
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-surface-container-low rounded-3xl p-8 w-full max-w-md border border-outline-variant shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-on-surface">Crear Nueva Sala</h3>
                <button onClick={() => setShowCreate(false)} className="material-symbols-outlined text-on-surface-variant hover:text-on-surface">close</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase block mb-2">Nombre de la sala</label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Ej: Los Cracks del Barrio"
                    className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-secondary-container transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase block mb-2">Máx. de miembros</label>
                  <select
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(Number(e.target.value))}
                    className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-secondary-container transition-colors"
                  >
                    {[10, 20, 50, 100].map((n) => (
                      <option key={n} value={n}>{n} miembros</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3 p-3 bg-surface-container rounded-xl border border-outline-variant">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="accent-secondary-container w-4 h-4"
                  />
                  <span className="text-sm text-on-surface">Sala privada (requiere código)</span>
                </div>
                {actionError && (
                  <p className="text-xs text-error bg-error/10 border border-error/20 rounded-xl px-4 py-2">{actionError}</p>
                )}
                <button
                  onClick={handleCreate}
                  disabled={actionLoading || !roomName.trim()}
                  className="w-full bg-secondary-container text-on-secondary font-bold py-3 rounded-xl text-sm hover:brightness-110 transition-all disabled:opacity-60"
                >
                  {actionLoading ? "Creando..." : "Crear Sala"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Join Modal */}
        {showJoin && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-surface-container-low rounded-3xl p-8 w-full max-w-sm border border-outline-variant shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-on-surface">Unirse a Sala</h3>
                <button onClick={() => setShowJoin(false)} className="material-symbols-outlined text-on-surface-variant hover:text-on-surface">close</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase block mb-2">Código de sala</label>
                  <input
                    type="text"
                    placeholder="Ej: CRACK42"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-secondary-container transition-colors font-mono tracking-widest text-center uppercase"
                  />
                </div>
                {actionError && (
                  <p className="text-xs text-error bg-error/10 border border-error/20 rounded-xl px-4 py-2">{actionError}</p>
                )}
                <button
                  onClick={handleJoin}
                  disabled={actionLoading || code.length < 4}
                  className="w-full bg-secondary-container text-on-secondary font-bold py-3 rounded-xl text-sm hover:brightness-110 transition-all disabled:opacity-60"
                >
                  {actionLoading ? "Uniéndose..." : "Unirse"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
