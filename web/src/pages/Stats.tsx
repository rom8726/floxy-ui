import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, CheckCircle2, XCircle, PlayCircle, Workflow, Clock, Loader2, Database } from 'lucide-react';

interface WorkflowStats {
    workflow_name: string;
    version: number;
    total_instances: number;
    completed_instances: number;
    failed_instances: number;
    running_instances: number;
    average_duration: number;
}

export const Stats: React.FC = () => {
    const [stats, setStats] = useState<WorkflowStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/stats');
                if (!response.ok) {
                    throw new Error('Failed to fetch stats');
                }
                const data = await response.json();
                setStats(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="loading flex items-center justify-center gap-3">
                <Loader2 className="animate-spin text-primary" size={24} />
                <span>Loading statistics...</span>
            </div>
        );
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    const formatDuration = (nanoseconds: number) => {
        if (nanoseconds === 0 || nanoseconds === null) return '-';
        
        // Convert nanoseconds to seconds
        const seconds = nanoseconds / 1000000000;
        
        if (seconds < 60) return `${seconds.toFixed(1)}s`;
        if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
        return `${(seconds / 3600).toFixed(1)}h`;
    };

    const getSuccessRate = (completed: number, total: number) => {
        if (total === 0) return '0.0';
        return ((completed / total) * 100).toFixed(1);
    };

    const summaryStats = [
        { 
            label: 'Total Instances', 
            value: stats.reduce((sum, stat) => sum + stat.total_instances, 0),
            icon: Database,
            color: 'from-primary to-primary-dark'
        },
        { 
            label: 'Completed', 
            value: stats.reduce((sum, stat) => sum + stat.completed_instances, 0),
            icon: CheckCircle2,
            color: 'from-green-500 to-green-600'
        },
        { 
            label: 'Failed', 
            value: stats.reduce((sum, stat) => sum + stat.failed_instances, 0),
            icon: XCircle,
            color: 'from-red-500 to-red-600'
        },
        { 
            label: 'Running', 
            value: stats.reduce((sum, stat) => sum + stat.running_instances, 0),
            icon: PlayCircle,
            color: 'from-purple-500 to-purple-600'
        },
        { 
            label: 'Workflow Types', 
            value: stats.length,
            icon: Workflow,
            color: 'from-blue-500 to-blue-600'
        },
    ];

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
                    Workflow Statistics
                    <div 
                      className="absolute bottom-0 left-0 w-24 h-1 rounded-full"
                      style={{
                        background: 'linear-gradient(to right, var(--gradient-start), var(--gradient-end))',
                      }}
                    ></div>
                </h1>
                <p className="text-lg mt-4" style={{ color: 'var(--text-secondary)' }}>Detailed statistics for all workflows</p>
            </div>

            <div className="card">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <BarChart3 className="text-primary" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>Summary</h2>
                </div>
                <div className="stats-grid">
                    {summaryStats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="stat-card">
                                <div className="stat-number">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="card">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <TrendingUp className="text-primary" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>Detailed Statistics</h2>
                </div>
                {stats.length === 0 ? (
                    <div className="text-center py-12">
                        <BarChart3 className="mx-auto mb-4" size={48} style={{ color: 'var(--text-secondary)' }} />
                        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>No statistics available</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Workflow</th>
                                    <th>Version</th>
                                    <th>Total</th>
                                    <th>Completed</th>
                                    <th>Failed</th>
                                    <th>Running</th>
                                    <th>Success Rate</th>
                                    <th>Avg Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.map((stat, index) => {
                                    const successRate = getSuccessRate(stat.completed_instances, stat.total_instances);
                                    return (
                                        <tr key={`${stat.workflow_name}-${stat.version}`}>
                                            <td className="font-semibold">{stat.workflow_name}</td>
                                            <td>
                                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                                    v{stat.version}
                                                </span>
                                            </td>
                                            <td>{stat.total_instances}</td>
                                            <td className="text-green-600 font-semibold">{stat.completed_instances}</td>
                                            <td className="text-red-600 font-semibold">{stat.failed_instances}</td>
                                            <td className="text-purple-600 font-semibold">{stat.running_instances}</td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 bg-gray-200 rounded-full h-2 overflow-hidden">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                                                            style={{ width: `${successRate}%` }}
                                                        />
                                                    </div>
                                                    <span className="font-semibold">{successRate}%</span>
                                                </div>
                                            </td>
                                            <td className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                                <Clock size={16} />
                                                {formatDuration(stat.average_duration)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
