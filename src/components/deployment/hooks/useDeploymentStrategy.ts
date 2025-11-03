import { useMemo } from 'react';
import { DeploymentStrategy, WorkloadPod } from '../types/deployment.types';
import { STRATEGY_CONFIGS } from '../types/strategy-configs';

export function useDeploymentStrategy(strategy: DeploymentStrategy, pods: WorkloadPod[]) {
  const config = STRATEGY_CONFIGS[strategy];

  const podBatches = useMemo(() => {
    if (!config) return [];

    switch (strategy) {
      case 'rolling':
        return pods.map((pod) => [pod]);

      case 'blue-green':
      case 'recreate':
        return [pods];

      case 'canary': {
        const batches: WorkloadPod[][] = [];
        const percentages = config.canaryPercentages || [10, 25, 50, 100];
        let processedCount = 0;

        percentages.forEach((percentage) => {
          const targetCount = Math.ceil((percentage / 100) * pods.length);
          const batchSize = targetCount - processedCount;
          const batch = pods.slice(processedCount, processedCount + batchSize);
          if (batch.length > 0) {
            batches.push(batch);
          }
          processedCount = targetCount;
        });

        return batches;
      }

      default:
        return [pods];
    }
  }, [strategy, pods, config]);

  const getUpdateDelay = (_stageIndex: number) => {
    if (strategy === 'recreate') return 500;
    if (strategy === 'blue-green') return 1000;
    if (strategy === 'canary' && config.metricsWaitTime) {
      return config.metricsWaitTime;
    }
    return config.podUpdateDelay || 5000;
  };

  return {
    config,
    podBatches,
    getUpdateDelay,
  };
}
