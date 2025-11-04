import { RevisionSummary } from './types/revision.types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CheckCircle2, Package, Server, FileText, Calendar } from 'lucide-react';

interface RevisionSummaryStepProps {
  summary: RevisionSummary;
  onCreateRevision: () => void;
  onBack: () => void;
  isCreating?: boolean;
}

export function RevisionSummaryStep({
  summary,
  onCreateRevision,
  onBack,
  isCreating = false,
}: RevisionSummaryStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Revision Summary</h2>
        <p className="text-sm text-gray-600">
          Review the summary and create the revision
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-3 bg-blue-600 rounded-lg">
            <Package className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Revision {summary.revisionNumber}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Server className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{summary.namespace}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-600" />
          Revision Details
        </h3>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {summary.selectedRoutesCount}
            </div>
            <div className="text-xs text-gray-600">Routes Included</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {summary.totalChangesCount}
            </div>
            <div className="text-xs text-gray-600">Total Changes</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600 mb-1">Ready</div>
            <div className="text-xs text-gray-600">Status</div>
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Included Routes</h3>
        <div className="space-y-3">
          {summary.routes.map((route) => {
            const changesCount = Object.keys(route.changes).length;
            return (
              <div
                key={route.routeId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm">{route.routeName}</div>
                  <div className="text-xs text-gray-600">
                    {route.current.version} → {route.proposed.version}
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

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-green-900 mb-1">Ready to Create</h4>
            <p className="text-sm text-green-800">
              This revision will be created as a draft and can be deployed later through the
              deployment process.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack} disabled={isCreating}>
          Back
        </Button>
        <Button onClick={onCreateRevision} disabled={isCreating} className="min-w-[150px]">
          {isCreating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Creating...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Create Revision
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
