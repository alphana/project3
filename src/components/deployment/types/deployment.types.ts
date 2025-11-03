export type PodStatus = 'pending' | 'syncing' | 'synced' | 'failed' | 'rollback';

export type DeploymentEnvironment = 'blue' | 'green';

export type DeploymentStrategy = 'rolling' | 'blue-green' | 'canary' | 'recreate';

export type DeploymentStage =
  | 'notify_pods'
  | 'pod_backup'
  | 'read_config'
  | 'read_config_all'
  | 'pod_hotreload'
  | 'pod_hotreload_all'
  | 'ready_to_traffic'
  | 'ready_to_traffic_all'
  | 'takes_traffic'
  | 'takes_traffic_all'
  | 'stop_all_pods'
  | 'start_all_pods'
  | 'deploy_canary_10'
  | 'deploy_canary_25'
  | 'deploy_canary_50'
  | 'deploy_all_100'
  | 'monitor_metrics'
  | 'switch_traffic'
  | 'prepare_green_environment'
  | 'validate_green_environment'
  | 'await_traffic_switch'
  | 'switch_traffic_to_green'
  | 'verify_green_traffic';

export type DeploymentEventType =
  | 'stage_start'
  | 'stage_complete'
  | 'pod_update'
  | 'rollback'
  | 'complete'
  | 'error'
  | 'awaiting_approval'
  | 'approval_granted'
  | 'approval_rejected';

export interface WorkloadPod {
  id: string;
  name: string;
  ip: string;
  nodeName: string;
  namespace: {
    id: string;
    name: string;
  };
  status?: PodStatus;
  currentStage?: number;
  environment?: DeploymentEnvironment;
}

export interface RouteData {
  id: string;
  name: string;
  version: string;
  consumerEndpoint: {
    template: string;
    methods: string[];
  };
  lbStrategy: string;
  stickyEnabled: boolean;
  authorization: {
    authenticateBy: string;
    permissions: string[];
  };
  filters: string[];
  gatewayDeployment: {
    id: string;
    name: string;
    revision: string;
  };
}

export interface RouteChange {
  routeId: string;
  routeName: string;
  current: RouteData;
  proposed: RouteData;
  changes: {
    lbStrategy?: { from: string; to: string };
    stickyEnabled?: { from: boolean; to: boolean };
    methods?: { from: string[]; to: string[] };
    permissions?: { from: string[]; to: string[] };
    filters?: { added: string[]; removed: string[] };
  };
}

export interface GatewayDeploymentInfo {
  id: string;
  name: string;
  currentRevision: string;
  targetRevision: string;
  namespaces: NamespaceInfo[];
}

export interface NamespaceInfo {
  id: string;
  name: string;
  podCount: number;
}

export interface DeploymentEvent {
  type: DeploymentEventType;
  timestamp: number;
  podId?: string;
  stage?: string;
  status?: PodStatus;
  message: string;
}

export interface TopologyNode {
  id: string;
  name: string;
  type: 'deployment' | 'namespace' | 'pod';
  status?: PodStatus;
  children?: TopologyNode[];
  metadata?: {
    ip?: string;
    nodeName?: string;
    currentStage?: number;
    revision?: string;
  };
}

export interface StrategyConfig {
  name: DeploymentStrategy;
  displayName: string;
  description: string;
  features: string[];
  stages: DeploymentStage[];
  icon: string;
  recommended?: boolean;
  warning?: boolean;
  maxUnavailable?: number;
  maxSurge?: number;
  podUpdateDelay?: number;
  healthCheckDelay?: number;
  canaryPercentages?: number[];
  metricsWaitTime?: number;
  environmentSwitch?: 'instant' | 'gradual';
  downtimeExpected?: boolean;
  requiresManualApproval?: boolean;
  supportsInstantSwitch?: boolean;
  hasMultipleEnvironments?: boolean;
}

export interface DeploymentStatistics {
  routeVersion: {
    from: string;
    to: string;
  };
  deploymentRevision: {
    from: string;
    to: string;
  };
  duration?: string;
  strategy: DeploymentStrategy;
  podsSynced: {
    current: number;
    total: number;
    percentage: number;
  };
  healthChecks: {
    passed: boolean;
    details: HealthCheckResult[];
  };
  blueGreenInfo?: {
    greenEnvironmentReady: boolean;
    trafficSwitchTime?: string;
    approvalTime?: string;
    blueEnvironmentKept: boolean;
  };
}

export interface HealthCheckResult {
  name: string;
  passed: boolean;
  count?: {
    passed: number;
    total: number;
  };
  message?: string;
}

export interface DeploymentFailure {
  podId: string;
  podName: string;
  reason: string;
  stage: string;
}

export interface DeploymentSummaryData {
  success: boolean;
  statistics: DeploymentStatistics;
  failures?: DeploymentFailure[];
  rollbackCompleted?: boolean;
  recommendations?: string[];
}

export interface ApprovalState {
  isWaitingForApproval: boolean;
  approvalStage?: DeploymentStage;
  greenEnvironmentHealth?: {
    podsReady: number;
    podsTotal: number;
    healthChecksPassed: boolean;
    healthCheckDetails: HealthCheckResult[];
  };
}

export interface RollingUpdateConfigOptions {
  maxUnavailable: number;
  maxSurge: number;
  podUpdateDelay: number;
  healthCheckDelay: number;
}

export interface BlueGreenConfigOptions {
  validateAllHealthChecks: boolean;
  trafficSwitchDelay: number;
  keepOldEnvironment: boolean;
}

export interface CanaryConfigOptions {
  initialPercentage: number;
  incrementPercentage: number;
  metricsWaitTime: number;
  errorThreshold: number;
  autoRollbackOnError: boolean;
}

export interface RecreateConfigOptions {
  preShutdownDelay: number;
  postStartupDelay: number;
}

export type StrategyConfigOptions =
  | RollingUpdateConfigOptions
  | BlueGreenConfigOptions
  | CanaryConfigOptions
  | RecreateConfigOptions;

export interface StrategyConfigState {
  strategy: DeploymentStrategy;
  options: StrategyConfigOptions;
}
