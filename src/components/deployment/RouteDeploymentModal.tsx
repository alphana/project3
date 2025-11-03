import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import {
  DeploymentStrategy,
  RouteData,
  WorkloadPod,
  StrategyConfigOptions,
  GatewayDeploymentInfo,
  NamespaceInfo,
  RouteChange,
} from './types/deployment.types';
import { GatewayDeploymentSelector } from './GatewayDeploymentSelector';
import { RouteSelectionStep } from './RouteSelectionStep';
import { DeploymentStrategySelector } from './DeploymentStrategySelector';
import { DeploymentStrategyConfig } from './DeploymentStrategyConfig';
import { DeploymentProgress } from './DeploymentProgress';
import { DeploymentSummary } from './DeploymentSummary';
import { useDeploymentSimulation } from './hooks/useDeploymentSimulation';
import { cn } from '../../lib/utils';

interface RouteDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  gatewayDeployment: GatewayDeploymentInfo;
  routeChanges: RouteChange[];
}

type Step = 'gateway' | 'routes' | 'strategy' | 'config' | 'progress' | 'summary';

const MODAL_SIZES: Record<Step, string> = {
  gateway: 'max-w-2xl',
  routes: 'max-w-4xl',
  strategy: 'max-w-2xl',
  config: 'max-w-2xl',
  progress: 'max-w-6xl',
  summary: 'max-w-3xl',
};

export function RouteDeploymentModal({
  isOpen,
  onClose,
  gatewayDeployment,
  routeChanges,
}: RouteDeploymentModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('gateway');
  const [selectedNamespace, setSelectedNamespace] = useState<NamespaceInfo | null>(null);
  const [selectedRouteIds, setSelectedRouteIds] = useState<string[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<DeploymentStrategy>('rolling');
  const [_strategyConfig, setStrategyConfig] = useState<StrategyConfigOptions | null>(null);
  const [targetPods, setTargetPods] = useState<WorkloadPod[]>([]);
  const [selectedRoutes, setSelectedRoutes] = useState<RouteData[]>([]);

  const mockRoute = selectedRoutes[0] || routeChanges[0]?.proposed;

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
    mockRoute,
    gatewayDeployment.targetRevision
  );

  useEffect(() => {
    if (summary) {
      setCurrentStep('summary');
    }
  }, [summary]);

  useEffect(() => {
    if (selectedNamespace) {
      const pods: WorkloadPod[] = [];
      for (let i = 0; i < selectedNamespace.podCount; i++) {
        pods.push({
          id: `pod-${i + 1}`,
          name: `gateway-pod-${selectedNamespace.name}-${i + 1}`,
          ip: `10.0.${Math.floor(i / 10)}.${(i % 10) + 10}`,
          nodeName: `node-${Math.floor(i / 4) + 1}`,
          namespace: {
            id: selectedNamespace.id,
            name: selectedNamespace.name,
          },
        });
      }
      setTargetPods(pods);
    }
  }, [selectedNamespace]);

  useEffect(() => {
    const routes = routeChanges
      .filter((rc) => selectedRouteIds.includes(rc.routeId))
      .map((rc) => rc.proposed);
    setSelectedRoutes(routes);
  }, [selectedRouteIds, routeChanges]);

  const handleNamespaceSelected = () => {
    setCurrentStep('routes');
  };

  const handleRoutesSelected = () => {
    setCurrentStep('strategy');
  };

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
    setCurrentStep('gateway');
    setSelectedNamespace(null);
    setSelectedRouteIds([]);
    setSelectedStrategy('rolling');
    setStrategyConfig(null);
    setTargetPods([]);
    setSelectedRoutes([]);
    onClose();
  };

  const handleRetry = () => {
    setCurrentStep('gateway');
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
              {currentStep === 'gateway' && 'Gateway Deployment Configuration'}
              {currentStep === 'routes' && 'Select Routes'}
              {currentStep === 'strategy' && 'Deployment Strategy'}
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
            {currentStep === 'gateway' && (
              <GatewayDeploymentSelector
                gatewayDeployment={gatewayDeployment}
                selectedNamespace={selectedNamespace}
                onNamespaceSelect={setSelectedNamespace}
                onNext={handleNamespaceSelected}
                onCancel={handleClose}
              />
            )}

            {currentStep === 'routes' && (
              <RouteSelectionStep
                routeChanges={routeChanges}
                selectedRouteIds={selectedRouteIds}
                onRouteSelectionChange={setSelectedRouteIds}
                onNext={handleRoutesSelected}
                onBack={() => setCurrentStep('gateway')}
              />
            )}

            {currentStep === 'strategy' && mockRoute && (
              <DeploymentStrategySelector
                selectedStrategy={selectedStrategy}
                onStrategyChange={setSelectedStrategy}
                route={mockRoute}
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

            {currentStep === 'progress' && mockRoute && (
              <DeploymentProgress
                strategy={selectedStrategy}
                routeName={`${selectedRoutes.length} route${selectedRoutes.length > 1 ? 's' : ''}`}
                pods={targetPods}
                podStatuses={podStatuses}
                events={events}
                currentStageIndex={currentStageIndex}
                stages={stages}
                isRunning={isRunning}
                gatewayName={gatewayDeployment.name}
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
