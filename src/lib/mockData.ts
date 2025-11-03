import {
  RouteData,
  WorkloadPod,
  RouteChange,
  GatewayDeploymentInfo,
} from '../components/deployment/types/deployment.types';

export function generateMockPods(count: number = 12, namespaceName: string = 'production-east'): WorkloadPod[] {
  const namespace = {
    id: `ns-${namespaceName}`,
    name: namespaceName,
  };

  const pods: WorkloadPod[] = [];

  for (let i = 0; i < count; i++) {
    pods.push({
      id: `pod-${i + 1}`,
      name: `gateway-pod-${namespace.name}-${i + 1}`,
      ip: `10.0.${Math.floor(i / 10)}.${(i % 10) + 10}`,
      nodeName: `node-${Math.floor(i / 4) + 1}`,
      namespace,
    });
  }

  return pods;
}

export function generateMockGatewayDeployment(): GatewayDeploymentInfo {
  return {
    id: 'gw-deploy-1',
    name: 'production-gateway',
    currentRevision: 'rev-41',
    targetRevision: 'rev-42',
    namespaces: [
      { id: 'ns-1', name: 'production-east', podCount: 12 },
      { id: 'ns-2', name: 'production-west', podCount: 8 },
      { id: 'ns-3', name: 'production-central', podCount: 10 },
    ],
  };
}

export function generateMockRouteChanges(): RouteChange[] {
  const currentRoutes: RouteData[] = [
    {
      id: 'route-1',
      name: 'simple_route_1',
      version: '1.2.3',
      consumerEndpoint: {
        template: '/process_product/{id}',
        methods: ['GET', 'POST'],
      },
      lbStrategy: 'round_robin',
      stickyEnabled: false,
      authorization: {
        authenticateBy: 'oidc_token',
        permissions: ['read:products', 'write:products'],
      },
      filters: ['rate_limit', 'auth_check'],
      gatewayDeployment: {
        id: 'gw-deploy-1',
        name: 'production-gateway',
        revision: 'rev-41',
      },
    },
    {
      id: 'route-2',
      name: 'order_route',
      version: '2.1.0',
      consumerEndpoint: {
        template: '/api/orders/{orderId}',
        methods: ['GET', 'PUT', 'DELETE'],
      },
      lbStrategy: 'weighted_round_robin',
      stickyEnabled: true,
      authorization: {
        authenticateBy: 'oidc_token',
        permissions: ['read:orders', 'write:orders', 'delete:orders'],
      },
      filters: ['rate_limit', 'auth_check', 'log_requests'],
      gatewayDeployment: {
        id: 'gw-deploy-1',
        name: 'production-gateway',
        revision: 'rev-41',
      },
    },
    {
      id: 'route-3',
      name: 'user_profile_route',
      version: '1.5.2',
      consumerEndpoint: {
        template: '/api/users/{userId}/profile',
        methods: ['GET', 'PATCH'],
      },
      lbStrategy: 'round_robin',
      stickyEnabled: false,
      authorization: {
        authenticateBy: 'oidc_token',
        permissions: ['read:users', 'write:users'],
      },
      filters: ['rate_limit', 'auth_check'],
      gatewayDeployment: {
        id: 'gw-deploy-1',
        name: 'production-gateway',
        revision: 'rev-41',
      },
    },
    {
      id: 'route-4',
      name: 'payment_route',
      version: '3.0.1',
      consumerEndpoint: {
        template: '/api/payments',
        methods: ['POST'],
      },
      lbStrategy: 'least_connections',
      stickyEnabled: true,
      authorization: {
        authenticateBy: 'oidc_token',
        permissions: ['payment:process'],
      },
      filters: ['rate_limit', 'auth_check', 'encrypt_data'],
      gatewayDeployment: {
        id: 'gw-deploy-1',
        name: 'production-gateway',
        revision: 'rev-41',
      },
    },
  ];

  const proposedRoutes: RouteData[] = [
    {
      ...currentRoutes[0],
      version: '1.3.0',
      lbStrategy: 'weighted_round_robin',
      stickyEnabled: true,
      gatewayDeployment: {
        ...currentRoutes[0].gatewayDeployment,
        revision: 'rev-42',
      },
    },
    {
      ...currentRoutes[1],
      version: '2.2.0',
      consumerEndpoint: {
        template: '/api/orders/{orderId}',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
      },
      authorization: {
        authenticateBy: 'oidc_token',
        permissions: ['read:orders', 'write:orders', 'delete:orders', 'admin:orders'],
      },
      filters: ['rate_limit', 'auth_check', 'log_requests', 'cache_response'],
      gatewayDeployment: {
        ...currentRoutes[1].gatewayDeployment,
        revision: 'rev-42',
      },
    },
    {
      ...currentRoutes[2],
      version: '1.5.3',
      consumerEndpoint: {
        template: '/api/users/{userId}/profile',
        methods: ['GET', 'PATCH', 'DELETE'],
      },
      authorization: {
        authenticateBy: 'oidc_token',
        permissions: ['read:users'],
      },
      gatewayDeployment: {
        ...currentRoutes[2].gatewayDeployment,
        revision: 'rev-42',
      },
    },
  ];

  return [
    {
      routeId: 'route-1',
      routeName: 'simple_route_1',
      current: currentRoutes[0],
      proposed: proposedRoutes[0],
      changes: {
        lbStrategy: { from: 'round_robin', to: 'weighted_round_robin' },
        stickyEnabled: { from: false, to: true },
      },
    },
    {
      routeId: 'route-2',
      routeName: 'order_route',
      current: currentRoutes[1],
      proposed: proposedRoutes[1],
      changes: {
        methods: { from: ['GET', 'PUT', 'DELETE'], to: ['GET', 'POST', 'PUT', 'DELETE'] },
        permissions: {
          from: ['read:orders', 'write:orders', 'delete:orders'],
          to: ['read:orders', 'write:orders', 'delete:orders', 'admin:orders']
        },
        filters: { added: ['cache_response'], removed: [] },
      },
    },
    {
      routeId: 'route-3',
      routeName: 'user_profile_route',
      current: currentRoutes[2],
      proposed: proposedRoutes[2],
      changes: {
        methods: { from: ['GET', 'PATCH'], to: ['GET', 'PATCH', 'DELETE'] },
        permissions: {
          from: ['read:users', 'write:users'],
          to: ['read:users']
        },
      },
    },
  ];
}
