const todoService = require('../services/todoService');

exports.getAllTodos = async (req, res) => {
  try {
    const todos = await todoService.findAll();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
};

exports.getHealthyStats = async (req, res) => {
  try {
    const stats = await todoService.getHealthyStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch healthy stats' });
  }
};

exports.createTodo = async (req, res) => {
  try {
    const { title, deadline, category } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const todo = await todoService.create({
      title,
      deadline: deadline ? new Date(deadline) : null,
      category: category || 'general',
    });
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
};

exports.updateTodo = async (req, res) => {
  try {
    const { title, deadline, category, isCompleted } = req.body;
    const existing = await todoService.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const todo = await todoService.update(req.params.id, {
      title,
      deadline: deadline ? new Date(deadline) : undefined,
      category,
      isCompleted,
    });
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
};

exports.toggleComplete = async (req, res) => {
  try {
    const existing = await todoService.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const todo = await todoService.update(req.params.id, {
      isCompleted: !existing.isCompleted,
    });
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle todo' });
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    const existing = await todoService.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    await todoService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
};
