import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CleanupModal } from '../components/CleanupModal';
import { 
  Workflow, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  PlayCircle, 
  Clock,
  Trash2,
  Eye,
  TrendingUp
} from 'lucide-react';

interface SummaryStats {
  total_workflows: number;
  completed_workflows: number;
  failed_workflows: number;
  running_workflows: number;
  pending_workflows: number;
  active_workflows: number;
}

interface ActiveWorkflow {
  id: number;
  workflow_id: string;
  workflow_name: string;
  status: string;
  started_at: string;
  updated_at: string;
  current_step: string;
  total_steps: number;
  completed_steps: number;
  rolled_back_steps: number;
}

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [activeWorkflows, setActiveWorkflows] = useState<ActiveWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCleanupModal, setShowCleanupModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, activeRes] = await Promise.all([
          fetch('/api/stats/summary'),
          fetch('/api/instances/active')
        ]);

        if (!summaryRes.ok || !activeRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const summaryData = await summaryRes.json();
        const activeData = await activeRes.json();

        setSummary(summaryData);
        setActiveWorkflows(activeData && Array.isArray(activeData) ? activeData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCleanup = (daysToKeep: number) => {
    // Refresh data after successful cleanup
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="loading flex items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span>Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  const stats = summary ? [
    { label: 'Total Workflows', value: summary.total_workflows, icon: Workflow, color: 'from-primary to-primary-dark' },
    { label: 'Active', value: summary.active_workflows, icon: Activity, color: 'from-blue-500 to-blue-600' },
    { label: 'Completed', value: summary.completed_workflows, icon: CheckCircle2, color: 'from-green-500 to-green-600' },
    { label: 'Failed', value: summary.failed_workflows, icon: XCircle, color: 'from-red-500 to-red-600' },
    { label: 'Running', value: summary.running_workflows, icon: PlayCircle, color: 'from-purple-500 to-purple-600' },
    { label: 'Pending', value: summary.pending_workflows, icon: Clock, color: 'from-yellow-500 to-yellow-600' },
  ] : [];

  return (
    <div>
      <div className="mb-8">
        <h1 
          className="text-4xl font-bold mb-2 relative inline-block"
          style={{ 
            color: 'var(--text-primary)',
            background: 'linear-gradient(135deg, var(--text-primary), var(--accent), var(--gradient-end))',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'gradient-shift 6s ease infinite',
          }}
        >
          Floxy Dashboard
          <div 
            className="absolute bottom-0 left-0 w-24 h-1 rounded-full"
            style={{
              background: 'linear-gradient(to right, var(--gradient-start), var(--gradient-end))',
            }}
          ></div>
        </h1>
        <p 
          className="text-lg mt-4"
          style={{ color: 'var(--text-secondary)' }}
        >
          Overview of workflow system status
        </p>
      </div>
      
      {summary && (
        <div className="stats-grid">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="stat-card">
                <div className="stat-number">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            );
          })}
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-red-50">
            <Trash2 className="text-red-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>Administrative Actions</h2>
        </div>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          Manage workflow instances and perform system maintenance tasks.
        </p>
        <button
          className="btn btn-danger"
          onClick={() => setShowCleanupModal(true)}
        >
          <Trash2 size={18} />
          Cleanup Old Workflows
        </button>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="text-primary" size={24} />
          </div>
          <h2 className="text-2xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>Active Workflows</h2>
        </div>
        {!activeWorkflows || activeWorkflows.length === 0 ? (
          <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>No active workflows</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Workflow</th>
                  <th>Status</th>
                  <th>Duration</th>
                  <th>Steps</th>
                  <th>Progress</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeWorkflows.map((workflow) => {
                  const progress = (workflow.completed_steps / workflow.total_steps) * 100;
                  const duration = Math.round((new Date(workflow.updated_at).getTime() - new Date(workflow.started_at).getTime()) / 1000);
                  return (
                    <tr key={workflow.id}>
                      <td className="font-mono text-sm">{workflow.id}</td>
                      <td className="font-medium">{workflow.workflow_id}</td>
                      <td>
                        <span className={`status ${workflow.status}`}>
                          {workflow.status}
                        </span>
                      </td>
                      <td>{duration}s</td>
                      <td className="font-mono text-sm">
                        {workflow.completed_steps}/{workflow.total_steps}
                      </td>
                      <td>
                        <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </td>
                      <td>
                        <Link to={`/instances/${workflow.id}`} className="btn btn-primary">
                          <Eye size={16} />
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cleanup modal */}
      <CleanupModal
        isOpen={showCleanupModal}
        onClose={() => setShowCleanupModal(false)}
        onCleanup={handleCleanup}
      />
    </div>
  );
};
