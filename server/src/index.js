import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';
import dashboardRoutes from './routes/dashboard.js';
import { setupSocket } from './socket.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

// --- Middleware ---
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Attach Socket.io to app for use in routes
app.set('io', io);

// --- Health Check ---
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'QuickServe API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);

// --- Socket.io ---
setupSocket(io);

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n  ╔══════════════════════════════════════╗`);
  console.log(`  ║     🍽️  QuickServe API Server        ║`);
  console.log(`  ╠══════════════════════════════════════╣`);
  console.log(`  ║  Port:    ${PORT}                        ║`);
  console.log(`  ║  Health:  http://localhost:${PORT}/health ║`);
  console.log(`  ║  Socket:  ✓ WebSocket ready           ║`);
  console.log(`  ╚══════════════════════════════════════╝\n`);
});
