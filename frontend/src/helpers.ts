import api from './api';
import qs from 'qs';
import type { MatchItem } from './types/domain';

interface TokenResponse {
  access_token: string;
}

export async function login(email: string, password: string, rememberMe = false): Promise<void> {
  const response = await api.post<TokenResponse>(
    '/auth/token',
    qs.stringify({
      grant_type: 'password',
      username: email,
      password,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  const token = response.data.access_token;

  if (rememberMe) {
    localStorage.setItem('token', token);
  } else {
    sessionStorage.setItem('token', token);
  }
}

export async function logout(): Promise<void> {
  localStorage.clear();
  sessionStorage.clear();
}

export async function getCurrentUser() {
  return api.get('/users/me');
}

export function getDisplayName(match: MatchItem): string {
  const profile = match.profile;
  if (!profile) {
    return 'Match';
  }

  const parts = [profile.first_name, profile.middle_name, profile.last_name]
    .filter((part) => Boolean(part))
    .map((part) => String(part).trim())
    .filter((part) => part.length > 0);

  return parts.length > 0 ? parts.join(' ') : 'Match';
}

export function getAvatarUrl(match: MatchItem): string {
  return match.profile?.profilePicture || match.profile?.avatar || 'https://via.placeholder.com/150';
}

