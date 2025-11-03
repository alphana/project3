import { useMemo } from 'react';
import { Group } from '@visx/group';
import { hierarchy, Tree } from '@visx/hierarchy';
import { LinkRadial } from '@visx/shape';
import { WorkloadPod, PodStatus, TopologyNode } from './types/deployment.types';
import { cn } from '../../lib/utils';
import * as Tooltip from '@radix-ui/react-tooltip';

interface DeploymentTopologyProps {
  pods: WorkloadPod[];
  podStatuses: Map<string, PodStatus>;
  gatewayName: string;
  width: number;
  height: number;
}

const POD_STATUS_COLORS = {
  pending: '#94a3b8',
  syncing: '#3b82f6',
  synced: '#10b981',
  failed: '#ef4444',
  rollback: '#f59e0b',
};

export function DeploymentTopology({
  pods,
  podStatuses,
  gatewayName,
  width,
  height,
}: DeploymentTopologyProps) {
  const data = useMemo(() => {
    const namespaceMap = new Map<string, WorkloadPod[]>();

    pods.forEach((pod) => {
      const nsId = pod.namespace.id;
      if (!namespaceMap.has(nsId)) {
        namespaceMap.set(nsId, []);
      }
      namespaceMap.get(nsId)!.push(pod);
    });

    const rootNode: TopologyNode = {
      id: 'root',
      name: gatewayName,
      type: 'deployment',
      children: Array.from(namespaceMap.entries()).map(([nsId, nsPods]) => ({
        id: nsId,
        name: nsPods[0].namespace.name,
        type: 'namespace',
        children: nsPods.map((pod) => ({
          id: pod.id,
          name: pod.name,
          type: 'pod',
          status: podStatuses.get(pod.id) || 'pending',
          metadata: {
            ip: pod.ip,
            nodeName: pod.nodeName,
          },
        })),
      })),
    };

    return hierarchy(rootNode);
  }, [pods, podStatuses, gatewayName]);

  const origin = { x: width / 2, y: height / 2 };
  const sizeWidth = 2 * Math.PI;
  const sizeHeight = Math.min(width, height) / 2 - 80;

  if (pods.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        No pods available
      </div>
    );
  }

  const statusCounts = Array.from(podStatuses.values()).reduce((acc, status) => {
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<PodStatus, number>);

  return (
    <Tooltip.Provider>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="text-lg">📊</span> Pod Deployment Topology
            </h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-deployment-synced" />
                <span className="text-gray-600">Synced ({statusCounts.synced || 0})</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-deployment-syncing animate-pulse-slow" />
                <span className="text-gray-600">Syncing ({statusCounts.syncing || 0})</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-deployment-pending" />
                <span className="text-gray-600">Pending ({statusCounts.pending || 0})</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-deployment-failed animate-shake" />
                <span className="text-gray-600">Failed ({statusCounts.failed || 0})</span>
              </div>
            </div>
          </div>
        </div>

        <svg width={width} height={height}>
          <rect width={width} height={height} fill="#fafafa" />
          <Tree
            root={data}
            size={[sizeWidth, sizeHeight]}
            separation={(a, b) => (a.parent === b.parent ? 1 : 2) / a.depth}
          >
            {(tree) => (
              <Group top={origin.y} left={origin.x}>
                {tree.links().map((link, i) => (
                  <LinkRadial
                    key={`link-${i}`}
                    data={link}
                    stroke="#cbd5e1"
                    strokeWidth={2}
                    fill="none"
                    angle={(d: any) => d.x}
                    radius={(d: any) => d.y}
                  />
                ))}

                {tree.descendants().map((node, i) => {
                  const nodeData = node.data as TopologyNode;
                  const radius = node.depth === 0 ? 20 : node.depth === 1 ? 12 : 8;

                  let fillColor = '#94a3b8';
                  if (nodeData.type === 'deployment') {
                    fillColor = '#3b82f6';
                  } else if (nodeData.type === 'namespace') {
                    fillColor = '#8b5cf6';
                  } else if (nodeData.type === 'pod' && nodeData.status) {
                    fillColor = POD_STATUS_COLORS[nodeData.status];
                  }

                  const top = node.x;
                  const left = node.y;

                  return (
                    <Tooltip.Root key={`node-${i}`}>
                      <Tooltip.Trigger asChild>
                        <Group top={top} left={left}>
                          <circle
                            r={radius}
                            fill={fillColor}
                            stroke="white"
                            strokeWidth={2}
                            className={cn(
                              'cursor-pointer transition-all hover:stroke-4',
                              nodeData.status === 'syncing' && 'animate-pulse-slow',
                              nodeData.status === 'failed' && 'animate-shake'
                            )}
                          />
                          {node.depth === 0 && (
                            <text
                              dy=".33em"
                              fontSize={10}
                              fontWeight="bold"
                              textAnchor="middle"
                              fill="white"
                            >
                              GW
                            </text>
                          )}
                        </Group>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="bg-gray-900 text-white text-xs rounded px-3 py-2 shadow-lg max-w-xs z-50"
                          sideOffset={5}
                        >
                          <div className="space-y-1">
                            <div className="font-semibold">{nodeData.name}</div>
                            <div className="text-gray-300">Type: {nodeData.type}</div>
                            {nodeData.status && (
                              <div className="text-gray-300">Status: {nodeData.status}</div>
                            )}
                            {nodeData.metadata?.ip && (
                              <div className="text-gray-300">IP: {nodeData.metadata.ip}</div>
                            )}
                            {nodeData.metadata?.nodeName && (
                              <div className="text-gray-300">Node: {nodeData.metadata.nodeName}</div>
                            )}
                          </div>
                          <Tooltip.Arrow className="fill-gray-900" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  );
                })}
              </Group>
            )}
          </Tree>
        </svg>
      </div>
    </Tooltip.Provider>
  );
}
