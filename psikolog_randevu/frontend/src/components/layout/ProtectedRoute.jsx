import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/giris" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/yetkisiz" replace />;
  }

  return children;
};

export default ProtectedRoute;
