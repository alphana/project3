import { useState } from 'react';
import { RouteDeploymentModal } from './components/deployment/RouteDeploymentModal';
import { RevisionCreationModal } from './components/revision/RevisionCreationModal';
import { RevisionsDataTable } from './components/revision/RevisionsDataTable';
import { RevisionData } from './components/revision/types/revision.types';
import { generateMockWorkloadNamespaces } from './lib/mockData';
import { Button } from './components/ui/Button';
import { Package } from 'lucide-react';

function App() {
  const [isDeploymentModalOpen, setIsDeploymentModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisions, setRevisions] = useState<RevisionData[]>([]);
  const [selectedRevision, setSelectedRevision] = useState<RevisionData | null>(null);
  const [nextRevisionNumber, setNextRevisionNumber] = useState(43);

  const workloadNamespaces = generateMockWorkloadNamespaces();

  const handleRevisionCreated = (revision: RevisionData) => {
    setRevisions((prev) => [revision, ...prev]);
    setNextRevisionNumber((prev) => prev + 1);
  };

  const handleDeploy = (revision: RevisionData) => {
    setSelectedRevision(revision);
    setIsDeploymentModalOpen(true);
  };

  const handleDeploymentComplete = (revision: RevisionData) => {
    setRevisions((prev) =>
      prev.map((rev) =>
        rev.id === revision.id ? { ...rev, status: 'deployed' as const } : rev
      )
    );
  };

  const handleDeploymentModalClose = () => {
    setIsDeploymentModalOpen(false);
    setSelectedRevision(null);
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

            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={() => setIsRevisionModalOpen(true)}
                className="w-full max-w-md"
              >
                <Package className="h-5 w-5 mr-2" />
                Create New Revision
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
        nextRevisionNumber={nextRevisionNumber}
      />

      <RouteDeploymentModal
        isOpen={isDeploymentModalOpen}
        onClose={handleDeploymentModalClose}
        revision={selectedRevision}
        onDeploymentComplete={handleDeploymentComplete}
      />
    </div>
  );
}

export default App;
