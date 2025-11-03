import { useState, useCallback, useRef } from 'react';
import {
  DeploymentStrategy,
  WorkloadPod,
  DeploymentEvent,
  PodStatus,
  DeploymentSummaryData,
} from '../types/deployment.types';
import { useDeploymentStrategy } from './useDeploymentStrategy';
import { randomDelay, formatDuration } from '../../../lib/utils';
import { STAGE_DISPLAY_NAMES } from '../types/strategy-configs';

export function useDeploymentSimulation(
  strategy: DeploymentStrategy,
  pods: WorkloadPod[],
  route: { version: string },
  gatewayRevision: string
) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [podStatuses, setPodStatuses] = useState<Map<string, PodStatus>>(new Map());
  const [events, setEvents] = useState<DeploymentEvent[]>([]);
  const [summary, setSummary] = useState<DeploymentSummaryData | null>(null);
  const startTimeRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { config, podBatches } = useDeploymentStrategy(strategy, pods);

  const addEvent = useCallback((event: Omit<DeploymentEvent, 'timestamp'>) => {
    const newEvent: DeploymentEvent = {
      ...event,
      timestamp: Date.now(),
    };
    setEvents((prev) => [...prev, newEvent]);
  }, []);

  const updatePodStatus = useCallback((podId: string, status: PodStatus) => {
    setPodStatuses((prev) => new Map(prev).set(podId, status));
  }, []);

  const simulatePodUpdate = async (
    pod: WorkloadPod,
    _stageIndex: number,
    signal: AbortSignal
  ): Promise<boolean> => {
    if (signal.aborted) return false;

    updatePodStatus(pod.id, 'syncing');
    addEvent({
      type: 'pod_update',
      podId: pod.id,
      status: 'syncing',
      message: `${pod.name} started syncing`,
    });

    await randomDelay(2000, 5000);

    if (signal.aborted) return false;

    if (Math.random() < 0.05) {
      updatePodStatus(pod.id, 'failed');
      addEvent({
        type: 'error',
        podId: pod.id,
        status: 'failed',
        message: `${pod.name} failed: Configuration validation error`,
      });
      return false;
    }

    updatePodStatus(pod.id, 'synced');
    addEvent({
      type: 'pod_update',
      podId: pod.id,
      status: 'synced',
      message: `${pod.name} synced successfully`,
    });

    return true;
  };

  const simulateRollback = async (signal: AbortSignal) => {
    addEvent({
      type: 'rollback',
      message: 'Starting rollback to previous version',
    });

    for (const pod of pods) {
      if (signal.aborted) break;
      updatePodStatus(pod.id, 'rollback');
      await randomDelay(500, 1000);
    }

    await randomDelay(1000, 2000);

    for (const pod of pods) {
      if (signal.aborted) break;
      updatePodStatus(pod.id, 'synced');
    }

    addEvent({
      type: 'rollback',
      message: 'Rollback completed successfully',
    });
  };

  const simulate = useCallback(async () => {
    if (!config) return;

    startTimeRef.current = Date.now();
    setIsRunning(true);
    setSummary(null);
    setEvents([]);
    setCurrentStageIndex(0);

    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    pods.forEach((pod) => updatePodStatus(pod.id, 'pending'));

    let failed = false;
    let syncedCount = 0;

    try {
      for (let i = 0; i < config.stages.length; i++) {
        if (signal.aborted) break;

        const stage = config.stages[i];
        setCurrentStageIndex(i);

        addEvent({
          type: 'stage_start',
          stage,
          message: `Started: ${STAGE_DISPLAY_NAMES[stage] || stage}`,
        });

        await randomDelay(1000, 2000);

        if (stage === 'stop_all_pods') {
          pods.forEach((pod) => updatePodStatus(pod.id, 'pending'));
          await randomDelay(1000, 2000);
        }

        if (
          stage.includes('pod_hotreload') ||
          stage.includes('deploy_canary') ||
          stage.includes('deploy_all')
        ) {
          const batchIndex = i;
          const batch = podBatches[Math.min(batchIndex, podBatches.length - 1)] || pods;

          for (const pod of batch) {
            if (signal.aborted) break;

            const success = await simulatePodUpdate(pod, i, signal);
            if (!success) {
              failed = true;
              break;
            }
            syncedCount++;
          }

          if (failed) break;
        } else {
          await randomDelay(500, 1500);
        }

        if (signal.aborted) break;

        addEvent({
          type: 'stage_complete',
          stage,
          message: `Completed: ${STAGE_DISPLAY_NAMES[stage] || stage}`,
        });
      }

      if (failed && !signal.aborted) {
        await simulateRollback(signal);

        const duration = formatDuration(Date.now() - startTimeRef.current);
        setSummary({
          success: false,
          statistics: {
            routeVersion: { from: route.version, to: route.version },
            deploymentRevision: { from: gatewayRevision, to: gatewayRevision },
            duration,
            strategy,
            podsSynced: { current: syncedCount, total: pods.length, percentage: (syncedCount / pods.length) * 100 },
            healthChecks: { passed: false, details: [] },
          },
          failures: [
            {
              podId: pods[syncedCount]?.id || '',
              podName: pods[syncedCount]?.name || '',
              reason: 'Configuration validation failed',
              stage: 'pod_hotreload',
            },
          ],
          rollbackCompleted: true,
          recommendations: [
            'Fix configuration issues in new version',
            'Verify upstream service connectivity',
            'Test in staging before redeploying',
          ],
        });
      } else if (!signal.aborted) {
        const duration = formatDuration(Date.now() - startTimeRef.current);
        const newRevision = `rev-${parseInt(gatewayRevision.replace('rev-', '')) + 1}`;

        addEvent({
          type: 'complete',
          message: 'Deployment completed successfully',
        });

        setSummary({
          success: true,
          statistics: {
            routeVersion: { from: route.version, to: `${route.version}` },
            deploymentRevision: { from: gatewayRevision, to: newRevision },
            duration,
            strategy,
            podsSynced: { current: pods.length, total: pods.length, percentage: 100 },
            healthChecks: {
              passed: true,
              details: [
                { name: 'HTTP Endpoints', passed: true, count: { passed: pods.length, total: pods.length } },
                { name: 'Configuration', passed: true, message: 'Valid on all pods' },
                { name: 'Upstream Services', passed: true, message: 'All reachable' },
                { name: 'Rate Limits', passed: true, message: 'Applied correctly' },
              ],
            },
          },
        });
      }
    } catch (error) {
      console.error('Deployment simulation error:', error);
    } finally {
      setIsRunning(false);
      setCurrentStageIndex(config.stages.length);
    }
  }, [config, pods, route, gatewayRevision, strategy, podBatches, addEvent, updatePodStatus]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    simulate,
    cancel,
    isRunning,
    currentStageIndex,
    podStatuses,
    events,
    summary,
    stages: config?.stages || [],
  };
}
