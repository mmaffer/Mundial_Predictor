"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchRoomById,
  fetchRoomMembers,
  type BackendRoom,
  type BackendRoomMember,
} from "@/services/api";

export default function SalaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [room, setRoom] = useState<BackendRoom | null>(null);
  const [members, setMembers] = useState<BackendRoomMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const [r, m] = await Promise.all([
          fetchRoomById(id),
          fetchRoomMembers(id),
        ]);
        setRoom(r);
        setMembers(m.members);
      } catch {
        router.replace("/salas");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  const copyCode = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-secondary-container border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!room) return null;

  const badges = ["🥇", "🥈", "🥉"];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-4 lg:p-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-6">
          <Link href="/salas" className="hover:text-secondary-container transition-colors">Salas</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface">{room.name}</span>
        </div>

        {/* Room Header */}
        <div className="bg-surface-container-high rounded-3xl p-6 lg:p-8 border border-outline-variant mb-6 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-secondary-container/5 blur-[80px] rounded-full pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-secondary-container/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary-container text-2xl">
                    {room.isPrivate ? "lock" : "public"}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-black text-on-surface">{room.name}</h2>
                  <p className="text-xs text-on-surface-variant">
                    Creada por @{room.createdBy.username} · {room._count.members} / {room.maxMembers} miembros
                  </p>
                </div>
              </div>
            </div>

            {/* Code badge */}
            <button
              onClick={copyCode}
              className="flex items-center gap-3 bg-surface-container rounded-2xl border border-secondary-container/30 px-5 py-3 hover:border-secondary-container transition-all group"
            >
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">Código de sala</p>
                <code className="text-xl font-black text-secondary-container tracking-widest">{room.code}</code>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary-container transition-colors">
                {copied ? "check" : "content_copy"}
              </span>
            </button>
          </div>
        </div>

        {/* Members Ranking */}
        <div className="bg-surface-container rounded-2xl border border-outline-variant overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-high flex items-center justify-between">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest">Ranking de la Sala</h3>
            <span className="text-xs text-on-surface-variant">{members.length} participantes</span>
          </div>

          {members.length === 0 ? (
            <div className="p-10 text-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-3">group</span>
              <p className="text-sm text-on-surface-variant">Aún no hay miembros con puntos.</p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-12 gap-2 px-6 py-3 bg-surface-container-high text-xs font-bold text-on-surface-variant uppercase border-b border-outline-variant">
                <div className="col-span-1">#</div>
                <div className="col-span-7">Predictor</div>
                <div className="col-span-4 text-right">Puntos sala</div>
              </div>

              {members.map((m, i) => {
                const isMe = user?.id === m.user.id;
                const rank = m.roomRank ?? i + 1;
                return (
                  <div
                    key={m.user.id}
                    className={`grid grid-cols-12 gap-2 px-6 py-4 items-center transition-colors ${
                      isMe
                        ? "bg-secondary-container/10 border-y border-secondary-container/20"
                        : "hover:bg-surface-container-high"
                    } ${i < members.length - 1 && !isMe ? "border-b border-outline-variant/30" : ""}`}
                  >
                    <div className="col-span-1 text-sm font-black text-on-surface-variant">
                      {rank <= 3 ? badges[rank - 1] : rank}
                    </div>
                    <div className="col-span-7 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-base font-bold text-on-surface-variant">
                        {m.user.firstName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${isMe ? "text-secondary-container" : "text-on-surface"}`}>
                          {m.user.firstName}{isMe ? " (Tú)" : ""}
                        </p>
                        <p className="text-xs text-on-surface-variant">@{m.user.username}</p>
                      </div>
                    </div>
                    <div className="col-span-4 text-right">
                      <span className="text-sm font-black text-on-surface">{m.roomPoints}</span>
                      <span className="text-xs text-on-surface-variant ml-1">pts</span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        <p className="text-center text-xs text-on-surface-variant mt-4">
          Comparte el código <span className="text-secondary-container font-bold">{room.code}</span> para invitar amigos
        </p>
      </div>
    </DashboardLayout>
  );
}
