const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Crear un nuevo post
router.post('/create', async (req, res) => {
  try {
    const { title, body } = req.body;
    // Primero verifico que me hayan enviado todo
    if (!title || !body || title.trim() === '' || body.trim() === '') {
      return res.status(400).json({ error: 'Todos los campos son obligatorios y no pueden estar vacíos' });
    }

    const newPost = await Post.create({ title, body });
    res.status(201).json(newPost);
  } catch (error) {
    // Si es error de validación de mongoose devuelvo 400, si no 500
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Traer todos los posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar un post por su ID
router.get('/id/:_id', async (req, res) => {
  try {
    const post = await Post.findById(req.params._id);
    if (!post) return res.status(404).json({ error: 'Post no encontrado' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar posts por título
router.get('/title/:title', async (req, res) => {
  try {
    const posts = await Post.find({ title: req.params.title });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un post
router.put('/id/:_id', async (req, res) => {
  try {
    const updated = await Post.findByIdAndUpdate(req.params._id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Post no encontrado' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Borrar un post
router.delete('/id/:_id', async (req, res) => {
  try {
    const deleted = await Post.findByIdAndDelete(req.params._id);
    if (!deleted) return res.status(404).json({ error: 'Post no encontrado' });
    res.json({ message: 'Post eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Paginación: traigo 10 posts por página
router.get('/postsWithPagination', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Si no me pasan página, uso la 1
    const limit = 10; // Siempre 10 posts por página
    const skip = (page - 1) * limit; // Calculo cuántos tengo que saltar

    const posts = await Post.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Los más nuevos primero

    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit);

    res.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        postsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
