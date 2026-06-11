import { Navigate } from '@modern-js/runtime/router';

export default function HomePage() {
  return <Navigate to="/accounts" replace />;
}
