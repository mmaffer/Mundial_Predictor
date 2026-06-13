import { apiClient } from '@/lib/apiClient';
import {
  homeTopPlayers,
  homeFeatures,
  adminUsers,
  scoringRules,
  adminLiveMatches,
  platformStats,
  recentEvents,
  quickActions,
  upcomingMatches,
  recentPredictions,
  matches,
  privateRooms,
  publicRooms,
  rankingTopThree,
  leaderboard,
  statsKpis,
  bestPredictedTeams,
  friendsComparison,
  adminProfileStats,
  adminSettings,
  userBadges,
  profileRecentActivity,
} from '@/lib/mockData';

// ─── Backend types ────────────────────────────────────────────────────────────

export interface BackendTeam {
  id: string;
  name: string;
  shortName: string;
  flagEmoji: string;
  groupName: string;
}

export interface BackendMatch {
  id: string;
  homeTeam: BackendTeam;
  awayTeam: BackendTeam;
  stadium: { name: string; city: string; country: string };
  scheduledAt: string;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'CANCELLED';
  homeScore: number | null;
  awayScore: number | null;
  phase: string;
  groupName: string | null;
  matchday: number | null;
}

export interface BackendPrediction {
  id: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  status: 'PENDING' | 'SCORED';
  pointsTotal: number;
  earlyBonus: boolean;
}

export interface BackendRoom {
  id: string;
  name: string;
  code: string;
  isPrivate: boolean;
  maxMembers: number;
  createdBy: { id: string; username: string; firstName: string };
  _count: { members: number };
  members?: { roomPoints: number; roomRank: number | null; joinedAt: string }[];
}

export interface BackendRankingEntry {
  id: string;
  username: string;
  firstName: string;
  lastName?: string;
  country: string | null;
  totalPoints: number;
  streak: number;
  rank: number;
}

export interface UserStats {
  kpis: {
    totalPoints: number;
    totalPredictions: number;
    exactScores: number;
    correctWinners: number;
    accuracyPercent: number;
    currentStreak: number;
    maxStreak: number;
    globalRank: number | null;
  };
  bestPredictedTeams: {
    name: string;
    flag: string;
    correct: number;
    total: number;
    accuracy: number;
  }[];
  recentActivity: { id: string; createdAt: string; pointsAwarded: number }[];
}

// ─── Transformers ─────────────────────────────────────────────────────────────

function formatMatchTime(match: BackendMatch): string {
  if (match.status === 'LIVE') return 'EN VIVO';
  if (match.status === 'FINISHED') return 'Finalizado';
  if (match.status === 'CANCELLED') return 'Cancelado';
  const d = new Date(match.scheduledAt);
  const now = new Date();
  const diffH = (d.getTime() - now.getTime()) / 3600000;
  const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  if (diffH < 0) return d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  if (diffH < 24) return `Hoy ${time}`;
  if (diffH < 48) return `Mañana ${time}`;
  return d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) + ` ${time}`;
}

export function transformMatch(
  m: BackendMatch,
  predictedIds: Set<string> = new Set(),
) {
  const status =
    m.status === 'LIVE'
      ? 'live'
      : m.status === 'FINISHED'
        ? 'finished'
        : ('upcoming' as 'live' | 'upcoming' | 'finished');

  return {
    id: m.id,
    teamA: m.homeTeam.flagEmoji,
    nameA: m.homeTeam.name,
    teamB: m.awayTeam.flagEmoji,
    nameB: m.awayTeam.name,
    scoreA: m.homeScore,
    scoreB: m.awayScore,
    time: formatMatchTime(m),
    group: m.groupName ? `Grupo ${m.groupName}` : m.phase,
    status,
    predicted: predictedIds.has(m.id),
    homeTeamId: m.homeTeam.id,
    awayTeamId: m.awayTeam.id,
    scheduledAt: m.scheduledAt,
    stadium: m.stadium,
  };
}

export function transformRoom(r: BackendRoom) {
  return {
    id: r.id,
    name: r.name,
    code: r.code,
    members: r._count.members,
    maxMembers: r.maxMembers,
    pts: r.members?.[0]?.roomPoints ?? 0,
    rank: r.members?.[0]?.roomRank ?? null,
    creator: r.createdBy.username,
    private: r.isPrivate,
  };
}

// ─── Real async API functions ─────────────────────────────────────────────────

export async function fetchMatches(status?: string) {
  const q = status ? `?status=${status.toUpperCase()}` : '';
  return apiClient.get<BackendMatch[]>(`/matches${q}`);
}

export async function fetchUpcomingMatches(limit = 3) {
  return apiClient.get<BackendMatch[]>(`/matches/upcoming?limit=${limit}`);
}

export async function fetchMatchById(id: string) {
  return apiClient.get<BackendMatch>(`/matches/${id}`);
}

export async function fetchMyPredictions() {
  return apiClient.get<BackendPrediction[]>('/predictions');
}

export async function submitPrediction(matchId: string, homeScore: number, awayScore: number) {
  return apiClient.post<BackendPrediction>('/predictions', { matchId, homeScore, awayScore });
}

export async function updatePrediction(matchId: string, homeScore: number, awayScore: number) {
  return apiClient.patch<BackendPrediction>(`/predictions/${matchId}`, { homeScore, awayScore });
}

export async function fetchMyRooms() {
  return apiClient.get<BackendRoom[]>('/rooms/my');
}

export async function fetchPublicRooms(page = 1, limit = 20) {
  return apiClient.get<{ rooms: BackendRoom[]; total: number }>(
    `/rooms?page=${page}&limit=${limit}`,
  );
}

export async function createRoom(name: string, maxMembers: number, isPrivate: boolean) {
  return apiClient.post<BackendRoom>('/rooms', { name, maxMembers, isPrivate });
}

export async function joinRoom(code: string) {
  return apiClient.post<BackendRoom>('/rooms/join', { code });
}

export async function fetchRoomById(id: string) {
  return apiClient.get<BackendRoom>(`/rooms/${id}`);
}

export interface BackendRoomMember {
  roomPoints: number;
  roomRank: number | null;
  joinedAt: string;
  user: { id: string; username: string; firstName: string; avatarUrl: string | null; totalPoints: number };
}

export async function fetchRoomMembers(roomId: string, page = 1, limit = 50) {
  return apiClient.get<{ members: BackendRoomMember[]; total: number }>(
    `/rooms/${roomId}/members?page=${page}&limit=${limit}`,
  );
}

export async function fetchGlobalRanking(page = 1, limit = 50) {
  return apiClient.get<{ rankings: BackendRankingEntry[]; total: number; pages: number }>(
    `/rankings/global?page=${page}&limit=${limit}`,
  );
}

export async function fetchMyRank() {
  return apiClient.get<{ rank: number; totalPoints: number }>('/rankings/me');
}

export async function fetchMyStats() {
  return apiClient.get<UserStats>('/statistics/me');
}

export async function fetchPlatformStats() {
  return apiClient.get<{
    totalUsers: number;
    totalPredictions: number;
    predictionsToday: number;
    totalRooms: number;
    liveMatches: number;
  }>('/statistics/platform');
}

// ─── Static/mock data (backward-compatible) ──────────────────────────────────

export const api = {
  getHomeTopPlayers: () => homeTopPlayers,
  getHomeFeatures: () => homeFeatures,
  getAdminUsers: () => adminUsers,
  getScoringRules: () => scoringRules,
  getAdminLiveMatches: () => adminLiveMatches,
  getPlatformStats: () => platformStats,
  getRecentEvents: () => recentEvents,
  getQuickActions: () => quickActions,
  getUpcomingMatches: () => upcomingMatches,
  getRecentPredictions: () => recentPredictions,
  getMatches: () => matches,
  getPrivateRooms: () => privateRooms,
  getPublicRooms: () => publicRooms,
  getRankingTopThree: () => rankingTopThree,
  getLeaderboard: () => leaderboard,
  getStatsKpis: () => statsKpis,
  getBestPredictedTeams: () => bestPredictedTeams,
  getFriendsComparison: () => friendsComparison,
  getAdminProfileStats: () => adminProfileStats,
  getAdminSettings: () => adminSettings,
  getUserBadges: () => userBadges,
  getProfileRecentActivity: () => profileRecentActivity,
};
