import { DeploymentSummaryData } from './types/deployment.types';
import { Button } from '../ui/Button';
import { CheckCircle2, XCircle, AlertTriangle, FileText, RotateCcw } from 'lucide-react';

interface DeploymentSummaryProps {
  summary: DeploymentSummaryData;
  onClose: () => void;
  onRetry?: () => void;
  onViewLogs?: () => void;
}

export function DeploymentSummary({
  summary,
  onClose,
  onRetry,
  onViewLogs,
}: DeploymentSummaryProps) {
  const { success, statistics, failures, rollbackCompleted, recommendations } = summary;

  return (
    <div className="space-y-6">
      <div className="text-center">
        {success ? (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Deployment Completed Successfully</h2>
            <p className="text-gray-600">Route deployed successfully to production</p>
          </>
        ) : (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Deployment Failed</h2>
            <p className="text-gray-600">Deployment encountered errors and was rolled back</p>
          </>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span className="text-lg">📊</span> Deployment Statistics
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Route Version:</span>
            <span className="font-medium text-gray-900">
              {statistics.routeVersion.from}
              {!success && ` (attempted ${statistics.routeVersion.to})`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Deployment Revision:</span>
            <span className="font-medium text-gray-900">
              {statistics.deploymentRevision.from} → {statistics.deploymentRevision.to}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium text-gray-900">{statistics.duration}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Strategy:</span>
            <span className="font-medium text-gray-900 capitalize">{statistics.strategy}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Pods Synced:</span>
            <span className="font-medium text-gray-900">
              {statistics.podsSynced.current}/{statistics.podsSynced.total} (
              {Math.round(statistics.podsSynced.percentage)}%)
            </span>
          </div>
        </div>
      </div>

      {success && statistics.healthChecks.passed && (
        <div className="bg-green-50 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-green-800 flex items-center gap-2">
            <span className="text-lg">🏥</span> Health Check Results
          </h3>
          <div className="space-y-2">
            {statistics.healthChecks.details.map((check, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium">{check.name}:</span>
                <span>
                  {check.count
                    ? `${check.count.passed}/${check.count.total} responding`
                    : check.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!success && failures && failures.length > 0 && (
        <div className="bg-red-50 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-red-800 flex items-center gap-2">
            <span className="text-lg">❌</span> Failure Reasons
          </h3>
          <div className="space-y-2">
            {failures.map((failure, index) => (
              <div key={index} className="text-sm text-red-700">
                <span className="font-medium">{index + 1}. {failure.podName}:</span>{' '}
                {failure.reason}
              </div>
            ))}
          </div>
        </div>
      )}

      {!success && rollbackCompleted && (
        <div className="bg-orange-50 rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-semibold text-orange-800 flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Rollback Completed
          </h3>
          <p className="text-sm text-orange-700">
            All pods reverted to version {statistics.routeVersion.from}
          </p>
          <p className="text-sm text-orange-700">
            Current route is stable and serving traffic
          </p>
        </div>
      )}

      {success && (
        <div className="bg-blue-50 rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
            <span className="text-lg">📈</span> Next Steps
          </h3>
          <ul className="space-y-1 text-sm text-blue-700">
            <li>• Monitor route traffic in Analytics</li>
            <li>• Review deployment logs</li>
            <li>• Version {statistics.routeVersion.to} is now live</li>
          </ul>
        </div>
      )}

      {!success && recommendations && (
        <div className="bg-yellow-50 rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-semibold text-yellow-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Recommended Actions
          </h3>
          <ul className="space-y-1 text-sm text-yellow-700">
            {recommendations.map((rec, index) => (
              <li key={index}>• {rec}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-center gap-3 pt-4 border-t">
        {onViewLogs && (
          <Button variant="outline" onClick={onViewLogs}>
            <FileText className="h-4 w-4 mr-2" />
            View Logs
          </Button>
        )}
        {!success && onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}
