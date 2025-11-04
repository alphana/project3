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
        

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            

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
