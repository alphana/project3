import { useState } from 'react';
import { RouteChange } from '../deployment/types/deployment.types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  FileText,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  RefreshCw,
  Check,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface RouteChangesReviewProps {
  routeChanges: RouteChange[];
  selectedRouteIds: string[];
  onRouteSelectionChange: (routeIds: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function RouteChangesReview({
  routeChanges,
  selectedRouteIds,
  onRouteSelectionChange,
  onNext,
  onBack,
}: RouteChangesReviewProps) {
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

  const toggleRouteSelection = (routeId: string) => {
    if (selectedRouteIds.includes(routeId)) {
      onRouteSelectionChange(selectedRouteIds.filter((id) => id !== routeId));
    } else {
      onRouteSelectionChange([...selectedRouteIds, routeId]);
    }
  };

  const toggleAllRoutes = () => {
    if (selectedRouteIds.length === routeChanges.length) {
      onRouteSelectionChange([]);
    } else {
      onRouteSelectionChange(routeChanges.map((rc) => rc.routeId));
    }
  };

  const toggleExpanded = (routeId: string) => {
    setExpandedRouteId(expandedRouteId === routeId ? null : routeId);
  };

  const renderChangeDetails = (change: RouteChange) => {
    const { changes } = change;

    return (
      <div className="bg-gray-50 rounded-lg p-4 space-y-4 mt-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border-2 border-red-100">
            <h5 className="text-xs font-semibold text-red-900 mb-3 flex items-center gap-2">
              <Minus className="h-4 w-4" />
              Current Version
            </h5>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600 text-xs">Endpoint:</span>
                <div className="font-mono text-xs text-gray-900 mt-1">
                  {change.current.consumerEndpoint.template}
                </div>
                <div className="flex gap-1 mt-1">
                  {change.current.consumerEndpoint.methods.map((method) => (
                    <Badge key={method} variant="default" className="text-xs">
                      {method}
                    </Badge>
                  ))}
                </div>
              </div>

              {changes.lbStrategy && (
                <div>
                  <span className="text-gray-600 text-xs">Load Balancing:</span>
                  <div className="font-medium text-gray-900 text-xs mt-1">
                    {changes.lbStrategy.from}
                  </div>
                </div>
              )}

              {changes.stickyEnabled && (
                <div>
                  <span className="text-gray-600 text-xs">Sticky Sessions:</span>
                  <div className="font-medium text-gray-900 text-xs mt-1">
                    {changes.stickyEnabled.from ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              )}

              {changes.permissions && (
                <div>
                  <span className="text-gray-600 text-xs">Permissions:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {changes.permissions.from.map((perm) => (
                      <Badge key={perm} variant="default" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="text-gray-600 text-xs">Filters:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {change.current.filters.map((filter) => (
                    <Badge
                      key={filter}
                      variant={changes.filters?.removed.includes(filter) ? 'destructive' : 'default'}
                      className="text-xs"
                    >
                      {filter}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border-2 border-green-100">
            <h5 className="text-xs font-semibold text-green-900 mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Proposed Version
            </h5>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600 text-xs">Endpoint:</span>
                <div className="font-mono text-xs text-gray-900 mt-1">
                  {change.proposed.consumerEndpoint.template}
                </div>
                <div className="flex gap-1 mt-1">
                  {change.proposed.consumerEndpoint.methods.map((method) => {
                    const isNew = !change.current.consumerEndpoint.methods.includes(method);
                    return (
                      <Badge
                        key={method}
                        variant={isNew ? 'success' : 'default'}
                        className="text-xs"
                      >
                        {method}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {changes.lbStrategy && (
                <div>
                  <span className="text-gray-600 text-xs">Load Balancing:</span>
                  <div className="font-medium text-green-700 text-xs mt-1">
                    {changes.lbStrategy.to}
                  </div>
                </div>
              )}

              {changes.stickyEnabled && (
                <div>
                  <span className="text-gray-600 text-xs">Sticky Sessions:</span>
                  <div className="font-medium text-green-700 text-xs mt-1">
                    {changes.stickyEnabled.to ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              )}

              {changes.permissions && (
                <div>
                  <span className="text-gray-600 text-xs">Permissions:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {changes.permissions.to.map((perm) => {
                      const isNew = !changes.permissions?.from.includes(perm);
                      return (
                        <Badge
                          key={perm}
                          variant={isNew ? 'success' : 'default'}
                          className="text-xs"
                        >
                          {perm}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <span className="text-gray-600 text-xs">Filters:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {change.proposed.filters.map((filter) => {
                    const isNew = changes.filters?.added.includes(filter);
                    return (
                      <Badge
                        key={filter}
                        variant={isNew ? 'success' : 'default'}
                        className="text-xs"
                      >
                        {filter}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h5 className="text-xs font-semibold text-blue-900 mb-2">Summary of Changes</h5>
          <div className="space-y-1 text-xs text-blue-800">
            {changes.lbStrategy && (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-3 w-3" />
                <span>
                  Load balancing: {changes.lbStrategy.from} → {changes.lbStrategy.to}
                </span>
              </div>
            )}
            {changes.stickyEnabled && (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-3 w-3" />
                <span>
                  Sticky sessions: {changes.stickyEnabled.from ? 'enabled' : 'disabled'} →{' '}
                  {changes.stickyEnabled.to ? 'enabled' : 'disabled'}
                </span>
              </div>
            )}
            {changes.methods && (
              <div className="flex items-center gap-2">
                <Plus className="h-3 w-3" />
                <span>
                  Added methods:{' '}
                  {changes.methods.to.filter((m) => !changes.methods?.from.includes(m)).join(', ')}
                </span>
              </div>
            )}
            {changes.permissions && (
              <div className="flex items-center gap-2">
                <Plus className="h-3 w-3" />
                <span>
                  Added permissions:{' '}
                  {changes.permissions.to
                    .filter((p) => !changes.permissions?.from.includes(p))
                    .join(', ')}
                </span>
              </div>
            )}
            {changes.filters?.added.length > 0 && (
              <div className="flex items-center gap-2">
                <Plus className="h-3 w-3" />
                <span>Added filters: {changes.filters.added.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Route Changes</h2>
        <p className="text-sm text-gray-600">
          Select routes to include in the revision. Click on a route to see detailed changes.
        </p>
      </div>

      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">{selectedRouteIds.length}</span> of{' '}
          <span className="font-medium text-gray-900">{routeChanges.length}</span> routes selected
        </div>
        <Button variant="outline" size="sm" onClick={toggleAllRoutes}>
          {selectedRouteIds.length === routeChanges.length ? 'Deselect All' : 'Select All'}
        </Button>
      </div>

      <div className="space-y-3">
        {routeChanges.map((change) => {
          const isSelected = selectedRouteIds.includes(change.routeId);
          const isExpanded = expandedRouteId === change.routeId;

          return (
            <div
              key={change.routeId}
              className={cn(
                'border-2 rounded-lg transition-all',
                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
              )}
            >
              <div className="flex items-start gap-3 p-4">
                <button
                  onClick={() => toggleRouteSelection(change.routeId)}
                  className={cn(
                    'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors mt-0.5',
                    isSelected
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300 bg-white hover:border-blue-500'
                  )}
                >
                  {isSelected && <Check className="h-3 w-3 text-white" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1">{change.routeName}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                        <span>
                          Version: {change.current.version} → {change.proposed.version}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {change.changes.lbStrategy && (
                          <Badge variant="warning" className="text-xs">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            LB Strategy Changed
                          </Badge>
                        )}
                        {change.changes.methods && (
                          <Badge variant="success" className="text-xs">
                            <Plus className="h-3 w-3 mr-1" />
                            New Methods
                          </Badge>
                        )}
                        {change.changes.permissions && (
                          <Badge variant="default" className="text-xs">
                            Permissions Updated
                          </Badge>
                        )}
                        {change.changes.filters && (
                          <Badge variant="default" className="text-xs">
                            Filters Modified
                          </Badge>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleExpanded(change.routeId)}
                      className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                      )}
                    </button>
                  </div>

                  {isExpanded && renderChangeDetails(change)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={selectedRouteIds.length === 0}>
          Next: Review Summary ({selectedRouteIds.length})
        </Button>
      </div>
    </div>
  );
}
