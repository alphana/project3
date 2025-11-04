import { RevisionData } from '../revision/types/revision.types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Package, Calendar, User, FileText, ChevronRight } from 'lucide-react';

interface RevisionDeploymentSummaryProps {
  revision: RevisionData;
  onNext: () => void;
  onCancel: () => void;
}

export function RevisionDeploymentSummary({
  revision,
  onNext,
  onCancel,
}: RevisionDeploymentSummaryProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Deploy Revision</h2>
        <p className="text-sm text-gray-600">
          Review the revision details and select a deployment strategy
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-3 bg-blue-600 rounded-lg">
            <Package className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-xl font-bold text-gray-900">{revision.revisionNumber}</h3>
              <Badge variant="success" className="text-xs">
                Ready to Deploy
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <User className="h-4 w-4 text-blue-600" />
                <span>{revision.createdBy}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>
                  {new Date(revision.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
            {revision.description && (
              <p className="text-sm text-gray-600 mt-2">{revision.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-600" />
          Deployment Details
        </h3>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-600 mb-1">Namespace</div>
            <div className="font-semibold text-gray-900">{revision.namespace}</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-600 mb-1">Routes</div>
            <div className="font-semibold text-gray-900">{revision.routesCount}</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-600 mb-1">Status</div>
            <Badge variant="success" className="text-xs">
              {revision.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Routes in this Revision</h3>
        <div className="space-y-3">
          {revision.routes.map((route) => {
            const changesCount = Object.keys(route.changes).length;
            return (
              <div
                key={route.routeId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm">{route.routeName}</div>
                  <div className="text-xs text-gray-600">
                    Version: {route.current.version} → {route.proposed.version}
                  </div>
                </div>
                <Badge variant="default" className="text-xs">
                  {changesCount} {changesCount === 1 ? 'change' : 'changes'}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onNext}>
          <span>Select Deployment Strategy</span>
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
