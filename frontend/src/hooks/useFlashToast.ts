import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../context/toastContext';
import type { ToastStatus } from '../types/domain';

interface FlashState {
  toastMessage?: string;
  status?: ToastStatus;
}

export function useFlashToast() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const state = location.state as FlashState | undefined;
    if (state?.toastMessage) {
      showToast(state.toastMessage, state.status || 'info');
      navigate(location.pathname, { replace: true, state: undefined });
    }
  }, [location, navigate, showToast]);
}
