import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const GRAPHQL_URL = "https://mtgartistconnectionwebservice-production.up.railway.app/graphql";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  refreshToken: string | null;
  user: User | null;
}

const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('user');
const storedRefreshToken = localStorage.getItem('refreshToken');

const initialState: AuthState = {
  isLoggedIn: !!storedToken,
  token: storedToken,
  refreshToken: storedRefreshToken,
  user: storedToken && storedUser ? JSON.parse(storedUser) : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ token: string; refreshToken: string; user: User }>) => {
      state.isLoggedIn = true;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    tokenRefreshed: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
  },
});

export async function refreshAccessToken(): Promise<string | null> {
  const token = localStorage.getItem('refreshToken');
  if (!token) return null;
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `mutation { refreshToken(refreshToken: "${token}") { token } }`,
      }),
    });
    const json = await response.json();
    const newToken = json?.data?.refreshToken?.token;
    if (newToken) {
      localStorage.setItem('token', newToken);
      return newToken;
    }
    return null;
  } catch {
    return null;
  }
}

export function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

export const { login, tokenRefreshed, logout } = authSlice.actions;
export default authSlice.reducer;
