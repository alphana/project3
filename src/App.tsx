import { useState } from 'react';
import { RouteDeploymentModal } from './components/deployment/RouteDeploymentModal';
import { generateMockGatewayDeployment, generateMockRouteChanges } from './lib/mockData';
import { Button } from './components/ui/Button';
import { Rocket, Server, GitBranch, TrendingUp } from 'lucide-react';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const gatewayDeployment = generateMockGatewayDeployment();
  const routeChanges = generateMockRouteChanges();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-6">
              <Rocket className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Gateway Route Deployment System
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Deploy multiple route changes across namespaces with comprehensive comparison,
              flexible strategies, and real-time visualization.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Server className="h-6 w-6 text-blue-600" />
              Gateway Deployment Overview
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Gateway Name</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                    <code className="text-sm text-gray-900">{gatewayDeployment.name}</code>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Revision</label>
                  <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 flex items-center gap-3">
                    <code className="text-sm font-medium text-gray-900">
                      {gatewayDeployment.currentRevision}
                    </code>
                    <span className="text-gray-400">→</span>
                    <code className="text-sm font-medium text-blue-700">
                      {gatewayDeployment.targetRevision}
                    </code>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Available Namespaces</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-900">
                      {gatewayDeployment.namespaces.length} namespaces
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {gatewayDeployment.namespaces.map((ns) => ns.name).join(', ')}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Route Changes</label>
                  <div className="px-4 py-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-900">
                        {routeChanges.length} routes modified
                      </span>
                    </div>
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
                  Start Deployment Process
                </Button>
              </div>
            </div>
          </div>

          
        </div>
      </div>

      <RouteDeploymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        gatewayDeployment={gatewayDeployment}
        routeChanges={routeChanges}
      />
    </div>
  );
}

export default App;
