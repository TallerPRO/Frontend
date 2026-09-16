import { Info } from 'lucide-react';

// Aviso cuando la vista está mostrando datos de muestra porque el BFF no
// respondió. Se oculta solo cuando `visible` es false.
export function MockBanner({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      role="status"
      className="mb-4 flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-200"
    >
      <Info className="h-4 w-4 shrink-0" aria-hidden />
      Sin conexión con el BFF: se muestran datos de muestra. Los cambios no se guardan.
    </div>
  );
}
