import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Workflow, FileText, Calendar, Eye, Loader2 } from 'lucide-react';

interface WorkflowDefinition {
  id: string;
  name: string;
  version: number;
  definition: any;
  created_at: string;
}

export const Workflows: React.FC = () => {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const response = await fetch('/api/workflows');
        if (!response.ok) {
          throw new Error('Failed to fetch workflows');
        }
        const data = await response.json();
        setWorkflows(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  if (loading) {
    return (
      <div className="loading flex items-center justify-center gap-3">
        <Loader2 className="animate-spin text-primary" size={24} />
        <span>Loading workflows...</span>
      </div>
    );
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

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
          Workflow Definitions
          <div 
            className="absolute bottom-0 left-0 w-24 h-1 rounded-full"
            style={{
              background: 'linear-gradient(to right, var(--gradient-start), var(--gradient-end))',
            }}
          ></div>
        </h1>
        <p className="text-lg mt-4" style={{ color: 'var(--text-secondary)' }}>Manage workflow definitions</p>
      </div>
      
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="text-primary" size={24} />
          </div>
          <h2 className="text-2xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>Workflow List</h2>
        </div>
        {workflows.length === 0 ? (
          <div className="text-center py-12">
            <Workflow className="mx-auto mb-4" size={48} style={{ color: 'var(--text-secondary)' }} />
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>No workflow definitions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Version</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workflows.map((workflow) => (
                  <tr key={workflow.id}>
                    <td className="font-semibold">{workflow.name}</td>
                    <td>
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        v{workflow.version}
                      </span>
                    </td>
                    <td className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <Calendar size={16} />
                      {new Date(workflow.created_at).toLocaleString()}
                    </td>
                    <td>
                      <Link to={`/workflows/${workflow.id}`} className="btn btn-primary">
                        <Eye size={16} />
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
