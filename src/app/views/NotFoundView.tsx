import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export function NotFoundView() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-semibold text-gray-100">404</h1>
      <p className="text-sm text-gray-400">La página que buscas no existe.</p>
      <Link to="/dashboard">
        <Button>Volver al dashboard</Button>
      </Link>
    </div>
  );
}
