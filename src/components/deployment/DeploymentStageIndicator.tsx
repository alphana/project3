import { DeploymentStage } from './types/deployment.types';
import { STAGE_DISPLAY_NAMES } from './types/strategy-configs';
import { CheckCircle2, Loader2, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DeploymentStageIndicatorProps {
  stages: DeploymentStage[];
  currentStageIndex: number;
  isRunning: boolean;
}

export function DeploymentStageIndicator({
  stages,
  currentStageIndex,
  isRunning,
}: DeploymentStageIndicatorProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Current Stage: {STAGE_DISPLAY_NAMES[stages[currentStageIndex]] || 'Initializing'}{' '}
        (Step {Math.min(currentStageIndex + 1, stages.length)}/{stages.length})
      </h3>
      <div className="space-y-2">
        {stages.map((stage, index) => {
          const isCompleted = index < currentStageIndex;
          const isCurrent = index === currentStageIndex && isRunning;
          const isPending = index > currentStageIndex;

          return (
            <div
              key={`${stage}-${index}`}
              className={cn(
                'flex items-center gap-3 p-2 rounded transition-colors',
                isCurrent && 'bg-blue-50'
              )}
            >
              <div className="flex-shrink-0">
                {isCompleted && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                {isCurrent && (
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                )}
                {isPending && (
                  <Clock className="h-5 w-5 text-gray-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isCompleted && 'text-green-600',
                      isCurrent && 'text-blue-600',
                      isPending && 'text-gray-400'
                    )}
                  >
                    {index + 1}. {STAGE_DISPLAY_NAMES[stage] || stage}
                  </span>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      isCompleted && 'bg-green-100 text-green-700',
                      isCurrent && 'bg-blue-100 text-blue-700',
                      isPending && 'bg-gray-100 text-gray-500'
                    )}
                  >
                    {isCompleted && 'Completed'}
                    {isCurrent && 'In Progress'}
                    {isPending && 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
