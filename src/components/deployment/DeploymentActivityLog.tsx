import { useEffect, useRef } from 'react';
import { DeploymentEvent } from './types/deployment.types';
import { formatTimestamp } from '../../lib/utils';
import { CheckCircle2, Loader2, XCircle, RotateCcw, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DeploymentActivityLogProps {
  events: DeploymentEvent[];
  maxEntries?: number;
}

const EVENT_ICONS = {
  stage_start: Info,
  stage_complete: CheckCircle2,
  pod_update: Loader2,
  rollback: RotateCcw,
  complete: CheckCircle2,
  error: XCircle,
};

const EVENT_COLORS = {
  stage_start: 'text-blue-600',
  stage_complete: 'text-green-600',
  pod_update: 'text-blue-600',
  rollback: 'text-orange-600',
  complete: 'text-green-600',
  error: 'text-red-600',
};

export function DeploymentActivityLog({ events, maxEntries = 10 }: DeploymentActivityLogProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [events]);

  const displayEvents = events.slice(-maxEntries);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span className="text-lg">📝</span> Live Activity Log
        </h3>
      </div>
      <div
        ref={containerRef}
        className="h-64 overflow-y-auto p-4 space-y-2 font-mono text-xs"
      >
        {displayEvents.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            Waiting for deployment to start...
          </div>
        ) : (
          displayEvents.map((event, index) => {
            const Icon = EVENT_ICONS[event.type];
            const colorClass = EVENT_COLORS[event.type];

            return (
              <div
                key={`${event.timestamp}-${index}`}
                className={cn(
                  'flex items-start gap-2 p-2 rounded hover:bg-gray-50 transition-colors',
                  'animate-fade-in'
                )}
              >
                <span className="text-gray-500 flex-shrink-0">
                  {formatTimestamp(event.timestamp)}
                </span>
                <Icon className={cn('h-4 w-4 flex-shrink-0 mt-0.5', colorClass)} />
                <span className="text-gray-700 flex-1">{event.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
