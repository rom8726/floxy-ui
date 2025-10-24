import { Router } from 'express';
import { Pool } from 'pg';

export function instanceRoutes(pool: Pool) {
  const router = Router();

  router.get('/active', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT * FROM workflows.active_workflows
        ORDER BY created_at DESC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching active workflows:', error);
      res.status(500).json({ error: 'Failed to fetch active workflows' });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        SELECT wi.id, wi.workflow_id, wi.status, wi.input, wi.output, wi.error,
               wi.started_at, wi.completed_at, wi.created_at, wi.updated_at
        FROM workflows.workflow_instances wi
        WHERE wi.id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Instance not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching instance:', error);
      res.status(500).json({ error: 'Failed to fetch instance' });
    }
  });

  router.get('/:id/steps', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        SELECT id, instance_id, step_name, step_type, status, input, output, error,
               retry_count, max_retries, compensation_retry_count, started_at, completed_at, created_at
        FROM workflows.workflow_steps
        WHERE instance_id = $1
        ORDER BY created_at ASC
      `, [id]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching instance steps:', error);
      res.status(500).json({ error: 'Failed to fetch instance steps' });
    }
  });

  router.get('/:id/events', async (req, res) => {
    try {
      const { id } = req.params;
      const { limit = 100 } = req.query;
      
      const result = await pool.query(`
        SELECT we.id, we.instance_id, we.step_id, we.event_type, we.payload, we.created_at
        FROM workflows.workflow_events we
        WHERE we.instance_id = $1
        ORDER BY we.created_at DESC
        LIMIT $2
      `, [id, limit]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching instance events:', error);
      res.status(500).json({ error: 'Failed to fetch instance events' });
    }
  });

  return router;
}
