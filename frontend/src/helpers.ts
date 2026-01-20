import api from './api';
import qs from 'qs';

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

