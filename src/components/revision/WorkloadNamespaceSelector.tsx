import { WorkloadNamespace } from './types/revision.types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Server, ChevronRight, FileText, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface WorkloadNamespaceSelectorProps {
  namespaces: WorkloadNamespace[];
  selectedNamespace: WorkloadNamespace | null;
  onNamespaceSelect: (namespace: WorkloadNamespace) => void;
  onNext: () => void;
  onCancel: () => void;
}

export function WorkloadNamespaceSelector({
  namespaces,
  selectedNamespace,
  onNamespaceSelect,
  onNext,
  onCancel,
}: WorkloadNamespaceSelectorProps) {
  const hasChanges = namespaces.some((ns) => ns.routeChangesCount > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Workload Namespace</h2>
        <p className="text-sm text-gray-600">
          Choose a namespace to review route changes and create a revision
        </p>
      </div>

      {!hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-yellow-900 mb-1">No Changes Available</h3>
            <p className="text-sm text-yellow-800">
              There are no route changes in any namespace at this time.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {namespaces.map((namespace) => {
          const isSelected = selectedNamespace?.id === namespace.id;
          const hasRouteChanges = namespace.routeChangesCount > 0;

          return (
            <button
              key={namespace.id}
              onClick={() => hasRouteChanges && onNamespaceSelect(namespace)}
              disabled={!hasRouteChanges}
              className={cn(
                'w-full text-left p-4 rounded-lg border-2 transition-all',
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : hasRouteChanges
                  ? 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'p-3 rounded-lg',
                    isSelected
                      ? 'bg-blue-100'
                      : hasRouteChanges
                      ? 'bg-gray-100'
                      : 'bg-gray-200'
                  )}
                >
                  <Server
                    className={cn(
                      'h-6 w-6',
                      isSelected
                        ? 'text-blue-600'
                        : hasRouteChanges
                        ? 'text-gray-600'
                        : 'text-gray-400'
                    )}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{namespace.name}</h3>
                    {hasRouteChanges && (
                      <Badge variant="warning" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        {namespace.routeChangesCount} {namespace.routeChangesCount === 1 ? 'Change' : 'Changes'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {namespace.totalRoutes} {namespace.totalRoutes === 1 ? 'route' : 'routes'} total
                    {!hasRouteChanges && ' - No changes'}
                  </p>
                </div>

                {hasRouteChanges && (
                  <div className="flex-shrink-0">
                    <div
                      className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-full',
                        isSelected ? 'bg-blue-600' : 'bg-gray-200'
                      )}
                    >
                      {isSelected ? (
                        <ChevronRight className="h-5 w-5 text-white" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onNext} disabled={!selectedNamespace}>
          Next: Review Changes
        </Button>
      </div>
    </div>
  );
}
