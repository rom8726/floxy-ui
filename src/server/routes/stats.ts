import { Router } from 'express';
import { Pool } from 'pg';

export function statsRoutes(pool: Pool) {
  const router = Router();

  router.get('/', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT * FROM workflows.workflow_stats
        ORDER BY name, version
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching workflow stats:', error);
      res.status(500).json({ error: 'Failed to fetch workflow stats' });
    }
  });

  router.get('/summary', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_workflows,
          COUNT(*) FILTER (WHERE status = 'completed') as completed_workflows,
          COUNT(*) FILTER (WHERE status = 'failed') as failed_workflows,
          COUNT(*) FILTER (WHERE status = 'running') as running_workflows,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_workflows
        FROM workflows.workflow_instances
      `);
      
      const activeResult = await pool.query(`
        SELECT COUNT(*) as active_count
        FROM workflows.active_workflows
      `);
      
      res.json({
        ...result.rows[0],
        active_workflows: activeResult.rows[0].active_count
      });
    } catch (error) {
      console.error('Error fetching summary stats:', error);
      res.status(500).json({ error: 'Failed to fetch summary stats' });
    }
  });

  return router;
}
