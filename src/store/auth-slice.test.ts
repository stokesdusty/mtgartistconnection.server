import authReducer, {
  login,
  logout,
  tokenRefreshed,
  getTokenExpiry,
  refreshAccessToken,
} from './auth-slice';

const makeUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  ...overrides,
});

// Build a base64-encoded JWT with any payload
const makeJWT = (payload: object) =>
  `header.${btoa(JSON.stringify(payload))}.signature`;

beforeEach(() => {
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// login reducer
// ---------------------------------------------------------------------------
describe('login', () => {
  it('sets isLoggedIn to true and stores token/user in state', () => {
    const state = authReducer(undefined, login({
      token: 'access-token',
      refreshToken: 'refresh-token',
      user: makeUser(),
    }));

    expect(state.isLoggedIn).toBe(true);
    expect(state.token).toBe('access-token');
    expect(state.refreshToken).toBe('refresh-token');
    expect(state.user).toEqual(makeUser());
  });

  it('persists token and user to localStorage', () => {
    authReducer(undefined, login({
      token: 'access-token',
      refreshToken: 'refresh-token',
      user: makeUser(),
    }));

    expect(localStorage.getItem('token')).toBe('access-token');
    expect(localStorage.getItem('refreshToken')).toBe('refresh-token');
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual(makeUser());
  });
});

// ---------------------------------------------------------------------------
// logout reducer
// ---------------------------------------------------------------------------
describe('logout', () => {
  it('clears all auth state', () => {
    const loggedInState = authReducer(undefined, login({
      token: 'access-token',
      refreshToken: 'refresh-token',
      user: makeUser(),
    }));

    const state = authReducer(loggedInState, logout());

    expect(state.isLoggedIn).toBe(false);
    expect(state.token).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it('removes token and user from localStorage', () => {
    localStorage.setItem('token', 'access-token');
    localStorage.setItem('refreshToken', 'refresh-token');
    localStorage.setItem('user', JSON.stringify(makeUser()));

    authReducer(undefined, logout());

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// tokenRefreshed reducer
// ---------------------------------------------------------------------------
describe('tokenRefreshed', () => {
  it('updates token in state', () => {
    const loggedInState = authReducer(undefined, login({
      token: 'old-token',
      refreshToken: 'refresh-token',
      user: makeUser(),
    }));

    const state = authReducer(loggedInState, tokenRefreshed('new-token'));

    expect(state.token).toBe('new-token');
  });

  it('writes new token to localStorage', () => {
    authReducer(undefined, tokenRefreshed('new-token'));
    expect(localStorage.getItem('token')).toBe('new-token');
  });

  it('does not change other state fields', () => {
    const loggedInState = authReducer(undefined, login({
      token: 'old-token',
      refreshToken: 'refresh-token',
      user: makeUser(),
    }));

    const state = authReducer(loggedInState, tokenRefreshed('new-token'));

    expect(state.isLoggedIn).toBe(true);
    expect(state.refreshToken).toBe('refresh-token');
    expect(state.user).toEqual(makeUser());
  });
});

// ---------------------------------------------------------------------------
// getTokenExpiry
// ---------------------------------------------------------------------------
describe('getTokenExpiry', () => {
  it('returns exp value from a valid JWT payload', () => {
    const jwt = makeJWT({ exp: 1700000000, sub: 'user1' });
    expect(getTokenExpiry(jwt)).toBe(1700000000);
  });

  it('returns null when payload has no exp field', () => {
    const jwt = makeJWT({ sub: 'user1', role: 'admin' });
    expect(getTokenExpiry(jwt)).toBeNull();
  });

  it('returns null when exp is not a number', () => {
    const jwt = makeJWT({ exp: 'not-a-number' });
    expect(getTokenExpiry(jwt)).toBeNull();
  });

  it('returns null for a token that is not a valid JWT format', () => {
    expect(getTokenExpiry('not.a.valid.jwt.token')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(getTokenExpiry('')).toBeNull();
  });

  it('returns null when base64 payload is invalid', () => {
    expect(getTokenExpiry('header.!!!invalid-base64!!.signature')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// refreshAccessToken
// ---------------------------------------------------------------------------
describe('refreshAccessToken', () => {
  const originalFetch = (global as any).fetch;

  afterEach(() => {
    (global as any).fetch = originalFetch;
  });

  it('returns null immediately when no refreshToken is in localStorage', async () => {
    const result = await refreshAccessToken();
    expect(result).toBeNull();
  });

  it('returns the new token on a successful API response', async () => {
    localStorage.setItem('refreshToken', 'my-refresh-token');
    (global as any).fetch = jest.fn().mockResolvedValue({
      json: async () => ({ data: { refreshToken: { token: 'new-access-token' } } }),
    });

    const result = await refreshAccessToken();

    expect(result).toBe('new-access-token');
  });

  it('saves the new token to localStorage on success', async () => {
    localStorage.setItem('refreshToken', 'my-refresh-token');
    (global as any).fetch = jest.fn().mockResolvedValue({
      json: async () => ({ data: { refreshToken: { token: 'new-access-token' } } }),
    });

    await refreshAccessToken();

    expect(localStorage.getItem('token')).toBe('new-access-token');
  });

  it('returns null when the API response contains no token', async () => {
    localStorage.setItem('refreshToken', 'my-refresh-token');
    (global as any).fetch = jest.fn().mockResolvedValue({
      json: async () => ({ data: { refreshToken: null } }),
    });

    const result = await refreshAccessToken();

    expect(result).toBeNull();
  });

  it('returns null when the API response has an unexpected shape', async () => {
    localStorage.setItem('refreshToken', 'my-refresh-token');
    (global as any).fetch = jest.fn().mockResolvedValue({
      json: async () => ({ errors: [{ message: 'Unauthorized' }] }),
    });

    const result = await refreshAccessToken();

    expect(result).toBeNull();
  });

  it('returns null on a network error', async () => {
    localStorage.setItem('refreshToken', 'my-refresh-token');
    (global as any).fetch = jest.fn().mockRejectedValue(new Error('Network failure'));

    const result = await refreshAccessToken();

    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Initial state hydration from localStorage
// ---------------------------------------------------------------------------
describe('initial state hydration', () => {
  it('starts logged out with null values when localStorage is empty', () => {
    // localStorage is already cleared by the top-level beforeEach
    let reducer: typeof authReducer;
    jest.isolateModules(() => {
      reducer = require('./auth-slice').default;
    });
    const state = reducer!(undefined, { type: '@@INIT' });
    expect(state.isLoggedIn).toBe(false);
    expect(state.token).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it('rehydrates isLoggedIn, token, refreshToken, and user from localStorage', () => {
    const user = makeUser();
    localStorage.setItem('token', 'stored-token');
    localStorage.setItem('refreshToken', 'stored-refresh');
    localStorage.setItem('user', JSON.stringify(user));

    let reducer: typeof authReducer;
    jest.isolateModules(() => {
      reducer = require('./auth-slice').default;
    });
    const state = reducer!(undefined, { type: '@@INIT' });
    expect(state.isLoggedIn).toBe(true);
    expect(state.token).toBe('stored-token');
    expect(state.refreshToken).toBe('stored-refresh');
    expect(state.user).toEqual(user);
  });

  it('sets user to null when token is present but user entry is missing', () => {
    localStorage.setItem('token', 'stored-token');
    // no 'user' key

    let reducer: typeof authReducer;
    jest.isolateModules(() => {
      reducer = require('./auth-slice').default;
    });
    const state = reducer!(undefined, { type: '@@INIT' });
    expect(state.isLoggedIn).toBe(true);
    expect(state.user).toBeNull();
  });
});
