// =============================================================================
// PRESENTATION LAYER - Task Routes
// =============================================================================
// Routes define the HTTP endpoints and delegate to controllers.
// They handle request parsing and response formatting but contain NO
// business logic — that responsibility belongs to the controller/service layer.

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// CRUD Operations
router.get('/', taskController.getAllTasks);
router.get('/range', taskController.getTasksByDateRange);
router.get('/streak', taskController.getStreak);
router.get('/:id', taskController.getTaskById);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.patch('/:id/toggle', taskController.toggleComplete);
router.patch('/:id/day-toggle', taskController.toggleDayCompletion);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
