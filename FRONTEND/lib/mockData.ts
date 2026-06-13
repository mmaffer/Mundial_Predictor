export type UserRole = "admin" | "user";

export interface User {
  name: string;
  email: string;
  username: string;
  role: UserRole;
}

export type MatchStatus = "live" | "upcoming" | "finished";

export const homeTopPlayers = [
  { rank: 1, name: "Marco Polo", pts: 2450, acc: "92%", emoji: "🇦🇷", color: "border-yellow-400", badgeColor: "bg-yellow-500" },
  { rank: 2, name: "Sofia Chen", pts: 2310, acc: "88%", emoji: "🇧🇷", color: "border-slate-400", badgeColor: "bg-slate-400" },
  { rank: 3, name: "Luca Ferrari", pts: 2180, acc: "85%", emoji: "🇫🇷", color: "border-amber-600", badgeColor: "bg-amber-700" },
];

export const homeFeatures = [
  { icon: "sports_soccer", title: "Predicciones en tiempo real", desc: "Analiza cada partido del Mundial y predice resultados antes de que empiece." },
  { icon: "groups", title: "Salas privadas", desc: "Crea grupos con amigos o compañeros y compite en tu propio ranking exclusivo." },
  { icon: "military_tech", title: "Ranking global", desc: "Sube posiciones en el ranking mundial y demuestra que eres el mejor analista." },
  { icon: "leaderboard", title: "Estadísticas avanzadas", desc: "Accede a datos históricos, rachas de aciertos y análisis detallados." },
];

export const adminUsers = [
  { name: "Marco Verratti", email: "marco@fifa.com", joined: "Oct 12, 2024", pts: "12,450", status: "active" },
  { name: "Lionel Messi", email: "goat@arg.com", joined: "Sep 28, 2024", pts: "25,890", status: "active" },
  { name: "Cristiano R.", email: "cr7@siuu.com", joined: "Oct 01, 2024", pts: "18,200", status: "banned" },
];

export const scoringRules = [
  { label: "Marcador exacto", pts: "+5 pts", desc: "Predicción del resultado final exacto." },
  { label: "Ganador correcto", pts: "+3 pts", desc: "Ganador correcto pero marcador incorrecto." },
  { label: "Diferencia de goles", pts: "+2 pts", desc: "Bonus por diferencia de goles correcta." },
  { label: "Bonus por racha (×3)", pts: "+2 pts", desc: "Por cada 3 aciertos consecutivos al ganador." },
  { label: "Predicción anticipada", pts: "+1 pto", desc: "Si se registra con más de 24h de anticipación." },
];

export const adminLiveMatches = [
  { groupTime: "Grupo A · 72' Jugado", teamA: "🇧🇷", nameA: "Brasil", teamB: "🇩🇪", nameB: "Alemania", scoreA: 2, scoreB: 1, live: true },
  { groupTime: "Grupo B · Programado", teamA: "🇪🇸", nameA: "España", teamB: "🇫🇷", nameB: "Francia", scoreA: 0, scoreB: 0, live: false },
];

export const platformStats = [
  { icon: "group", label: "Usuarios registrados", value: "1,284,092", badge: "+12% semana", color: "text-secondary-container" },
  { icon: "sports_soccer", label: "Partidos activos", value: "12", badge: "EN VIVO", live: true, color: "text-secondary-container" },
  { icon: "meeting_room", label: "Salas privadas", value: "45,201", badge: "+84 hoy", color: "text-secondary-container" },
  { icon: "query_stats", label: "Predicciones hoy", value: "45,000+", badge: "99.9% uptime", color: "text-secondary-container" },
];

export const recentEvents = [
  { icon: "person_add", text: "Nuevo usuario registrado: julianmartinez@gmail.com", time: "Hace 2 min", color: "text-green-400" },
  { icon: "sports_soccer", text: "Marcador actualizado: Brasil 2 – 1 Alemania (72')", time: "Hace 5 min", color: "text-secondary-container" },
  { icon: "group_add", text: "Nueva sala creada: 'Oficina Copa 2026' (12 miembros)", time: "Hace 11 min", color: "text-primary" },
  { icon: "block", text: "Usuario suspendido: cr7@siuu.com por comportamiento indebido", time: "Hace 23 min", color: "text-error" },
  { icon: "sports_soccer", text: "Partido finalizado: España 7 – 0 Costa Rica", time: "Hace 1 hora", color: "text-on-surface-variant" },
];

export const quickActions = [
  { href: "/admin", icon: "manage_accounts", label: "Gestionar usuarios" },
  { href: "/partidos", icon: "sports_soccer", label: "Ver partidos" },
  { href: "/admin", icon: "rule", label: "Reglas de puntuación" },
  { href: "/salas", icon: "meeting_room", label: "Supervisar salas" },
];

export const upcomingMatches = [
  { teamA: "🇦🇷", nameA: "Argentina", teamB: "🇲🇽", nameB: "México", time: "Hoy 18:00", group: "Grupo C" },
  { teamA: "🇧🇷", nameA: "Brasil", teamB: "🇨🇭", nameB: "Suiza", time: "Hoy 21:00", group: "Grupo G" },
  { teamA: "🇫🇷", nameA: "Francia", teamB: "🇦🇺", nameB: "Australia", time: "Mañana 15:00", group: "Grupo D" },
];

export const recentPredictions = [
  { teamA: "🇪🇸", nameA: "España", scoreA: 2, teamB: "🇩🇪", nameB: "Alemania", scoreB: 1, predA: 2, predB: 1, result: "correct", pts: 5 },
  { teamA: "🇵🇹", nameA: "Portugal", scoreA: 3, teamB: "🇬🇭", nameB: "Ghana", scoreB: 2, predA: 2, predB: 1, result: "partial", pts: 3 },
  { teamA: "🏴", nameA: "Inglaterra", scoreA: 0, teamB: "🇺🇸", nameB: "USA", scoreB: 0, predA: 1, predB: 0, result: "wrong", pts: 0 },
];

export const matches = [
  { id: 1, teamA: "🇦🇷", nameA: "Argentina", teamB: "🇲🇽", nameB: "México", scoreA: 2, scoreB: 0, time: "72'", group: "Grupo C", status: "live" as MatchStatus, predicted: false },
  { id: 2, teamA: "🇧🇷", nameA: "Brasil", teamB: "🇨🇭", nameB: "Suiza", scoreA: null, scoreB: null, time: "Hoy 21:00", group: "Grupo G", status: "upcoming" as MatchStatus, predicted: false },
  { id: 3, teamA: "🇫🇷", nameA: "Francia", teamB: "🇦🇺", nameB: "Australia", scoreA: null, scoreB: null, time: "Mañana 15:00", group: "Grupo D", status: "upcoming" as MatchStatus, predicted: true },
  { id: 4, teamA: "🇩🇪", nameA: "Alemania", teamB: "🇯🇵", nameB: "Japón", scoreA: null, scoreB: null, time: "Mañana 18:00", group: "Grupo E", status: "upcoming" as MatchStatus, predicted: false },
  { id: 5, teamA: "🇪🇸", nameA: "España", teamB: "🇨🇷", nameB: "Costa Rica", scoreA: 7, scoreB: 0, time: "Finalizado", group: "Grupo E", status: "finished" as MatchStatus, predicted: true },
  { id: 6, teamA: "🇵🇹", nameA: "Portugal", teamB: "🇬🇭", nameB: "Ghana", scoreA: 3, scoreB: 2, time: "Finalizado", group: "Grupo H", status: "finished" as MatchStatus, predicted: true },
  { id: 7, teamA: "🇺🇾", nameA: "Uruguay", teamB: "🇰🇷", nameB: "Corea del Sur", scoreA: null, scoreB: null, time: "Mañana 21:00", group: "Grupo H", status: "upcoming" as MatchStatus, predicted: false },
  { id: 8, teamA: "🇧🇪", nameA: "Bélgica", teamB: "🇨🇦", nameB: "Canadá", scoreA: null, scoreB: null, time: "En 2 días", group: "Grupo F", status: "upcoming" as MatchStatus, predicted: false },
  { id: 9, teamA: "🇲🇦", nameA: "Marruecos", teamB: "🇭🇷", nameB: "Croacia", scoreA: 0, scoreB: 0, time: "Finalizado", group: "Grupo F", status: "finished" as MatchStatus, predicted: false },
];

export const privateRooms = [
  { id: 1, name: "Los Cracks del Barrio", members: 8, maxMembers: 10, rank: 2, pts: 1840, creator: "Carlos M.", code: "CRACK42", private: true },
  { id: 2, name: "FIFA Enthusiasts", members: 24, maxMembers: 50, rank: 5, pts: 1620, creator: "Sofia R.", code: "FIFA26", private: true },
  { id: 3, name: "Oficina FC", members: 6, maxMembers: 20, rank: 1, pts: 2100, creator: "Tú", code: "OFC2026", private: true },
];

export const publicRooms = [
  { id: 4, name: "Sala Latinoamérica", members: 1240, maxMembers: 5000, pts: null },
  { id: 5, name: "Mundial Oficial 2026", members: 8500, maxMembers: 50000, pts: null },
  { id: 6, name: "Predicción Europa", members: 3200, maxMembers: 10000, pts: null },
];

export const rankingTopThree = [
  { rank: 1, name: "Marco Polo", country: "🇮🇹", pts: 342, acc: "92%", badge: "🥇", color: "border-yellow-400 bg-yellow-500/10" },
  { rank: 2, name: "Sofia Chen", country: "🇨🇳", pts: 318, acc: "88%", badge: "🥈", color: "border-slate-400 bg-slate-400/10" },
  { rank: 3, name: "Luca Ferrari", country: "🇮🇹", pts: 295, acc: "85%", badge: "🥉", color: "border-amber-600 bg-amber-600/10" },
];

export const leaderboard = [
  { rank: 4, name: "Ana García", country: "🇲🇽", pts: 274, acc: "83%", trend: "up" },
  { rank: 5, name: "Paulo Silva", country: "🇧🇷", pts: 261, acc: "81%", trend: "down" },
  { rank: 6, name: "James Wilson", country: "🇬🇧", pts: 248, acc: "79%", trend: "up" },
  { rank: 7, name: "Yuki Tanaka", country: "🇯🇵", pts: 237, acc: "78%", trend: "same" },
  { rank: 8, name: "Maria Santos", country: "🇵🇹", pts: 229, acc: "76%", trend: "up" },
  { rank: 9, name: "Alex Müller", country: "🇩🇪", pts: 218, acc: "75%", trend: "down" },
  { rank: 10, name: "Carlos Rojas", country: "🇦🇷", pts: 210, acc: "74%", trend: "up" },
  { rank: 1482, name: "Alex Rivera (Tú)", country: "🇵🇪", pts: 166, acc: "62%", trend: "up", isMe: true },
];

export const statsKpis = [
  { label: "PUNTOS TOTALES", value: "2,480", sub: "+12% vs semana pasada", subColor: "text-green-400", icon: "trending_up" },
  { label: "PRECISIÓN", value: "68.4%", sub: "+5.2%", subColor: "text-green-400", icon: "target" },
  { label: "RANKING", value: "#412", sub: "Top 2% de usuarios", subColor: "text-on-surface-variant", icon: "military_tech" },
  { label: "MARCADORES EXACTOS", value: "14", sub: "Insignia Predictor Dorado", subColor: "text-secondary-container", icon: "workspace_premium" },
];

export const bestPredictedTeams = [
  { flag: "🇧🇷", name: "Brasil", pts: 420, pct: 95 },
  { flag: "🇫🇷", name: "Francia", pts: 385, pct: 82 },
  { flag: "🇦🇷", name: "Argentina", pts: 310, pct: 68 },
  { flag: "🇯🇵", name: "Japón", pts: 290, pct: 62 },
];

export const friendsComparison = [
  { name: "Marco Rossi", rank: "#1,204", diff: "+140 pts adelante", ahead: true },
  { name: "Sarah Jenkins", rank: "#288", diff: "-45 pts detrás", ahead: false },
  { name: "Leo Messi Jr.", rank: "#12,400", diff: "+890 pts adelante", ahead: true },
];

export const adminProfileStats = [
  { label: "Usuarios gestionados", value: "1.28M", icon: "group" },
  { label: "Partidos supervisados", value: "64", icon: "sports_soccer" },
  { label: "Salas moderadas", value: "45,201", icon: "meeting_room" },
];

export const adminSettings = [
  { icon: "manage_accounts", label: "Gestión de usuarios", desc: "Administrar, suspender y editar cuentas", href: "/admin" },
  { icon: "sports_soccer", label: "Gestión de partidos", desc: "Actualizar marcadores y estados", href: "/partidos" },
  { icon: "rule", label: "Reglas del sistema", desc: "Configurar puntuación y reglas", href: "/admin" },
  { icon: "bar_chart", label: "Informes de plataforma", desc: "Estadísticas globales del sistema", href: "/estadisticas" },
];

export const userBadges = [
  { icon: "workspace_premium", label: "Top 10%", color: "text-yellow-400 bg-yellow-400/10" },
  { icon: "local_fire_department", label: "Racha x3", color: "text-orange-400 bg-orange-400/10" },
  { icon: "military_tech", label: "Campeón", color: "text-primary bg-primary/10" },
];

export const profileRecentActivity = [
  { type: "correct", match: "España 2 - 1 Alemania", pred: "2-1", pts: 5, date: "Hace 2 días" },
  { type: "partial", match: "Portugal 3 - 2 Ghana", pred: "2-1", pts: 3, date: "Hace 3 días" },
  { type: "wrong", match: "Suiza 1 - 0 Camerún", pred: "0-0", pts: 0, date: "Hace 4 días" },
  { type: "correct", match: "Brasil 2 - 0 Serbia", pred: "2-0", pts: 6, date: "Hace 5 días" },
];
