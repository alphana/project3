import { useState } from 'react';
import { RouteChange } from './types/deployment.types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ChevronDown, ChevronRight, GitCompare, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RouteSelectionStepProps {
  routeChanges: RouteChange[];
  selectedRouteIds: string[];
  onRouteSelectionChange: (routeIds: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function RouteSelectionStep({
  routeChanges,
  selectedRouteIds,
  onRouteSelectionChange,
  onNext,
  onBack,
}: RouteSelectionStepProps) {
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

  const toggleRoute = (routeId: string) => {
    if (selectedRouteIds.includes(routeId)) {
      onRouteSelectionChange(selectedRouteIds.filter((id) => id !== routeId));
    } else {
      onRouteSelectionChange([...selectedRouteIds, routeId]);
    }
  };

  const toggleExpand = (routeId: string) => {
    setExpandedRouteId(expandedRouteId === routeId ? null : routeId);
  };

  const selectAll = () => {
    onRouteSelectionChange(routeChanges.map((rc) => rc.routeId));
  };

  const deselectAll = () => {
    onRouteSelectionChange([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Routes for Deployment</h2>
        <p className="text-sm text-gray-600">
          Choose which routes to include in this deployment
        </p>
      </div>

      <div className="bg-amber-50 rounded-lg p-4 flex gap-3 border border-amber-200">
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-medium mb-1">{routeChanges.length} routes have changes</p>
          <p>Review each route's changes and select which ones to deploy to the target revision.</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {selectedRouteIds.length} of {routeChanges.length} routes selected
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={selectAll}>
            Select All
          </Button>
          <Button variant="ghost" size="sm" onClick={deselectAll}>
            Deselect All
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {routeChanges.map((routeChange) => {
          const isSelected = selectedRouteIds.includes(routeChange.routeId);
          const isExpanded = expandedRouteId === routeChange.routeId;
          const changeCount = Object.keys(routeChange.changes).length;

          return (
            <div
              key={routeChange.routeId}
              className={cn(
                'border-2 rounded-lg transition-all',
                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
              )}
            >
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleRoute(routeChange.routeId)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />

                  <button
                    onClick={() => toggleExpand(routeChange.routeId)}
                    className="flex-1 flex items-center gap-3 text-left"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{routeChange.routeName}</h4>
                        <Badge variant="secondary">
                          {routeChange.current.version} → {routeChange.proposed.version}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {routeChange.current.consumerEndpoint.template}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <GitCompare className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">
                        {changeCount} {changeCount === 1 ? 'change' : 'changes'}
                      </span>
                    </div>
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 pl-7 border-t pt-4">
                    <RouteComparison routeChange={routeChange} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between gap-3 pt-4 border-t">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <Button onClick={onNext} disabled={selectedRouteIds.length === 0}>
          Next: Deployment Strategy →
        </Button>
      </div>
    </div>
  );
}

function RouteComparison({ routeChange }: { routeChange: RouteChange }) {
  const { current, proposed, changes } = routeChange;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h5 className="text-xs font-semibold text-gray-500 mb-2">CURRENT (rev-41)</h5>
        </div>
        <div>
          <h5 className="text-xs font-semibold text-gray-500 mb-2">PROPOSED (rev-42)</h5>
        </div>
      </div>

      <div className="space-y-3">
        {changes.lbStrategy && (
          <ComparisonRow
            label="Load Balancer Strategy"
            current={changes.lbStrategy.from}
            proposed={changes.lbStrategy.to}
          />
        )}

        {changes.stickyEnabled !== undefined && (
          <ComparisonRow
            label="Sticky Sessions"
            current={changes.stickyEnabled.from ? 'Enabled' : 'Disabled'}
            proposed={changes.stickyEnabled.to ? 'Enabled' : 'Disabled'}
          />
        )}

        {changes.methods && (
          <ComparisonRow
            label="HTTP Methods"
            current={changes.methods.from.join(', ')}
            proposed={changes.methods.to.join(', ')}
          />
        )}

        {changes.permissions && (
          <ComparisonRow
            label="Permissions"
            current={
              <div className="space-y-1">
                {changes.permissions.from.map((perm) => (
                  <div key={perm} className="text-sm">
                    {perm}
                  </div>
                ))}
              </div>
            }
            proposed={
              <div className="space-y-1">
                {changes.permissions.to.map((perm) => {
                  const isNew = !changes.permissions!.from.includes(perm);
                  return (
                    <div key={perm} className={cn('text-sm', isNew && 'text-green-700 font-medium')}>
                      {isNew && '+ '}
                      {perm}
                    </div>
                  );
                })}
                {changes.permissions.from
                  .filter((perm) => !changes.permissions!.to.includes(perm))
                  .map((perm) => (
                    <div key={perm} className="text-sm text-red-700 line-through">
                      {perm}
                    </div>
                  ))}
              </div>
            }
          />
        )}

        {changes.filters && (
          <div className="grid grid-cols-2 gap-4 pb-2 border-b">
            <div className="text-xs font-medium text-gray-700">Filters</div>
            <div className="col-span-2 grid grid-cols-2 gap-4 text-sm">
              <div>
                {current.filters.map((filter) => {
                  const isRemoved = changes.filters?.removed.includes(filter);
                  return (
                    <div
                      key={filter}
                      className={cn('py-1', isRemoved && 'text-red-700 line-through')}
                    >
                      {filter}
                    </div>
                  );
                })}
              </div>
              <div>
                {proposed.filters.map((filter) => {
                  const isNew = changes.filters?.added.includes(filter);
                  return (
                    <div key={filter} className={cn('py-1', isNew && 'text-green-700 font-medium')}>
                      {isNew && '+ '}
                      {filter}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ComparisonRow({
  label,
  current,
  proposed,
}: {
  label: string;
  current: React.ReactNode;
  proposed: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 pb-2 border-b">
      <div className="col-span-2 text-xs font-medium text-gray-700 mb-1">{label}</div>
      <div className="text-sm text-gray-900 bg-red-50 px-3 py-2 rounded border border-red-200">
        {current}
      </div>
      <div className="text-sm text-gray-900 bg-green-50 px-3 py-2 rounded border border-green-200">
        {proposed}
      </div>
    </div>
  );
}
