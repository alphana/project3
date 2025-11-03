import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { DeploymentStrategy, RouteData, WorkloadPod, StrategyConfigOptions } from './types/deployment.types';
import { DeploymentStrategySelector } from './DeploymentStrategySelector';
import { DeploymentStrategyConfig } from './DeploymentStrategyConfig';
import { DeploymentProgress } from './DeploymentProgress';
import { DeploymentSummary } from './DeploymentSummary';
import { useDeploymentSimulation } from './hooks/useDeploymentSimulation';
import { cn } from '../../lib/utils';

interface RouteDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: RouteData;
  targetPods: WorkloadPod[];
}

type Step = 'strategy' | 'config' | 'progress' | 'summary';

const MODAL_SIZES: Record<Step, string> = {
  strategy: 'max-w-2xl',
  config: 'max-w-2xl',
  progress: 'max-w-6xl',
  summary: 'max-w-3xl',
};

export function RouteDeploymentModal({
  isOpen,
  onClose,
  route,
  targetPods,
}: RouteDeploymentModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('strategy');
  const [selectedStrategy, setSelectedStrategy] = useState<DeploymentStrategy>('rolling');
  const [_strategyConfig, setStrategyConfig] = useState<StrategyConfigOptions | null>(null);

  const {
    simulate,
    cancel,
    isRunning,
    currentStageIndex,
    podStatuses,
    events,
    summary,
    stages,
  } = useDeploymentSimulation(
    selectedStrategy,
    targetPods,
    route,
    route.gatewayDeployment.revision
  );

  useEffect(() => {
    if (summary) {
      setCurrentStep('summary');
    }
  }, [summary]);

  const handleStrategySelected = () => {
    setCurrentStep('config');
  };

  const handleConfigSaved = (config: StrategyConfigOptions) => {
    setStrategyConfig(config);
  };

  const handleStartDeployment = () => {
    setCurrentStep('progress');
    simulate();
  };

  const handleCancel = () => {
    cancel();
  };

  const handleClose = () => {
    if (isRunning) {
      const confirmed = confirm('Deployment is in progress. Are you sure you want to close?');
      if (!confirmed) return;
      cancel();
    }
    setCurrentStep('strategy');
    setSelectedStrategy('rolling');
    setStrategyConfig(null);
    onClose();
  };

  const handleRetry = () => {
    setCurrentStep('strategy');
    setStrategyConfig(null);
  };

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
              {currentStep === 'strategy' && 'Route Deployment'}
              {currentStep === 'config' && 'Configure Deployment'}
              {currentStep === 'progress' && 'Deployment in Progress'}
              {currentStep === 'summary' && 'Deployment Summary'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-6">
            {currentStep === 'strategy' && (
              <DeploymentStrategySelector
                selectedStrategy={selectedStrategy}
                onStrategyChange={setSelectedStrategy}
                route={route}
                pods={targetPods}
                onNext={handleStrategySelected}
                onCancel={handleClose}
              />
            )}

            {currentStep === 'config' && (
              <DeploymentStrategyConfig
                strategy={selectedStrategy}
                onConfigChange={handleConfigSaved}
                onNext={handleStartDeployment}
                onBack={() => setCurrentStep('strategy')}
              />
            )}

            {currentStep === 'progress' && (
              <DeploymentProgress
                strategy={selectedStrategy}
                routeName={route.name}
                pods={targetPods}
                podStatuses={podStatuses}
                events={events}
                currentStageIndex={currentStageIndex}
                stages={stages}
                isRunning={isRunning}
                gatewayName={route.gatewayDeployment.name}
                onCancel={handleCancel}
              />
            )}

            {currentStep === 'summary' && summary && (
              <DeploymentSummary
                summary={summary}
                onClose={handleClose}
                onRetry={handleRetry}
              />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
