import { RouteData, WorkloadPod } from '../components/deployment/types/deployment.types';

export function generateMockPods(count: number = 12): WorkloadPod[] {
  const namespaces = [
    { id: 'ns-1', name: 'production-east' },
    { id: 'ns-2', name: 'production-west' },
    { id: 'ns-3', name: 'production-central' },
  ];

  const pods: WorkloadPod[] = [];

  for (let i = 0; i < count; i++) {
    const namespace = namespaces[i % namespaces.length];
    const podNum = Math.floor(i / namespaces.length) + 1;

    pods.push({
      id: `pod-${i + 1}`,
      name: `gateway-pod-${namespace.name}-${podNum}`,
      ip: `10.0.${Math.floor(i / 3)}.${(i % 3) + 10}`,
      nodeName: `node-${Math.floor(i / 4) + 1}`,
      namespace,
    });
  }

  return pods;
}

export function generateMockRoute(): RouteData {
  return {
    id: 'route-1',
    name: '/api/v1/users',
    version: '1.2.3',
    consumerEndpoint: 'https://api.example.com/v1/users',
    gatewayDeployment: {
      id: 'gw-deploy-1',
      name: 'production-gateway',
      revision: 'rev-42',
    },
  };
}
