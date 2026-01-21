import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

export function useAuthRedirect() {
  const navigate = useNavigate();
  const { refresh } = useAuth() || {};

  const handleAuthSuccess = async (targetPath: string = '/my-matches') => {
    if (refresh) {
      await refresh();
    }
    navigate(targetPath);
  };

  return { handleAuthSuccess };
}
