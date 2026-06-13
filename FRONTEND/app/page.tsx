import Link from "next/link";
import { api } from "@/services/api";

export default function HomePage() {
  const topPlayers = api.getHomeTopPlayers();
  const features = api.getHomeFeatures();

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-surface-container shadow-md">
        <div className="flex items-center gap-4">
          <span className="text-lg font-black text-secondary-container">Mundial Predictor</span>
          <div className="hidden md:flex gap-6 ml-6">
            <Link href="/partidos" className="text-on-surface-variant hover:text-on-surface text-sm transition-colors">Partidos</Link>
            <Link href="/salas" className="text-on-surface-variant hover:text-on-surface text-sm transition-colors">Salas</Link>
            <Link href="/ranking" className="text-on-surface-variant hover:text-on-surface text-sm transition-colors">Ranking</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth" className="text-on-surface-variant hover:text-on-surface text-sm transition-colors hidden md:block">
            Iniciar Sesión
          </Link>
          <Link href="/auth" className="bg-secondary-container text-on-secondary text-sm font-bold px-4 py-2 rounded-lg hover:brightness-110 transition-all">
            Registrarse
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden hero-gradient px-4 pt-16">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center py-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-secondary-container/10 border border-secondary-container/30 rounded-full px-4 py-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary-container"></span>
              </span>
              <span className="text-xs font-bold text-secondary-container tracking-wider uppercase">World Cup 2026 Live Predictor</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-on-surface leading-tight">
              Predice los resultados del{" "}
              <span className="text-secondary-container">Mundial</span> y compite con tus amigos
            </h1>

            <p className="text-on-surface-variant text-base max-w-xl leading-relaxed">
              Únete a la mayor comunidad de analistas deportivos. Crea salas privadas, sube en el ranking global y demuestra que eres el que más sabe de fútbol.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/auth" className="bg-secondary-container text-on-secondary px-8 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg text-center">
                Registrarse Ahora
              </Link>
              <Link href="/auth" className="border border-outline text-on-surface px-8 py-3 rounded-xl font-bold hover:bg-surface-variant transition-all text-center">
                Iniciar Sesión
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-4 border-t border-outline-variant/30">
              <div className="flex -space-x-3">
                {["🇦🇷", "🇧🇷", "🇫🇷"].map((flag, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-surface-container-high border-2 border-background flex items-center justify-center text-sm">
                    {flag}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-background bg-surface-bright flex items-center justify-center text-xs font-bold">+10k</div>
              </div>
              <div>
                <div className="font-bold text-on-surface text-lg">12,450+</div>
                <div className="text-xs text-on-surface-variant">Usuarios activos hoy</div>
              </div>
            </div>
          </div>

          {/* Leaderboard Card */}
          <div className="lg:col-span-5">
            <div className="glass-card rounded-3xl p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-on-surface text-lg">Ranking Global</h3>
                <span className="material-symbols-outlined text-secondary-container">military_tech</span>
              </div>
              <div className="space-y-4">
                {topPlayers.map((player) => (
                  <div
                    key={player.rank}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-transform hover:scale-[1.02] ${
                      player.rank === 1 ? "bg-primary-container/40 border border-secondary-container/20" : "bg-surface-container"
                    }`}
                  >
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full bg-surface-container-high border-2 ${player.color} flex items-center justify-center text-xl`}>
                        {player.emoji}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 ${player.badgeColor} rounded-full p-0.5`}>
                        <span className="material-symbols-outlined text-[12px] text-black">workspace_premium</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-on-surface text-sm">{player.name}</div>
                      <div className="text-xs text-on-surface-variant">{player.pts} pts â€¢ {player.acc} Acc.</div>
                    </div>
                    <div className="text-secondary-container font-black text-lg">#{player.rank}</div>
                  </div>
                ))}
              </div>
              <Link href="/ranking" className="mt-4 block text-center text-secondary-container text-sm font-semibold hover:underline pt-4 border-t border-outline-variant/30">
                Ver ranking completo →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-6 bg-surface-container-low border-y border-outline-variant/30">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-around items-center gap-6 px-4">
          {[
            { value: "12,450+", label: "Usuarios activos" },
            { value: "98,200+", label: "Predicciones realizadas" },
            { value: "3,100+", label: "Salas privadas activas" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-black text-secondary-container">{s.value}</div>
              <div className="text-xs text-on-surface-variant mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-on-surface mb-4">Todo lo que necesitas para predecir</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto text-sm">Una plataforma completa con todas las herramientas para convertirte en el mejor predictor del Mundial.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-surface-container rounded-2xl p-6 border border-outline-variant hover:border-secondary-container transition-colors group">
                <div className="w-12 h-12 bg-secondary-container/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-secondary-container/20 transition-colors">
                  <span className="material-symbols-outlined text-secondary-container text-2xl">{f.icon}</span>
                </div>
                <h3 className="font-bold text-on-surface text-base mb-2">{f.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-surface-container-low">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 bg-secondary-container rounded-2xl flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-on-secondary text-3xl">sports_soccer</span>
          </div>
          <h2 className="text-3xl font-black text-on-surface">¿Listo para competir?</h2>
          <p className="text-on-surface-variant text-sm">Crea tu cuenta gratis y empieza a predecir hoy mismo. El Mundial 2026 te espera.</p>
          <Link href="/auth" className="inline-block bg-secondary-container text-on-secondary font-bold px-8 py-3 rounded-xl hover:scale-105 transition-transform shadow-lg">
            Crear cuenta gratis
          </Link>
        </div>
      </section>

      <footer className="py-6 px-4 bg-surface-container-lowest border-t border-outline-variant/30 text-center text-on-surface-variant text-xs">
        © 2026 Mundial Predictor · Hecho para el Mundial FIFA 2026
      </footer>
    </div>
  );
}
