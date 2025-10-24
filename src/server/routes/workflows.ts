import { Router } from 'express';
import { Pool } from 'pg';
import { WorkflowDefinition } from '../types.js';

export function workflowRoutes(pool: Pool) {
  const router = Router();

  router.get('/', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT id, name, version, definition, created_at
        FROM workflows.workflow_definitions
        ORDER BY name, version DESC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      res.status(500).json({ error: 'Failed to fetch workflows' });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        SELECT id, name, version, definition, created_at
        FROM workflows.workflow_definitions
        WHERE id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Workflow not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching workflow:', error);
      res.status(500).json({ error: 'Failed to fetch workflow' });
    }
  });

  router.get('/:id/instances', async (req, res) => {
    try {
      const { id } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      
      const result = await pool.query(`
        SELECT wi.id, wi.workflow_id, wi.status, wi.input, wi.output, wi.error,
               wi.started_at, wi.completed_at, wi.created_at, wi.updated_at
        FROM workflows.workflow_instances wi
        WHERE wi.workflow_id = $1
        ORDER BY wi.created_at DESC
        LIMIT $2 OFFSET $3
      `, [id, limit, offset]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching workflow instances:', error);
      res.status(500).json({ error: 'Failed to fetch workflow instances' });
    }
  });

  return router;
}
