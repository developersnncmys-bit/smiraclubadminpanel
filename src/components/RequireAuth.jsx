import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../store/AppStore.jsx';

/** Blocks the panel until a mobile number has been verified. */
export default function RequireAuth({ children }) {
  const { auth } = useApp();
  const location = useLocation();

  if (!auth) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return children;
}
