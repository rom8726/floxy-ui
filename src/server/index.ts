import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { workflowRoutes } from './routes/workflows.js';
import { instanceRoutes } from './routes/instances.js';
import { statsRoutes } from './routes/stats.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5435'),
  database: process.env.DB_NAME || 'floxy',
  user: process.env.DB_USER || 'floxy',
  password: process.env.DB_PASSWORD || 'password',
});

app.use(cors());
app.use(express.json());
app.use(express.static('dist/public'));

app.use('/api/workflows', workflowRoutes(pool));
app.use('/api/instances', instanceRoutes(pool));
app.use('/api/stats', statsRoutes(pool));

app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'dist/public' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
