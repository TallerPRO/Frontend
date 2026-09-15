import { LoginCard } from './LoginCard';

// Wrapper TEMPORAL: navega directo a /app/dashboard sin pasar por Azure AD.
// Reemplazar este archivo (o el onLogin) cuando se integre el login real.
export function LoginCardDemo() {
  return <LoginCard onLogin={() => window.location.assign('/app/dashboard')} />;
}
