import client from '../../api/client';

const listeners = new Set();

function getState() {
  const user = localStorage.getItem('user');
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  return { user: user ? JSON.parse(user) : null, accessToken, refreshToken };
}

function setState(next) {
  const state = { ...getState(), ...next };
  if (state.user) localStorage.setItem('user', JSON.stringify(state.user));
  else localStorage.removeItem('user');
  if (state.accessToken) localStorage.setItem('accessToken', state.accessToken);
  else localStorage.removeItem('accessToken');
  if (state.refreshToken) localStorage.setItem('refreshToken', state.refreshToken);
  else localStorage.removeItem('refreshToken');
  listeners.forEach((l) => l());
}

export const authStore = {
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  getState,
  async login({ email, password }) {
    const res = await client.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user } = res.data.data;
    setState({ user, accessToken, refreshToken });
  },
  async register({ email, password, name }) {
    await client.post('/auth/register', { email, password, name });
  },
  logout() {
    setState({ user: null, accessToken: null, refreshToken: null });
  },
  async refresh() {
    const { refreshToken } = getState();
    if (!refreshToken) return;
    try {
      const res = await client.post('/auth/refresh', { refreshToken });
      const { accessToken } = res.data.data;
      setState({ accessToken });
    } catch (_e) {
      setState({ user: null, accessToken: null, refreshToken: null });
    }
  }
};

