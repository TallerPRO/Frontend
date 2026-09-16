import { PageHeader } from '../../components/layout/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProfileCard } from '../../components/profile/ProfileCard';
import { useSessionStore } from '../../stores/session.store';

export function ProfileView() {
  const user = useSessionStore((s) => s.user);

  return (
    <>
      <PageHeader title="Perfil" description="Datos de la cuenta" />
      {user ? (
        <ProfileCard user={user} />
      ) : (
        <EmptyState title="Sin sesión activa" description="Inicia sesión para ver los datos de tu cuenta." />
      )}
    </>
  );
}
