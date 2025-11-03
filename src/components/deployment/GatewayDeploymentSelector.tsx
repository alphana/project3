import { GatewayDeploymentInfo, NamespaceInfo } from './types/deployment.types';
import { Button } from '../ui/Button';
import { Server, GitBranch, Package } from 'lucide-react';
import { cn } from '../../lib/utils';

interface GatewayDeploymentSelectorProps {
  gatewayDeployment: GatewayDeploymentInfo;
  selectedNamespace: NamespaceInfo | null;
  onNamespaceSelect: (namespace: NamespaceInfo) => void;
  onNext: () => void;
  onCancel: () => void;
}

export function GatewayDeploymentSelector({
  gatewayDeployment,
  selectedNamespace,
  onNamespaceSelect,
  onNext,
  onCancel,
}: GatewayDeploymentSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gateway Deployment Configuration</h2>
        <p className="text-sm text-gray-600">Select namespace and configure deployment target</p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Server className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{gatewayDeployment.name}</h3>
            <p className="text-sm text-gray-600">Gateway Deployment</p>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-3 border-t border-blue-200">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Current:</span>
            <code className="px-2 py-1 bg-white rounded text-sm font-medium text-gray-900">
              {gatewayDeployment.currentRevision}
            </code>
          </div>
          <span className="text-gray-400">→</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Target:</span>
            <code className="px-2 py-1 bg-blue-100 rounded text-sm font-medium text-blue-700">
              {gatewayDeployment.targetRevision}
            </code>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Package className="h-4 w-4" />
          Select Target Namespace
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {gatewayDeployment.namespaces.map((namespace) => {
            const isSelected = selectedNamespace?.id === namespace.id;

            return (
              <button
                key={namespace.id}
                onClick={() => onNamespaceSelect(namespace)}
                className={cn(
                  'w-full text-left p-4 rounded-lg border-2 transition-all',
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'p-2 rounded-lg',
                        isSelected ? 'bg-blue-100' : 'bg-gray-100'
                      )}
                    >
                      <Package className={cn('h-5 w-5', isSelected ? 'text-blue-600' : 'text-gray-600')} />
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900">{namespace.name}</h4>
                      <p className="text-sm text-gray-500">Namespace ID: {namespace.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{namespace.podCount}</div>
                      <div className="text-xs text-gray-500">Pods</div>
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
        <Button onClick={onNext} disabled={!selectedNamespace}>
          Next: Select Routes →
        </Button>
      </div>
    </div>
  );
}
