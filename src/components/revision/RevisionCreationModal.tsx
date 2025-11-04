import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { WorkloadNamespace, RevisionData, RevisionSummary } from './types/revision.types';
import { RouteChange } from '../deployment/types/deployment.types';
import { WorkloadNamespaceSelector } from './WorkloadNamespaceSelector';
import { RouteChangesReview } from './RouteChangesReview';
import { RevisionSummaryStep } from './RevisionSummaryStep';
import { cn } from '../../lib/utils';

interface RevisionCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  namespaces: WorkloadNamespace[];
  onRevisionCreated: (revision: RevisionData) => void;
}

type Step = 'namespace' | 'routes' | 'summary';

const MODAL_SIZES: Record<Step, string> = {
  namespace: 'max-w-2xl',
  routes: 'max-w-5xl',
  summary: 'max-w-3xl',
};

export function RevisionCreationModal({
  isOpen,
  onClose,
  namespaces,
  onRevisionCreated,
}: RevisionCreationModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('namespace');
  const [selectedNamespace, setSelectedNamespace] = useState<WorkloadNamespace | null>(null);
  const [selectedRouteIds, setSelectedRouteIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep('namespace');
      setSelectedNamespace(null);
      setSelectedRouteIds([]);
      setIsCreating(false);
    }
  }, [isOpen]);

  const handleNamespaceSelected = () => {
    setCurrentStep('routes');
  };

  const handleRoutesReviewed = () => {
    setCurrentStep('summary');
  };

  const handleCreateRevision = async () => {
    if (!selectedNamespace) return;

    setIsCreating(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const selectedRoutes = selectedNamespace.routeChanges.filter((rc) =>
      selectedRouteIds.includes(rc.routeId)
    );

    const totalChanges = selectedRoutes.reduce((acc, route) => {
      return acc + Object.keys(route.changes).length;
    }, 0);

    const currentRevisionNumber = 42;
    const newRevisionNumber = currentRevisionNumber + 1;

    const revision: RevisionData = {
      id: `rev-${Date.now()}`,
      revisionNumber: `rev-${newRevisionNumber}`,
      createdAt: new Date().toISOString(),
      createdBy: 'operator@example.com',
      namespace: selectedNamespace.name,
      routesCount: selectedRoutes.length,
      status: 'ready',
      routes: selectedRoutes,
      description: `Revision ${newRevisionNumber} for ${selectedNamespace.name}`,
    };

    setIsCreating(false);
    onRevisionCreated(revision);
    onClose();
  };

  const handleClose = () => {
    if (isCreating) {
      return;
    }
    onClose();
  };

  const revisionSummary: RevisionSummary | null = selectedNamespace
    ? {
        namespace: selectedNamespace.name,
        selectedRoutesCount: selectedRouteIds.length,
        totalChangesCount: selectedNamespace.routeChanges
          .filter((rc) => selectedRouteIds.includes(rc.routeId))
          .reduce((acc, rc) => acc + Object.keys(rc.changes).length, 0),
        revisionNumber: 'rev-43',
        routes: selectedNamespace.routeChanges.filter((rc) =>
          selectedRouteIds.includes(rc.routeId)
        ),
      }
    : null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
            'bg-white rounded-xl shadow-2xl',
            'w-full transition-all duration-300',
            'max-h-[90vh] overflow-y-auto',
            MODAL_SIZES[currentStep]
          )}
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              {currentStep === 'namespace' && 'Create New Revision'}
              {currentStep === 'routes' && 'Review Route Changes'}
              {currentStep === 'summary' && 'Revision Summary'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
                disabled={isCreating}
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-6">
            {currentStep === 'namespace' && (
              <WorkloadNamespaceSelector
                namespaces={namespaces}
                selectedNamespace={selectedNamespace}
                onNamespaceSelect={setSelectedNamespace}
                onNext={handleNamespaceSelected}
                onCancel={handleClose}
              />
            )}

            {currentStep === 'routes' && selectedNamespace && (
              <RouteChangesReview
                routeChanges={selectedNamespace.routeChanges}
                selectedRouteIds={selectedRouteIds}
                onRouteSelectionChange={setSelectedRouteIds}
                onNext={handleRoutesReviewed}
                onBack={() => setCurrentStep('namespace')}
              />
            )}

            {currentStep === 'summary' && revisionSummary && (
              <RevisionSummaryStep
                summary={revisionSummary}
                onCreateRevision={handleCreateRevision}
                onBack={() => setCurrentStep('routes')}
                isCreating={isCreating}
              />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
