import { DeploymentStrategy, WorkloadPod, PodStatus, DeploymentEvent, DeploymentStage } from './types/deployment.types';
import { Progress } from '../ui/Progress';
import { Button } from '../ui/Button';
import { DeploymentTopology } from './DeploymentTopology';
import { DeploymentStageIndicator } from './DeploymentStageIndicator';
import { DeploymentActivityLog } from './DeploymentActivityLog';
import { STRATEGY_CONFIGS } from './types/strategy-configs';

interface DeploymentProgressProps {
  strategy: DeploymentStrategy;
  routeName: string;
  pods: WorkloadPod[];
  podStatuses: Map<string, PodStatus>;
  events: DeploymentEvent[];
  currentStageIndex: number;
  stages: DeploymentStage[];
  isRunning: boolean;
  gatewayName: string;
  onCancel: () => void;
}

export function DeploymentProgress({
  strategy,
  routeName,
  pods,
  podStatuses,
  events,
  currentStageIndex,
  stages,
  isRunning,
  gatewayName,
  onCancel,
}: DeploymentProgressProps) {
  const config = STRATEGY_CONFIGS[strategy];
  const syncedCount = Array.from(podStatuses.values()).filter((s) => s === 'synced').length;
  const progress = (syncedCount / pods.length) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span className="text-xl">🔄</span> Deploying: {routeName}
        </h2>
        <p className="text-sm text-gray-600">
          Strategy: <span className="font-medium">{config.displayName}</span>
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm text-gray-600">
            {syncedCount}/{pods.length} pods ({Math.round(progress)}%)
          </span>
        </div>
        <Progress value={progress} size="lg" />
      </div>

      <DeploymentStageIndicator
        stages={stages}
        currentStageIndex={currentStageIndex}
        isRunning={isRunning}
      />

      <DeploymentTopology
        pods={pods}
        podStatuses={podStatuses}
        gatewayName={gatewayName}
        width={800}
        height={400}
      />

      <DeploymentActivityLog events={events} maxEntries={10} />

      <div className="flex justify-center pt-4 border-t">
        <Button variant="destructive" onClick={onCancel} disabled={!isRunning}>
          Cancel Deployment
        </Button>
      </div>
    </div>
  );
}
