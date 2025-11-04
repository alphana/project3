import { useState } from 'react';
import { RouteDeploymentModal } from './components/deployment/RouteDeploymentModal';
import { RevisionCreationModal } from './components/revision/RevisionCreationModal';
import { RevisionsDataTable } from './components/revision/RevisionsDataTable';
import { RevisionData } from './components/revision/types/revision.types';
import {
  generateMockGatewayDeployment,
  generateMockRouteChanges,
  generateMockWorkloadNamespaces,
} from './lib/mockData';
import { Button } from './components/ui/Button';
import { Rocket, Package } from 'lucide-react';

function App() {
  const [isDeploymentModalOpen, setIsDeploymentModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisions, setRevisions] = useState<RevisionData[]>([]);

  const gatewayDeployment = generateMockGatewayDeployment();
  const routeChanges = generateMockRouteChanges();
  const workloadNamespaces = generateMockWorkloadNamespaces();

  const handleRevisionCreated = (revision: RevisionData) => {
    setRevisions((prev) => [revision, ...prev]);
  };

  const handleDeploy = (revision: RevisionData) => {
    console.log('Deploy revision:', revision);
    setIsDeploymentModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
        

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Gateway Deployment Manager
              </h1>
              <p className="text-lg text-gray-600">
                Create revisions and deploy route changes to your gateway clusters
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                size="lg"
                onClick={() => setIsRevisionModalOpen(true)}
                variant="outline"
                className="w-full"
              >
                <Package className="h-5 w-5 mr-2" />
                Create Revision
              </Button>
              <Button
                size="lg"
                onClick={() => setIsDeploymentModalOpen(true)}
                className="w-full"
              >
                <Rocket className="h-5 w-5 mr-2" />
                Start Deployment
              </Button>
            </div>
          </div>

          {revisions.length > 0 && (
            <RevisionsDataTable revisions={revisions} onDeploy={handleDeploy} />
          )}
        </div>
      </div>

      <RevisionCreationModal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        namespaces={workloadNamespaces}
        onRevisionCreated={handleRevisionCreated}
      />

      <RouteDeploymentModal
        isOpen={isDeploymentModalOpen}
        onClose={() => setIsDeploymentModalOpen(false)}
        gatewayDeployment={gatewayDeployment}
        routeChanges={routeChanges}
      />
    </div>
  );
}

export default App;
