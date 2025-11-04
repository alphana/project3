import { useState } from 'react';
import { RouteDeploymentModal } from './components/deployment/RouteDeploymentModal';
import { RevisionCreationModal } from './components/revision/RevisionCreationModal';
import { RevisionsPage } from './components/RevisionsPage';
import { RevisionData } from './components/revision/types/revision.types';
import { generateMockWorkloadNamespaces } from './lib/mockData';

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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gateway Deployment Manager</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create revisions and deploy route changes to your gateway clusters
          </p>
        </div>

        <RevisionsPage
          revisions={revisions}
          onCreateRevision={() => setIsRevisionModalOpen(true)}
          onDeploy={handleDeploy}
        />
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
