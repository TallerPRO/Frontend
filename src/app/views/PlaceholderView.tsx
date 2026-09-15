import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';

interface PlaceholderViewProps {
  title: string;
  description: string;
  phase: string;
}

export function PlaceholderView({ title, description, phase }: PlaceholderViewProps) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Card>
        <p className="text-sm text-gray-400">Esta vista se implementa en {phase}.</p>
      </Card>
    </>
  );
}
