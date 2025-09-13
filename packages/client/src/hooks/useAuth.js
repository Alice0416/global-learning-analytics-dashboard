import { useEffect, useSyncExternalStore } from 'react';
import { authStore } from '../features/auth/authStore';

export default function useAuth() {
  const state = useSyncExternalStore(authStore.subscribe, authStore.getState, authStore.getState);
  useEffect(() => {
    if (!state.accessToken && state.refreshToken) authStore.refresh();
  }, [state.accessToken, state.refreshToken]);
  return {
    user: state.user,
    isAuthed: !!state.accessToken,
    logout: authStore.logout
  };
}

