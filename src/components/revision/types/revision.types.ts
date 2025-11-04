import { RouteChange } from '../../deployment/types/deployment.types';

export interface WorkloadNamespace {
  id: string;
  name: string;
  routeChangesCount: number;
  totalRoutes: number;
  routeChanges: RouteChange[];
}

export interface RevisionData {
  id: string;
  revisionNumber: string;
  createdAt: string;
  createdBy: string;
  namespace: string;
  routesCount: number;
  status: 'draft' | 'ready' | 'deployed';
  routes: RouteChange[];
  description?: string;
}

export interface RevisionSummary {
  namespace: string;
  selectedRoutesCount: number;
  totalChangesCount: number;
  revisionNumber: string;
  routes: RouteChange[];
}
