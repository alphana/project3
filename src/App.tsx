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
