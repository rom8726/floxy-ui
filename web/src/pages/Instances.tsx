import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pagination } from '../components/Pagination';
import { Database, Eye, Calendar, Clock, Loader2, TrendingUp } from 'lucide-react';

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

interface PaginatedInstancesResponse {
  items: ActiveWorkflow[];
  page: number;
  page_size: number;
  total: number;
}

export const Instances: React.FC = () => {
  const [instances, setInstances] = useState<ActiveWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchInstances = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          page_size: pageSize.toString(),
        });
        const response = await fetch(`/api/instances?${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch instances');
        }
        const data: PaginatedInstancesResponse = await response.json();
        setInstances(data.items);
        setTotal(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchInstances();
  }, [page, pageSize]);

  if (loading) {
    return (
      <div className="loading flex items-center justify-center gap-3">
        <Loader2 className="animate-spin text-primary" size={24} />
        <span>Loading instances...</span>
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
          Workflow Instances
          <div 
            className="absolute bottom-0 left-0 w-24 h-1 rounded-full"
            style={{
              background: 'linear-gradient(to right, var(--gradient-start), var(--gradient-end))',
            }}
          ></div>
        </h1>
        <p className="text-lg mt-4" style={{ color: 'var(--text-secondary)' }}>Manage workflow instances</p>
      </div>
      
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Database className="text-primary" size={24} />
          </div>
          <h2 className="text-2xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>Instance List</h2>
        </div>
        {instances.length === 0 ? (
          <div className="text-center py-12">
            <Database className="mx-auto mb-4" size={48} style={{ color: 'var(--text-secondary)' }} />
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>No instances found</p>
          </div>
        ) : (
          <>
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
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {instances.map((instance) => {
                    const duration = Math.round((new Date(instance.updated_at).getTime() - new Date(instance.started_at).getTime()) / 1000);
                    const progress = (instance.completed_steps / instance.total_steps) * 100;
                    return (
                      <tr key={instance.id}>
                        <td className="font-mono text-sm">{instance.id}</td>
                        <td className="font-medium">{instance.workflow_id}</td>
                        <td>
                          <span className={`status ${instance.status}`}>
                            {instance.status}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', verticalAlign: 'middle' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={16} />
                            {duration}s
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">
                              {instance.completed_steps}/{instance.total_steps}
                            </span>
                            {instance.rolled_back_steps > 0 && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                                {instance.rolled_back_steps} rolled back
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 rounded-full ${
                                instance.status === 'dlq' 
                                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                                  : 'bg-gradient-to-r from-primary to-secondary'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', verticalAlign: 'middle' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={16} />
                            {new Date(instance.started_at).toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <Link to={`/instances/${instance.id}`} className="btn btn-primary">
                            <Eye size={16} />
                            Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
              onPageSizeChange={(newPageSize) => {
                setPageSize(newPageSize);
                setPage(1);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};
