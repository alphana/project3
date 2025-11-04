import { useState, useMemo } from 'react';
import { Search, RefreshCw, ChevronRight, Rocket, Package } from 'lucide-react';
import { RevisionData } from './revision/types/revision.types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

interface RevisionsPageProps {
  revisions: RevisionData[];
  onCreateRevision: () => void;
  onDeploy: (revision: RevisionData) => void;
}

export function RevisionsPage({
  revisions,
  onCreateRevision,
  onDeploy,
}: RevisionsPageProps) {
  const [query, setQuery] = useState('');
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [namespaceSort, setNamespaceSort] = useState<'asc' | 'desc' | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return revisions.filter((r) => {
      return q
        ? [
            r.revisionNumber,
            r.namespace,
            r.createdBy,
            r.status,
            r.description || '',
          ].some((v) => v.toLowerCase().includes(q))
        : true;
    });
  }, [revisions, query]);

  const sortedByNamespace = useMemo(() => {
    if (!namespaceSort) return filtered;
    const arr = [...filtered];
    arr.sort((a, b) =>
      namespaceSort === 'asc'
        ? a.namespace.localeCompare(b.namespace, undefined, {
            sensitivity: 'base',
            numeric: true,
          })
        : b.namespace.localeCompare(a.namespace, undefined, {
            sensitivity: 'base',
            numeric: true,
          })
    );
    return arr;
  }, [filtered, namespaceSort]);

  const rows = sortedByNamespace;
  const total = revisions.length;
  const shown = filtered.length;

  const getStatusColor = (status: RevisionData['status']) => {
    switch (status) {
      case 'ready':
        return 'text-green-500';
      case 'deployed':
        return 'text-blue-600';
      case 'draft':
        return 'text-yellow-500';
      default:
        return 'text-gray-400';
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          Revisions ({shown}
          {shown !== total && <span className="text-gray-500">/{total}</span>})
        </h2>

        <Button onClick={onCreateRevision} size="sm">
          <Package className="h-4 w-4 mr-2" />
          Create Revision
        </Button>

        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            aria-label="Refresh revisions"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search revisions (number, namespace, status, creator)…"
          className="w-full h-9 pl-9 pr-9 rounded border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead className="text-xs text-gray-600 bg-gray-50">
            <tr className="grid grid-cols-[40px_180px_1fr_140px_180px_140px_90px]">
              <th className="px-3 py-2 text-left"></th>
              <th className="px-3 py-2 text-left">Revision</th>
              <th className="px-3 py-2 text-left">
                <button
                  className="inline-flex items-center gap-1 cursor-pointer select-none"
                  onClick={() =>
                    setNamespaceSort((prev) =>
                      prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
                    )
                  }
                >
                  Namespace{' '}
                  {namespaceSort === 'asc' ? '🡅' : namespaceSort === 'desc' ? '🡇' : ''}
                </button>
              </th>
              <th className="px-3 py-2 text-left">Routes</th>
              <th className="px-3 py-2 text-left">Created</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {rows.map((revision) => {
              const open = openRow === revision.id;
              return (
                <div key={revision.id}>
                  <tr className="grid grid-cols-[40px_180px_1fr_140px_180px_140px_90px] hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2">
                      <button
                        onClick={() =>
                          setOpenRow((prev) => (prev === revision.id ? null : revision.id))
                        }
                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                      >
                        <ChevronRight
                          className={cn(
                            'h-4 w-4 transition-transform',
                            open ? 'rotate-90' : 'rotate-0'
                          )}
                        />
                      </button>
                    </td>

                    <td className="px-3 py-2 font-medium flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 rounded">
                        <Package className="h-3 w-3 text-blue-600" />
                      </div>
                      <span>{revision.revisionNumber}</span>
                    </td>

                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                        {revision.namespace}
                      </div>
                    </td>

                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{revision.routesCount}</span>
                        <span className="text-xs text-gray-500">
                          {revision.routesCount === 1 ? 'route' : 'routes'}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <span className="text-xs">{formatDate(revision.createdAt)}</span>
                        <span className="text-xs text-gray-500">{revision.createdBy}</span>
                      </div>
                    </td>

                    <td className={cn('px-3 py-2', getStatusColor(revision.status))}>
                      <Badge
                        variant={
                          revision.status === 'deployed'
                            ? 'default'
                            : revision.status === 'ready'
                            ? 'success'
                            : 'default'
                        }
                        className={cn(
                          'text-xs',
                          revision.status === 'deployed' && 'bg-blue-100 text-blue-800'
                        )}
                      >
                        {revision.status}
                      </Badge>
                    </td>

                    <td className="px-3 py-2">
                      {revision.status === 'ready' && (
                        <button
                          onClick={() => onDeploy(revision)}
                          className="p-1.5 hover:bg-blue-50 rounded flex items-center gap-1 text-blue-600"
                          title="Deploy"
                        >
                          <Rocket className="h-4 w-4" />
                        </button>
                      )}
                      {revision.status === 'deployed' && (
                        <span className="text-xs text-gray-500 italic">Deployed</span>
                      )}
                    </td>
                  </tr>

                  {open && (
                    <tr>
                      <td colSpan={7} className="px-6 pb-4">
                        <div className="p-4 bg-gray-50 rounded space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-gray-900">
                              Revision Details
                            </h4>
                          </div>

                          {revision.description && (
                            <div>
                              <div className="text-xs text-gray-600 mb-1">Description</div>
                              <div className="text-sm text-gray-900">
                                {revision.description}
                              </div>
                            </div>
                          )}

                          <div>
                            <div className="text-xs text-gray-600 mb-2">
                              Routes in this Revision
                            </div>
                            <div className="space-y-2">
                              {revision.routes.map((route) => {
                                const changesCount = Object.keys(route.changes).length;
                                return (
                                  <div
                                    key={route.routeId}
                                    className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                                  >
                                    <div className="flex-1">
                                      <div className="font-medium text-sm text-gray-900">
                                        {route.routeName}
                                      </div>
                                      <div className="text-xs text-gray-600">
                                        {route.current.version} → {route.proposed.version}
                                      </div>
                                    </div>
                                    <Badge variant="default" className="text-xs">
                                      {changesCount}{' '}
                                      {changesCount === 1 ? 'change' : 'changes'}
                                    </Badge>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </div>
              );
            })}

            {!rows.length && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  No revisions created yet. Create your first revision to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
