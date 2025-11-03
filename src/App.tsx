import { useState } from 'react';
import { RouteDeploymentModal } from './components/deployment/RouteDeploymentModal';
import { generateMockPods, generateMockRoute } from './lib/mockData';
import { Button } from './components/ui/Button';
import { Rocket, Server, GitBranch } from 'lucide-react';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [podCount, setPodCount] = useState(12);

  const mockRoute = generateMockRoute();
  const mockPods = generateMockPods(podCount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-6">
              <Rocket className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Route Deployment Modal Demo
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A comprehensive deployment management system with real-time visualization,
              multiple deployment strategies, and live progress tracking.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Server className="h-6 w-6 text-blue-600" />
              Deployment Configuration
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Route Name</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                    <code className="text-sm text-gray-900">{mockRoute.name}</code>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Version</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                    <code className="text-sm text-gray-900">{mockRoute.version}</code>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Gateway Deployment</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                    <code className="text-sm text-gray-900">
                      {mockRoute.gatewayDeployment.name} ({mockRoute.gatewayDeployment.revision})
                    </code>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Number of Pods</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="3"
                      max="50"
                      value={podCount}
                      onChange={(e) => setPodCount(parseInt(e.target.value) || 12)}
                      className="flex-1 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <Button
                  size="lg"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full"
                >
                  <Rocket className="h-5 w-5 mr-2" />
                  Start Deployment
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-blue-600" />
              Features
            </h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span><strong>4 Deployment Strategies:</strong> Rolling Update, Blue-Green, Canary, and Recreate</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span><strong>Real-time Visualization:</strong> Polar tree topology showing pod status across namespaces</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span><strong>Live Progress Tracking:</strong> Stage-by-stage deployment monitoring with activity logs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span><strong>Automatic Rollback:</strong> Simulated failure detection with automatic rollback (5% failure rate)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span><strong>Health Checks:</strong> Comprehensive post-deployment verification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span><strong>Responsive Design:</strong> Works seamlessly on mobile and desktop</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <RouteDeploymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        route={mockRoute}
        targetPods={mockPods}
      />
    </div>
  );
}

export default App;
