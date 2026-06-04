// =============================================================================
// APPLICATION ENTRY POINT
// =============================================================================
// This file bootstraps the Express server and wires together the 3-tier
// architecture: routes (Presentation) -> controllers (Business Logic) ->
// services (Data Access via Prisma).

const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');
const todoRoutes = require('./routes/todoRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// =============================================================================
// PRESENTATION LAYER - Route Registration
// =============================================================================
// Routes define the HTTP API interface that the frontend consumes.
app.use('/api/tasks', taskRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`LifePlanner backend running on port ${PORT}`);
});

module.exports = app;
