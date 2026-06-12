import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CookieManager from '@preeternal/react-native-cookie-manager';
import {
  AuthProvider,
  useAuth,
  fetchConSesion,
  setSessionExpiredHandler,
} from '@/context/AuthContext';

jest.mock('@preeternal/react-native-cookie-manager', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
    setFromResponse: jest.fn(),
    clearAll: jest.fn(),
  },
}));

jest.mock('@/utils/firebaseMessaging', () => ({
  registerFcmToken: jest.fn().mockResolvedValue(undefined),
  setupTokenRefresh: jest.fn(() => () => {}),
}));

const mockGet = CookieManager.get as jest.Mock;
const mockSet = CookieManager.set as jest.Mock;
const mockSetFromResponse = CookieManager.setFromResponse as jest.Mock;
const mockClearAll = CookieManager.clearAll as jest.Mock;

const mockFetch = jest.fn();
globalThis.fetch = mockFetch as typeof fetch;

const noCookies = {};
const sessionCookies = {
  sessionid: { value: 'test-session-id' },
  csrftoken: { value: 'test-csrf-token' },
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
  mockGet.mockResolvedValue(noCookies);
  mockSet.mockResolvedValue(undefined);
  mockSetFromResponse.mockResolvedValue(undefined);
  mockClearAll.mockResolvedValue(undefined);
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);
});

describe('fetchConSesion', () => {
  it('sends session and CSRF cookies as headers', async () => {
    mockGet.mockResolvedValue(sessionCookies);
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      url: 'https://api.imsambulancias.cl/ims/api/test/',
      headers: { get: () => null },
    });

    await fetchConSesion('/ims/api/test/');

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('https://api.imsambulancias.cl/ims/api/test/');
    expect(options.headers['Cookie']).toContain('sessionid=test-session-id');
    expect(options.headers['X-CSRFToken']).toBe('test-csrf-token');
  });

  it('omits Cookie header when no session exists', async () => {
    mockGet.mockResolvedValue(noCookies);
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      url: 'https://api.imsambulancias.cl/ims/api/test/',
      headers: { get: () => null },
    });

    await fetchConSesion('/ims/api/test/');

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers['Cookie']).toBeUndefined();
  });

  it('clears storage and fires session handler on 401', async () => {
    mockGet.mockResolvedValue(sessionCookies);
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      url: 'https://api.imsambulancias.cl/ims/api/test/',
      headers: { get: () => null },
    });

    const onExpired = jest.fn();
    setSessionExpiredHandler(onExpired);

    await fetchConSesion('/ims/api/test/');

    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['user', 'sessionid', 'csrftoken']);
    expect(mockClearAll).toHaveBeenCalled();
    expect(onExpired).toHaveBeenCalled();
  });

  it('persists set-cookie header from response', async () => {
    mockGet.mockResolvedValue(noCookies);
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      url: 'https://api.imsambulancias.cl/ims/api/test/',
      headers: { get: (h: string) => (h === 'set-cookie' ? 'sessionid=abc; Path=/' : null) },
    });

    await fetchConSesion('/ims/api/test/');

    expect(mockSetFromResponse).toHaveBeenCalledWith(
      'https://api.imsambulancias.cl',
      'sessionid=abc; Path=/',
    );
  });
});

describe('useAuth — login', () => {
  const mockCsrfGetResponse = {
    ok: true,
    status: 200,
    headers: { get: (h: string) => (h === 'set-cookie' ? 'csrftoken=csrf-abc; Path=/' : null) },
  };

  const mockLoginPostResponse = (ok: boolean) => ({
    ok,
    status: ok ? 200 : 401,
    json: jest.fn().mockResolvedValue({}),
    headers: {
      get: (h: string) => (h === 'set-cookie' ? 'csrftoken=csrf-abc; Path=/' : null),
    },
  });

  it('returns true when credentials are accepted', async () => {
    mockGet.mockResolvedValueOnce({ csrftoken: { value: 'csrf-abc' } });

    mockFetch
      .mockResolvedValueOnce(mockCsrfGetResponse)
      .mockResolvedValueOnce(mockLoginPostResponse(true));

    const { result } = renderHook(() => useAuth(), { wrapper });

    let loginResult: boolean | undefined;
    await act(async () => {
      loginResult = await result.current.login('testuser', 'password123');
    });

    expect(loginResult).toBe(true);
  });

  it('returns false when server responds with error', async () => {
    mockGet.mockResolvedValueOnce(noCookies);

    mockFetch.mockResolvedValueOnce(mockCsrfGetResponse).mockResolvedValueOnce({
      ...mockLoginPostResponse(false),
      json: jest.fn().mockResolvedValue({}),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let loginResult: boolean | undefined;
    await act(async () => {
      loginResult = await result.current.login('testuser', 'wrongpass');
    });

    expect(loginResult).toBe(false);
  });

  it('returns false on network error', async () => {
    mockGet.mockResolvedValueOnce(noCookies);
    mockFetch
      .mockResolvedValueOnce(mockCsrfGetResponse)
      .mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    let loginResult: boolean | undefined;
    await act(async () => {
      loginResult = await result.current.login('testuser', 'pass');
    });

    expect(loginResult).toBe(false);
  });
});

describe('useAuth — totpValid', () => {
  const mockCsrfGetResponse = {
    ok: true,
    status: 200,
    headers: { get: (h: string) => (h === 'set-cookie' ? 'csrftoken=csrf-abc; Path=/' : null) },
  };

  const mockTotpPostResponse = (ok: boolean) => ({
    ok,
    status: ok ? 200 : 401,
    json: jest.fn().mockResolvedValue({ user_data: { role: 'medico' } }),
    headers: {
      get: (h: string) =>
        h === 'set-cookie' ? 'sessionid=sess-abc; csrftoken=csrf-abc; Path=/' : null,
    },
  });

  const mockPersonalResponse = {
    ok: true,
    json: jest
      .fn()
      .mockResolvedValue([{ username: 'testuser', first_name: 'Test', last_name: 'User', id: 42 }]),
    headers: { get: () => null },
  };

  it('returns null without pending credentials', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    let totpResult: any;
    await act(async () => {
      totpResult = await result.current.totpValid('123456');
    });

    expect(totpResult).toBeNull();
  });

  it('returns role and personalId on successful verification', async () => {
    // Call order for CookieManager.get:
    //  #1 — fetchCsrfToken: needs csrftoken after GET response
    //  #2 — totpValid POST: needs sessionid + csrftoken after POST response
    //  #3+ — fetchConSesion (personal): any session cookies
    mockGet
      .mockResolvedValueOnce({ csrftoken: { value: 'csrf-abc' } })
      .mockResolvedValueOnce({ sessionid: { value: 'sess-abc' }, csrftoken: { value: 'csrf-abc' } })
      .mockResolvedValue(sessionCookies);

    mockFetch
      .mockResolvedValueOnce(mockCsrfGetResponse)
      .mockResolvedValueOnce(mockTotpPostResponse(true))
      .mockResolvedValueOnce(mockPersonalResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.setPendingCredentials({ username: 'testuser', password: 'password123' });
    });

    let totpResult: any;
    await act(async () => {
      totpResult = await result.current.totpValid('123456');
    });

    expect(totpResult).not.toBeNull();
    expect(totpResult?.role).toBe('medic');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('sessionid', 'sess-abc');
  });

  it('returns null when server responds with error', async () => {
    mockGet
      .mockResolvedValueOnce(noCookies)
      .mockResolvedValueOnce({ csrftoken: { value: 'csrf-abc' } });

    mockFetch.mockResolvedValueOnce(mockCsrfGetResponse).mockResolvedValueOnce({
      ...mockTotpPostResponse(false),
      json: jest.fn().mockResolvedValue({}),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.setPendingCredentials({ username: 'testuser', password: 'password123' });
    });

    let totpResult: any;
    await act(async () => {
      totpResult = await result.current.totpValid('000000');
    });

    expect(totpResult).toBeNull();
  });
});

describe('useAuth — logout', () => {
  it('clears AsyncStorage and cookies on logout', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['user', 'sessionid', 'csrftoken']);
    expect(mockClearAll).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
  });
});

describe('useAuth — session restore', () => {
  it('restores user from AsyncStorage on mount', async () => {
    const savedUser = {
      username: 'restored',
      role: 'control',
      personalId: '1',
      firstName: 'A',
      lastName: 'B',
    };
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(JSON.stringify(savedUser))
      .mockResolvedValueOnce('saved-session-id');
    mockGet.mockResolvedValue({ sessionid: { value: 'saved-session-id' } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {});

    expect(result.current.user?.username).toBe('restored');
  });

  it('leaves user null when no saved session exists', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {});

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});
