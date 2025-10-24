import React from 'react';

export interface StepDefinition {
  name: string;
  type: 'task' | 'parallel' | 'condition' | 'fork' | 'join' | 'save_point';
  handler?: string;
  max_retries?: number;
  next?: string[];
  prev?: string;
  else?: string;
  on_failure?: string;
  condition?: string;
  parallel?: string[];
  wait_for?: string[];
  join_strategy?: 'all' | 'any';
  metadata?: Record<string, any>;
  no_idempotent?: boolean;
}

export interface GraphDefinition {
  steps: Record<string, StepDefinition>;
  start: string;
}

export interface WorkflowStep {
  id: number;
  instance_id: number;
  step_name: string;
  step_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'compensation' | 'rolled_back';
  input?: any;
  output?: any;
  error?: string;
  retry_count: number;
  max_retries: number;
  compensation_retry_count: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

interface WorkflowGraphProps {
  definition: GraphDefinition;
  steps?: WorkflowStep[];
  title?: string;
}

interface GraphNode {
  id: string;
  step: StepDefinition;
  x: number;
  y: number;
  status?: string;
  width: number;
  height: number;
}

interface GraphEdge {
  from: string;
  to: string;
  type: 'normal' | 'failure' | 'else' | 'parallel';
}

export const WorkflowGraph: React.FC<WorkflowGraphProps> = ({ 
  definition, 
  steps = [], 
  title = "Workflow Graph" 
}) => {
  const [nodes, setNodes] = React.useState<GraphNode[]>([]);
  const [edges, setEdges] = React.useState<GraphEdge[]>([]);
  const [dimensions, setDimensions] = React.useState({ width: 1000, height: 700 });

  const stepStatusMap = React.useMemo(() => {
    const map = new Map<string, string>();
    steps.forEach(step => {
      map.set(step.step_name, step.status);
    });
    return map;
  }, [steps]);

  const getStepStatus = (stepName: string): string => {
    return stepStatusMap.get(stepName) || 'pending';
  };

  const getStepColor = (stepName: string): string => {
    const status = getStepStatus(stepName);
    switch (status) {
      case 'completed': return '#10b981';
      case 'failed': return '#ef4444';
      case 'running': return '#3b82f6';
      case 'compensation': return '#8b5cf6';
      case 'rolled_back': return '#f59e0b';
      case 'skipped': return '#6b7280';
      default: return '#e5e7eb';
    }
  };

  const getStepIcon = (type: string): string => {
    switch (type) {
      case 'task': return '⚙️';
      case 'parallel': return '∥';
      case 'condition': return '❓';
      case 'fork': return '🔀';
      case 'join': return '🔗';
      case 'save_point': return '💾';
      default: return '📋';
    }
  };

  const calculateLayout = React.useCallback(() => {
    const nodeMap = new Map<string, GraphNode>();
    const edgeList: GraphEdge[] = [];
    const visited = new Set<string>();
    const levels: string[][] = [];
    
    const traverse = (stepName: string, level: number) => {
      if (visited.has(stepName) || !definition.steps[stepName]) return;
      
      visited.add(stepName);
      const step = definition.steps[stepName];
      
      if (!levels[level]) levels[level] = [];
      levels[level].push(stepName);
      
      const node: GraphNode = {
        id: stepName,
        step,
        x: 0,
        y: 0,
        status: getStepStatus(stepName),
        width: 120,
        height: 60
      };
      nodeMap.set(stepName, node);
      
      if (step.next) {
        step.next.forEach(nextStep => {
          edgeList.push({ from: stepName, to: nextStep, type: 'normal' });
          traverse(nextStep, level + 1);
        });
      }
      
      if (step.else) {
        edgeList.push({ from: stepName, to: step.else, type: 'else' });
        traverse(step.else, level + 1);
      }
      
      // Don't traverse compensation steps as separate nodes
      // They will be shown as chips on the main steps
      
      if (step.parallel) {
        step.parallel.forEach(parallelStep => {
          edgeList.push({ from: stepName, to: parallelStep, type: 'parallel' });
          traverse(parallelStep, level + 1);
        });
      }
    };
    
    traverse(definition.start, 0);
    
    const maxLevel = levels.length;
    const levelWidth = Math.max(200, dimensions.width / maxLevel);
    const nodeSpacing = 100;
    const padding = 50;
    
    levels.forEach((levelNodes, levelIndex) => {
      const startY = Math.max(padding, (dimensions.height - (levelNodes.length - 1) * nodeSpacing) / 2);
      
      levelNodes.forEach((nodeName, nodeIndex) => {
        const node = nodeMap.get(nodeName);
        if (node) {
          node.x = levelIndex * levelWidth + padding;
          node.y = startY + nodeIndex * nodeSpacing;
        }
      });
    });
    
    // Adjust dimensions based on actual content
    const maxX = Math.max(...Array.from(nodeMap.values()).map(n => n.x + n.width)) + padding;
    const maxY = Math.max(...Array.from(nodeMap.values()).map(n => n.y + n.height)) + padding;
    
    setDimensions(prev => ({
      width: Math.max(prev.width, maxX),
      height: Math.max(prev.height, maxY)
    }));
    
    setNodes(Array.from(nodeMap.values()));
    setEdges(edgeList);
  }, [definition, dimensions, getStepStatus]);

  React.useEffect(() => {
    calculateLayout();
  }, [calculateLayout]);

  const getEdgeColor = (type: string): string => {
    switch (type) {
      case 'failure': return '#ef4444';
      case 'else': return '#f59e0b';
      case 'parallel': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getEdgeStyle = (type: string): string => {
    switch (type) {
      case 'failure': return 'dashed';
      case 'else': return 'dotted';
      case 'parallel': return 'solid';
      default: return 'solid';
    }
  };

  return (
    <div className="workflow-graph">
      <h3>{title}</h3>
      <div 
        className="graph-container"
        style={{ 
          width: '100%',
          height: '600px',
          position: 'relative',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: '#f9fafb',
          overflow: 'auto'
        }}
      >
        <svg
          width={dimensions.width}
          height={dimensions.height}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {edges.map((edge, index) => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            
            if (!fromNode || !toNode) return null;
            
            const startX = fromNode.x + fromNode.width / 2;
            const startY = fromNode.y + fromNode.height / 2;
            const endX = toNode.x + toNode.width / 2;
            const endY = toNode.y + toNode.height / 2;
            
            return (
              <line
                key={index}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={getEdgeColor(edge.type)}
                strokeWidth="2"
                strokeDasharray={getEdgeStyle(edge.type) === 'dashed' ? '5,5' : 
                                 getEdgeStyle(edge.type) === 'dotted' ? '2,3' : 'none'}
                markerEnd="url(#arrowhead)"
              />
            );
          })}
          
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#6b7280"
              />
            </marker>
          </defs>
        </svg>
        
        {nodes.map((node) => (
          <div
            key={node.id}
            className="graph-node"
            style={{
              position: 'absolute',
              left: node.x,
              top: node.y,
              width: node.width,
              height: node.height,
              backgroundColor: getStepColor(node.id),
              border: '2px solid #374151',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '500',
              color: '#1f2937',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.zIndex = '10';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.zIndex = '1';
            }}
          >
            <div style={{ fontSize: '16px', marginBottom: '2px' }}>
              {getStepIcon(node.step.type)}
            </div>
            <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
              <div style={{ fontWeight: '600' }}>{node.id}</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>
                {node.step.type}
              </div>
              {node.step.handler && (
                <div style={{ fontSize: '9px', opacity: 0.7 }}>
                  {node.step.handler}
                </div>
              )}
            </div>
            
            {/* Compensation chip */}
            {node.step.on_failure && (
              <div
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  fontSize: '8px',
                  fontWeight: '600',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  border: '2px solid white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  zIndex: 5
                }}
                title={`Compensation: ${node.step.on_failure}`}
              >
                ⚡
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="graph-legend" style={{ marginTop: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px' }}></div>
          <span style={{ fontSize: '12px' }}>Completed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '2px' }}></div>
          <span style={{ fontSize: '12px' }}>Failed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>
          <span style={{ fontSize: '12px' }}>Running</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '2px' }}></div>
          <span style={{ fontSize: '12px' }}>Rolled Back</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#e5e7eb', borderRadius: '2px' }}></div>
          <span style={{ fontSize: '12px' }}>Pending</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ 
            width: '16px', 
            height: '16px', 
            backgroundColor: '#8b5cf6', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8px',
            color: 'white',
            fontWeight: '600'
          }}>
            ⚡
          </div>
          <span style={{ fontSize: '12px' }}>Has Compensation</span>
        </div>
      </div>
    </div>
  );
};
