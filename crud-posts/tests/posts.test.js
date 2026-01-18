const path = require('path');
const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../index');
const Post = require('../models/Post');

require('dotenv').config({ path: path.join(__dirname, '../env/.env') });

describe('Posts API', () => {
  // Me conecto a la BD antes de empezar los tests
  beforeAll(async () => {
    const uri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
    if (!uri) throw new Error('La variable de entorno MONGO_URI o MONGO_URI_TEST no está definida');
    await mongoose.connect(uri);
  });

  // Limpio todo y cierro la conexión cuando terminen los tests
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  // Antes de cada test borro todos los posts para empezar limpio
  beforeEach(async () => {
    await Post.deleteMany({});
  });

  test('POST /posts/create - debe crear un post', async () => {
    const newPost = { title: 'Post Test', body: 'Contenido Test' };
    const res = await request(app).post('/posts/create').send(newPost);
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe(newPost.title);
    expect(res.body.body).toBe(newPost.body);
    expect(res.body._id).toBeDefined();
    expect(res.body.createdAt).toBeDefined();
    expect(res.body.updatedAt).toBeDefined();
  });

  test('POST /posts/create - debe fallar si faltan campos obligatorios', async () => {
    const res1 = await request(app).post('/posts/create').send({ title: 'Solo título' });
    expect(res1.statusCode).toBe(400);
    expect(res1.body.error).toBeDefined();

    const res2 = await request(app).post('/posts/create').send({ body: 'Solo cuerpo' });
    expect(res2.statusCode).toBe(400);
    expect(res2.body.error).toBeDefined();

    const res3 = await request(app).post('/posts/create').send({});
    expect(res3.statusCode).toBe(400);
    expect(res3.body.error).toBeDefined();
  });

  test('GET /posts - debe traer todos los posts', async () => {
    const post = new Post({ title: 'Post 1', body: 'Contenido 1' });
    await post.save();

    const res = await request(app).get('/posts');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe('Post 1');
  });

  test('GET /posts/id/:_id - debe traer un post por ID', async () => {
    const post = new Post({ title: 'Post ID', body: 'Contenido ID' });
    await post.save();

    const res = await request(app).get(`/posts/id/${post._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Post ID');
  });

  test('GET /posts/title/:title - debe traer un post por título', async () => {
    const post = new Post({ title: 'Titulo Especial', body: 'Contenido Especial' });
    await post.save();

    const res = await request(app).get(`/posts/title/${encodeURIComponent(post.title)}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].title).toBe('Titulo Especial');
  });

  test('PUT /posts/id/:_id - debe actualizar un post', async () => {
    const post = new Post({ title: 'Original', body: 'Antes' });
    await post.save();

    const res = await request(app)
      .put(`/posts/id/${post._id}`)
      .send({ title: 'Actualizado', body: 'Después' });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Actualizado');
    expect(res.body.body).toBe('Después');
  });

  test('DELETE /posts/id/:_id - debe eliminar un post', async () => {
    const post = new Post({ title: 'Para borrar', body: 'Eliminar' });
    await post.save();

    const res = await request(app).delete(`/posts/id/${post._id}`);
    expect(res.statusCode).toBe(200);

    const check = await Post.findById(post._id);
    expect(check).toBeNull();
  });

  test('GET /posts/postsWithPagination - debe traer posts paginados', async () => {
    // Creo 15 posts para probar que la paginación funciona bien
    for (let i = 1; i <= 15; i++) {
      await Post.create({ title: `Post ${i}`, body: `Contenido ${i}` });
    }

    // Pruebo la primera página
    const res1 = await request(app).get('/posts/postsWithPagination?page=1');
    expect(res1.statusCode).toBe(200);
    expect(res1.body.posts.length).toBe(10);
    expect(res1.body.pagination.currentPage).toBe(1);
    expect(res1.body.pagination.totalPages).toBe(2);
    expect(res1.body.pagination.totalPosts).toBe(15);
    expect(res1.body.pagination.hasNextPage).toBe(true);
    expect(res1.body.pagination.hasPrevPage).toBe(false);

    // Pruebo la segunda página
    const res2 = await request(app).get('/posts/postsWithPagination?page=2');
    expect(res2.statusCode).toBe(200);
    expect(res2.body.posts.length).toBe(5);
    expect(res2.body.pagination.currentPage).toBe(2);
    expect(res2.body.pagination.hasNextPage).toBe(false);
    expect(res2.body.pagination.hasPrevPage).toBe(true);
  });
});
