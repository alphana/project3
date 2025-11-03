import { ApprovalState } from './types/deployment.types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, GitBranch } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TrafficSwitchApprovalProps {
  approvalState: ApprovalState;
  onApprove: () => void;
  onReject: () => void;
}

export function TrafficSwitchApproval({
  approvalState,
  onApprove,
  onReject,
}: TrafficSwitchApprovalProps) {
  const { greenEnvironmentHealth } = approvalState;

  if (!greenEnvironmentHealth) return null;

  const allHealthChecksPassed = greenEnvironmentHealth.healthChecksPassed;
  const readinessPercentage =
    (greenEnvironmentHealth.podsReady / greenEnvironmentHealth.podsTotal) * 100;

  return (
    <div className="border-2 border-blue-500 rounded-lg bg-blue-50 p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-blue-600" />
            Traffic Switch Approval Required
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Green environment is ready. Review the health status and approve the traffic switch.
          </p>
        </div>
        <Badge variant={allHealthChecksPassed ? 'success' : 'warning'} className="text-xs">
          {allHealthChecksPassed ? 'All Checks Passed' : 'Checks In Progress'}
        </Badge>
      </div>

      <div className="bg-white rounded-lg p-4 space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Green Environment Status</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pods Ready:</span>
              <span className="text-sm font-medium text-gray-900">
                {greenEnvironmentHealth.podsReady} / {greenEnvironmentHealth.podsTotal} (
                {Math.round(readinessPercentage)}%)
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={cn(
                  'h-2 rounded-full transition-all',
                  readinessPercentage === 100 ? 'bg-green-600' : 'bg-yellow-500'
                )}
                style={{ width: `${readinessPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Health Check Results</h4>
          <div className="space-y-2">
            {greenEnvironmentHealth.healthCheckDetails.map((check, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg',
                  check.passed ? 'bg-green-50' : 'bg-red-50'
                )}
              >
                {check.passed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        check.passed ? 'text-green-900' : 'text-red-900'
                      )}
                    >
                      {check.name}
                    </span>
                    {check.count && (
                      <span className="text-xs text-gray-600">
                        {check.count.passed}/{check.count.total}
                      </span>
                    )}
                  </div>
                  {check.message && (
                    <p
                      className={cn(
                        'text-xs mt-0.5',
                        check.passed ? 'text-green-700' : 'text-red-700'
                      )}
                    >
                      {check.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-yellow-900 mb-1">Important</h4>
            <p className="text-sm text-yellow-800">
              Approving this action will instantly switch all traffic from Blue to Green environment.
              Blue environment will be kept available for quick rollback if needed.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-blue-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600" />
            <span className="font-medium">Blue</span>
            <span className="text-xs">(Current)</span>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400" />
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600" />
            <span className="font-medium">Green</span>
            <span className="text-xs">(Target)</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onReject}>
            <XCircle className="h-4 w-4 mr-2" />
            Reject & Rollback
          </Button>
          <Button
            onClick={onApprove}
            disabled={!allHealthChecksPassed}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Approve Traffic Switch
          </Button>
        </div>
      </div>
    </div>
  );
}
