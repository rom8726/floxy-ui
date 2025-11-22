import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Eye, Calendar, ChevronLeft, ChevronRight, Loader2, ExternalLink } from 'lucide-react';

interface DeadLetterItem {
  id: number;
  instance_id: number;
  workflow_id: string;
  step_id: number;
  step_name: string;
  step_type: string;
  input: any;
  error: string | null;
  reason: string;
  created_at: string;
}

interface DLQListResponse {
  items: DeadLetterItem[];
  page: number;
  page_size: number;
  total: number;
}

export const DLQ: React.FC = () => {
  const [dlqItems, setDlqItems] = useState<DeadLetterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchDLQItems();
  }, [currentPage]);

  const fetchDLQItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dlq?page=${currentPage}&page_size=${pageSize}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch DLQ items');
      }
      
      const data: DLQListResponse = await response.json();
      setDlqItems(data.items);
      setTotalItems(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  if (loading) {
    return (
      <div className="loading flex items-center justify-center gap-3">
        <Loader2 className="animate-spin text-primary" size={24} />
        <span>Loading DLQ items...</span>
      </div>
    );
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
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
            Dead Letter Queue
            <div 
              className="absolute bottom-0 left-0 w-24 h-1 rounded-full"
              style={{
                background: 'linear-gradient(to right, var(--gradient-start), var(--gradient-end))',
              }}
            ></div>
          </h1>
          <p className="text-lg mt-4" style={{ color: 'var(--text-secondary)' }}>Items requiring processing</p>
        </div>
        <div className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-semibold">
          Total: {totalItems} items
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-red-50">
            <AlertCircle className="text-red-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>DLQ Items List</h2>
        </div>
        {dlqItems.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto mb-4" size={48} style={{ color: 'var(--text-secondary)' }} />
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>No items in Dead Letter Queue</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Instance ID</th>
                    <th>Workflow</th>
                    <th>Step</th>
                    <th>Type</th>
                    <th>Error</th>
                    <th>Reason</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dlqItems.map((item) => (
                    <tr key={item.id}>
                      <td className="font-mono text-sm">{item.id}</td>
                      <td>
                        <Link 
                          to={`/instances/${item.instance_id}`} 
                          className="btn btn-primary text-xs px-3 py-1"
                        >
                          <ExternalLink size={14} />
                          {item.instance_id}
                        </Link>
                      </td>
                      <td className="font-medium">{item.workflow_id}</td>
                      <td>{item.step_name}</td>
                      <td>
                        <span className="status failed">{item.step_type}</span>
                      </td>
                      <td>
                        {item.error ? (
                          <div className="max-w-[200px] truncate text-sm" title={item.error}>
                            {item.error}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}>-</span>
                        )}
                      </td>
                      <td className="text-sm">{item.reason}</td>
                      <td className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                        <Calendar size={16} />
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                      <td>
                        <Link to={`/dlq/${item.id}`} className="btn btn-primary">
                          <Eye size={16} />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  className="btn btn-secondary"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>
                <span className="flex items-center font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="btn btn-secondary"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
