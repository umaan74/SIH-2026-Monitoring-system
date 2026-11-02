/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './server/api.js';
import { db } from './server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();

  // Standard middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Initialize and seed database
  await db.initialize();

  // Mount API endpoints under /api
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'UP',
      product: 'IN-Sight',
      team: 'InfluenCode',
      theme: 'Smart Automation (SIH 2026)',
      timestamp: new Date().toISOString()
    });
  });

  if (!isProd) {
    // Development mode: Mount Vite dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log(`[IN-Sight] Vite dev middleware attached in development mode.`);
  } else {
    // Production mode: Serve built static assets from dist/
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log(`[IN-Sight] Production static files served from ${distPath}`);
  }

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 IN-Sight Full-Stack Platform Running on Port ${PORT}`);
    console.log(`   Theme: Smart India Hackathon 2026 - Smart Automation`);
    console.log(`   Team: InfluenCode`);
    console.log(`   API Endpoint: http://localhost:${PORT}/api`);
    console.log(`=======================================================`);
  });
}

startServer().catch((err) => {
  console.error('[IN-Sight] Fatal error starting server:', err);
  process.exit(1);
});
