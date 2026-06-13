import { apiClient } from '@/lib/apiClient';

export const TOKEN_KEY = 'mp_token';
export const USER_KEY = 'mp_user';

interface BackendUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName?: string;
  role: 'USER' | 'ADMIN';
  totalPoints?: number;
  streak?: number;
  globalRank?: number | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: 'admin' | 'user';
  totalPoints?: number;
  streak?: number;
  globalRank?: number | null;
}

function normalize(u: BackendUser): User {
  return {
    id: u.id,
    name: [u.firstName, u.lastName].filter(Boolean).join(' '),
    email: u.email,
    username: u.username,
    role: u.role === 'ADMIN' ? 'admin' : 'user',
    totalPoints: u.totalPoints,
    streak: u.streak,
    globalRank: u.globalRank,
  };
}

export async function login(
  email: string,
  password: string,
): Promise<{ user: User; token: string } | null> {
  try {
    const data = await apiClient.post<{ user: BackendUser; token: string }>('/auth/login', {
      email,
      password,
    });
    return { user: normalize(data.user), token: data.token };
  } catch {
    return null;
  }
}

export async function register(
  firstName: string,
  lastName: string,
  email: string,
  username: string,
  password: string,
): Promise<{ user: User; token: string } | null> {
  try {
    const data = await apiClient.post<{ user: BackendUser; token: string }>('/auth/register', {
      firstName,
      lastName: lastName || undefined,
      email,
      username,
      password,
    });
    return { user: normalize(data.user), token: data.token };
  } catch {
    return null;
  }
}

export async function getMe(): Promise<User | null> {
  try {
    const u = await apiClient.get<BackendUser>('/auth/me');
    return normalize(u);
  } catch {
    return null;
  }
}
