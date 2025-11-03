import { DeploymentStrategy, RouteData, WorkloadPod } from './types/deployment.types';
import { STRATEGY_CONFIGS } from './types/strategy-configs';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { RefreshCw, GitBranch, TrendingUp, RotateCcw, Sparkles, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DeploymentStrategySelectorProps {
  selectedStrategy: DeploymentStrategy;
  onStrategyChange: (strategy: DeploymentStrategy) => void;
  route: RouteData;
  pods: WorkloadPod[];
  onNext: () => void;
  onCancel: () => void;
}

const ICON_MAP = {
  RefreshCw,
  GitBranch,
  TrendingUp,
  RotateCcw,
};

export function DeploymentStrategySelector({
  selectedStrategy,
  onStrategyChange,
  route,
  pods,
  onNext,
  onCancel,
}: DeploymentStrategySelectorProps) {
  const namespaceCount = new Set(pods.map((p) => p.namespace.id)).size;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Deploy Route to Production</h2>
        <p className="text-sm text-gray-600">Select a deployment strategy and start the deployment process</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span className="text-lg">📊</span> Deployment Summary
        </h3>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Route:</span>
            <span className="font-medium text-gray-900">{route.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Version:</span>
            <span className="font-medium text-gray-900">{route.version}</span>
          </div>
          <div className="flex justify-between">
            <span>Gateway Deployment:</span>
            <span className="font-medium text-gray-900">
              {route.gatewayDeployment.name} ({route.gatewayDeployment.revision})
            </span>
          </div>
          <div className="flex justify-between">
            <span>Target Pods:</span>
            <span className="font-medium text-gray-900">
              {pods.length} pods across {namespaceCount} {namespaceCount === 1 ? 'namespace' : 'namespaces'}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="text-lg">🎯</span> Select Deployment Strategy
        </h3>
        <div className="space-y-3">
          {Object.values(STRATEGY_CONFIGS).map((config) => {
            const Icon = ICON_MAP[config.icon as keyof typeof ICON_MAP];
            const isSelected = selectedStrategy === config.name;

            return (
              <button
                key={config.name}
                onClick={() => onStrategyChange(config.name)}
                className={cn(
                  'w-full text-left p-4 rounded-lg border-2 transition-all',
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'p-2 rounded-lg',
                      isSelected ? 'bg-blue-100' : 'bg-gray-100'
                    )}
                  >
                    <Icon className={cn('h-5 w-5', isSelected ? 'text-blue-600' : 'text-gray-600')} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{config.displayName}</h4>
                      {config.recommended && (
                        <Badge variant="success" className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Recommended
                        </Badge>
                      )}
                      {config.warning && (
                        <Badge variant="warning" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Downtime
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{config.description}</p>
                    <ul className="space-y-1">
                      {config.features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-500 flex items-start gap-2">
                          <span className="text-gray-400 mt-0.5">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    className={cn(
                      'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center',
                      isSelected
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300 bg-white'
                    )}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onNext}>
          Start Deployment →
        </Button>
      </div>
    </div>
  );
}
