import { RevisionData } from './types/revision.types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Package, Calendar, User, FileText, Rocket, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RevisionsDataTableProps {
  revisions: RevisionData[];
  onDeploy?: (revision: RevisionData) => void;
}

export function RevisionsDataTable({ revisions, onDeploy }: RevisionsDataTableProps) {
  const getStatusVariant = (status: RevisionData['status']) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'ready':
        return 'success';
      case 'deployed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: RevisionData['status']) => {
    switch (status) {
      case 'ready':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'deployed':
        return <Rocket className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (revisions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <Package className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Revisions Yet</h3>
        <p className="text-sm text-gray-600 mb-4">
          Create your first revision to get started with deployments.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Package className="h-5 w-5 text-gray-600" />
          Revisions
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {revisions.length} {revisions.length === 1 ? 'revision' : 'revisions'} created
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Revision
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Namespace
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Routes
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Created By
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {revisions.map((revision) => (
              <tr key={revision.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{revision.revisionNumber}</div>
                      {revision.description && (
                        <div className="text-xs text-gray-500">{revision.description}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                    {revision.namespace}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{revision.routesCount}</div>
                  <div className="text-xs text-gray-500">
                    {revision.routesCount === 1 ? 'route' : 'routes'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    variant={getStatusVariant(revision.status)}
                    className={cn(
                      'text-xs',
                      revision.status === 'deployed' && 'bg-green-100 text-green-800'
                    )}
                  >
                    {getStatusIcon(revision.status)}
                    <span className="ml-1 capitalize">{revision.status}</span>
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {formatDate(revision.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    {revision.createdBy}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {revision.status === 'ready' && onDeploy && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeploy(revision)}
                      className="text-xs"
                    >
                      <Rocket className="h-3 w-3 mr-1" />
                      Deploy
                    </Button>
                  )}
                  {revision.status === 'deployed' && (
                    <span className="text-xs text-gray-500 italic">Deployed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
