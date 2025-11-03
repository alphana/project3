import { useState } from 'react';
import {
  DeploymentStrategy,
  RollingUpdateConfigOptions,
  BlueGreenConfigOptions,
  CanaryConfigOptions,
  RecreateConfigOptions,
  StrategyConfigOptions,
} from './types/deployment.types';
import { STRATEGY_CONFIGS } from './types/strategy-configs';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Info } from 'lucide-react';

interface DeploymentStrategyConfigProps {
  strategy: DeploymentStrategy;
  onConfigChange: (options: StrategyConfigOptions) => void;
  onNext: () => void;
  onBack: () => void;
}

const DEFAULT_ROLLING_UPDATE: RollingUpdateConfigOptions = {
  maxUnavailable: 1,
  maxSurge: 1,
  podUpdateDelay: 5000,
  healthCheckDelay: 2000,
};

const DEFAULT_BLUE_GREEN: BlueGreenConfigOptions = {
  validateAllHealthChecks: true,
  trafficSwitchDelay: 2000,
  keepOldEnvironment: true,
};

const DEFAULT_CANARY: CanaryConfigOptions = {
  initialPercentage: 10,
  incrementPercentage: 15,
  metricsWaitTime: 10000,
  errorThreshold: 5,
  autoRollbackOnError: true,
};

const DEFAULT_RECREATE: RecreateConfigOptions = {
  preShutdownDelay: 1000,
  postStartupDelay: 3000,
};

export function DeploymentStrategyConfig({
  strategy,
  onConfigChange,
  onNext,
  onBack,
}: DeploymentStrategyConfigProps) {
  const strategyConfig = STRATEGY_CONFIGS[strategy];
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [config, setConfig] = useState<StrategyConfigOptions>(() => {
    switch (strategy) {
      case 'rolling':
        return DEFAULT_ROLLING_UPDATE;
      case 'blue-green':
        return DEFAULT_BLUE_GREEN;
      case 'canary':
        return DEFAULT_CANARY;
      case 'recreate':
        return DEFAULT_RECREATE;
    }
  });

  const handleChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onConfigChange(newConfig);

    if (errors[key]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }
  };

  const validateAndSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (strategy === 'rolling') {
      const cfg = config as RollingUpdateConfigOptions;
      if (cfg.maxUnavailable < 1) {
        newErrors.maxUnavailable = 'Must be at least 1';
      }
      if (cfg.maxSurge < 0) {
        newErrors.maxSurge = 'Cannot be negative';
      }
      if (cfg.podUpdateDelay < 100) {
        newErrors.podUpdateDelay = 'Minimum delay is 100ms';
      }
    }

    if (strategy === 'canary') {
      const cfg = config as CanaryConfigOptions;
      if (cfg.initialPercentage < 5 || cfg.initialPercentage > 50) {
        newErrors.initialPercentage = 'Must be between 5% and 50%';
      }
      if (cfg.incrementPercentage < 5 || cfg.incrementPercentage > 50) {
        newErrors.incrementPercentage = 'Must be between 5% and 50%';
      }
      if (cfg.errorThreshold < 0 || cfg.errorThreshold > 100) {
        newErrors.errorThreshold = 'Must be between 0% and 100%';
      }
      if (cfg.metricsWaitTime < 1000) {
        newErrors.metricsWaitTime = 'Minimum wait time is 1000ms';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Configure {strategyConfig.displayName}
        </h2>
        <p className="text-sm text-gray-600">
          Customize the deployment parameters for your strategy
        </p>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 flex gap-3">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">Strategy Details</p>
          <p>{strategyConfig.description}</p>
        </div>
      </div>

      <div className="space-y-6">
        {strategy === 'rolling' && (
          <RollingUpdateConfig
            config={config as RollingUpdateConfigOptions}
            onConfigChange={handleChange}
            errors={errors}
          />
        )}

        {strategy === 'blue-green' && (
          <BlueGreenConfig
            config={config as BlueGreenConfigOptions}
            onConfigChange={handleChange}
            errors={errors}
          />
        )}

        {strategy === 'canary' && (
          <CanaryConfig
            config={config as CanaryConfigOptions}
            onConfigChange={handleChange}
            errors={errors}
          />
        )}

        {strategy === 'recreate' && (
          <RecreateConfig
            config={config as RecreateConfigOptions}
            onConfigChange={handleChange}
            errors={errors}
          />
        )}
      </div>

      <div className="flex justify-between gap-3 pt-4 border-t">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <Button onClick={validateAndSubmit}>
          Continue to Deployment →
        </Button>
      </div>
    </div>
  );
}

function RollingUpdateConfig({
  config,
  onConfigChange,
  errors,
}: {
  config: RollingUpdateConfigOptions;
  onConfigChange: (key: string, value: any) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Max Unavailable Pods
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            min="1"
            value={config.maxUnavailable}
            onChange={(e) => onConfigChange('maxUnavailable', parseInt(e.target.value))}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.maxUnavailable ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.maxUnavailable && (
            <p className="text-sm text-red-600">{errors.maxUnavailable}</p>
          )}
          <p className="text-xs text-gray-500">
            Maximum number of pods that can be down simultaneously
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Max Surge Pods
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            min="0"
            value={config.maxSurge}
            onChange={(e) => onConfigChange('maxSurge', parseInt(e.target.value))}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.maxSurge ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.maxSurge && <p className="text-sm text-red-600">{errors.maxSurge}</p>}
          <p className="text-xs text-gray-500">
            Maximum extra pods allowed during update
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Pod Update Delay (ms)
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            min="100"
            step="100"
            value={config.podUpdateDelay}
            onChange={(e) => onConfigChange('podUpdateDelay', parseInt(e.target.value))}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.podUpdateDelay ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.podUpdateDelay && (
            <p className="text-sm text-red-600">{errors.podUpdateDelay}</p>
          )}
          <p className="text-xs text-gray-500">
            Delay between updating individual pods
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Health Check Delay (ms)
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            min="500"
            step="100"
            value={config.healthCheckDelay}
            onChange={(e) => onConfigChange('healthCheckDelay', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500">
            Delay before health checking updated pods
          </p>
        </div>
      </div>
    </div>
  );
}

function BlueGreenConfig({
  config,
  onConfigChange,
}: {
  config: BlueGreenConfigOptions;
  onConfigChange: (key: string, value: any) => void;
  errors?: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Traffic Switch Delay (ms)
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            min="500"
            step="100"
            value={config.trafficSwitchDelay}
            onChange={(e) => onConfigChange('trafficSwitchDelay', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500">
            Delay before switching traffic to new environment
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Validate All Health Checks
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.validateAllHealthChecks}
              onChange={(e) => onConfigChange('validateAllHealthChecks', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Check all endpoints before switch</span>
          </label>
          <p className="text-xs text-gray-500">
            Ensure all health checks pass before traffic switch
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Keep Old Environment
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.keepOldEnvironment}
              onChange={(e) => onConfigChange('keepOldEnvironment', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Keep Blue environment running</span>
          </label>
          <p className="text-xs text-gray-500">
            Keep old environment for quick rollback
          </p>
        </div>
      </div>
    </div>
  );
}

function CanaryConfig({
  config,
  onConfigChange,
  errors,
}: {
  config: CanaryConfigOptions;
  onConfigChange: (key: string, value: any) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Initial Canary Percentage (%)
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            min="5"
            max="50"
            value={config.initialPercentage}
            onChange={(e) => onConfigChange('initialPercentage', parseInt(e.target.value))}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.initialPercentage ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.initialPercentage && (
            <p className="text-sm text-red-600">{errors.initialPercentage}</p>
          )}
          <p className="text-xs text-gray-500">
            Starting percentage of traffic (5-50%)
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Increment Percentage (%)
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            min="5"
            max="50"
            value={config.incrementPercentage}
            onChange={(e) => onConfigChange('incrementPercentage', parseInt(e.target.value))}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.incrementPercentage ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.incrementPercentage && (
            <p className="text-sm text-red-600">{errors.incrementPercentage}</p>
          )}
          <p className="text-xs text-gray-500">
            Traffic increment per stage (5-50%)
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Metrics Wait Time (ms)
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            min="1000"
            step="1000"
            value={config.metricsWaitTime}
            onChange={(e) => onConfigChange('metricsWaitTime', parseInt(e.target.value))}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.metricsWaitTime ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.metricsWaitTime && (
            <p className="text-sm text-red-600">{errors.metricsWaitTime}</p>
          )}
          <p className="text-xs text-gray-500">
            Time to monitor metrics between stages
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Error Threshold (%)
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={config.errorThreshold}
            onChange={(e) => onConfigChange('errorThreshold', parseInt(e.target.value))}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.errorThreshold ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.errorThreshold && (
            <p className="text-sm text-red-600">{errors.errorThreshold}</p>
          )}
          <p className="text-xs text-gray-500">
            Trigger rollback if errors exceed threshold
          </p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Auto Rollback on Error
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.autoRollbackOnError}
              onChange={(e) => onConfigChange('autoRollbackOnError', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">
              Automatically rollback if error threshold exceeded
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

function RecreateConfig({
  config,
  onConfigChange,
}: {
  config: RecreateConfigOptions;
  onConfigChange: (key: string, value: any) => void;
  errors?: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <Badge variant="warning" className="mb-2">
          Downtime Expected
        </Badge>
        <p className="text-sm text-yellow-800">
          This strategy will cause service downtime. All pods will be stopped and restarted.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Pre-Shutdown Delay (ms)
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            min="500"
            step="100"
            value={config.preShutdownDelay}
            onChange={(e) => onConfigChange('preShutdownDelay', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500">
            Grace period before shutting down pods
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Post-Startup Delay (ms)
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            min="1000"
            step="100"
            value={config.postStartupDelay}
            onChange={(e) => onConfigChange('postStartupDelay', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500">
            Wait time after pods start before health checks
          </p>
        </div>
      </div>
    </div>
  );
}
