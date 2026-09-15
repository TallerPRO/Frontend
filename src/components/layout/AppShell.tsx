import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useUiStore } from '../../stores/ui.store';
import { cn } from '../../lib/cn';

interface AppShellProps {
  children: ReactNode;
  roles?: string[];
  userName?: string;
  onLogout?: () => void;
}

export function AppShell({ children, roles, userName, onLogout }: AppShellProps) {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);

  return (
    <div className="flex min-h-screen bg-navy-900 text-gray-100">
      <Sidebar roles={roles} />
      <div
        className={cn(
          'flex min-h-screen w-full min-w-0 flex-1 flex-col transition-[padding] duration-200',
          sidebarCollapsed ? 'md:pl-[72px]' : 'md:pl-60',
        )}
      >
        <Topbar userName={userName} onLogout={onLogout} />
        <main className="flex-1 overflow-x-hidden p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
