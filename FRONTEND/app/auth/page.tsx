"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Register fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [regError, setRegError] = useState("");

  const { login, register, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);
    const ok = await login(loginEmail, loginPassword);
    setLoading(false);
    if (ok) {
      router.push("/dashboard");
    } else {
      setLoginError("Correo o contraseña incorrectos.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !regEmail || !username || !regPassword || !terms) return;
    setRegError("");
    setLoading(true);
    const result = await register(firstName, lastName, regEmail, username, regPassword);
    setLoading(false);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setRegError(result.error ?? "Error al registrarse.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      {/* Left: Branding */}
      <section className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-10 overflow-hidden bg-primary-container">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=1200&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-container/90 via-primary-container/60 to-surface-container-lowest/80" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary-container text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
            <h1 className="text-2xl font-black text-on-surface">Mundial Predictor</h1>
          </div>
          <div className="mt-8">
            <div className="inline-flex items-center px-4 py-1 rounded-full bg-secondary-container/20 border border-secondary-container/30 text-secondary-container text-xs font-bold mb-4">
              <span className="w-2 h-2 rounded-full bg-secondary-container mr-2 pulse-live" />
              ESTADÍSTICAS EN VIVO
            </div>
            <h2 className="text-4xl font-black max-w-md text-on-surface">Predice la fase global.</h2>
            <p className="mt-4 text-on-surface-variant max-w-sm text-sm leading-relaxed">
              Únete al círculo de los mejores analistas de fútbol. Predice cada gol, cada sorpresa y sube en el ranking global.
            </p>
          </div>
        </div>

        <div className="relative z-10 glass-panel p-6 rounded-xl max-w-xs">
          <div className="flex -space-x-3 mb-4">
            {["🇦🇷", "🇧🇷", "🇫🇷", "🇪🇸"].map((f, i) => (
              <div key={i} className="w-10 h-10 rounded-full bg-surface-container border-2 border-primary-container flex items-center justify-center text-sm">{f}</div>
            ))}
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-xs font-bold text-on-secondary">+2k</div>
          </div>
          <p className="text-sm text-on-surface">&quot;El predictor más intuitivo que he usado. Los datos en vivo son incomparables.&quot;</p>
          <div className="flex gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="material-symbols-outlined text-secondary-container text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            ))}
          </div>
        </div>
      </section>

      {/* Right: Forms */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-surface-container-lowest lg:bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <span className="material-symbols-outlined text-secondary-container text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
            <h1 className="text-xl font-black text-on-surface">Mundial Predictor</h1>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-surface-container rounded-xl p-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === "login" ? "bg-secondary-container text-on-secondary shadow-lg" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === "register" ? "bg-secondary-container text-on-secondary shadow-lg" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Registrarse
            </button>
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-on-surface">Bienvenido de vuelta</h3>
                <p className="text-on-surface-variant text-sm mt-1">Ingresa tus credenciales para continuar.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase block mb-2">Correo electrónico</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    required
                    className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-secondary-container transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase block mb-2">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-secondary-container transition-colors pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[20px]"
                    >
                      {showPassword ? "visibility_off" : "visibility"}
                    </button>
                  </div>
                </div>
                {loginError && (
                  <div className="flex items-center gap-2 text-error text-xs bg-error/10 border border-error/20 rounded-xl px-4 py-2">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    {loginError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-secondary-container text-on-secondary font-bold py-3 rounded-xl text-center hover:brightness-110 active:scale-[0.98] transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-on-surface">Crea tu cuenta</h3>
                <p className="text-on-surface-variant text-sm mt-1">Únete a más de 12,000 predictores activos.</p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase block mb-2">Nombre *</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Nombre"
                      required
                      className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-secondary-container transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase block mb-2">Apellido</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Apellido"
                      className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-secondary-container transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase block mb-2">Usuario *</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="solo letras, números y _"
                    required
                    className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-secondary-container transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase block mb-2">Correo electrónico *</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    required
                    className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-secondary-container transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase block mb-2">Contraseña * (mín. 8 caracteres)</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-secondary-container transition-colors"
                  />
                </div>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={terms}
                    onChange={(e) => setTerms(e.target.checked)}
                    className="mt-1 accent-secondary-container"
                    required
                  />
                  <p className="text-xs text-on-surface-variant">
                    Acepto los <span className="text-secondary-container cursor-pointer hover:underline">Términos de Servicio</span> y la{" "}
                    <span className="text-secondary-container cursor-pointer hover:underline">Política de Privacidad</span>
                  </p>
                </div>
                {regError && (
                  <div className="flex items-center gap-2 text-error text-xs bg-error/10 border border-error/20 rounded-xl px-4 py-2">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    {regError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-secondary-container text-on-secondary font-bold py-3 rounded-xl text-center hover:brightness-110 active:scale-[0.98] transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Creando cuenta..." : "Crear Cuenta"}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-xs text-on-surface-variant">
            <a href="/" className="hover:text-secondary-container transition-colors">← Volver al inicio</a>
          </p>
        </div>
      </section>
    </div>
  );
}
