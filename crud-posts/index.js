require('dotenv').config({ path: './env/.env' });
const express = require('express');
const dbConnection = require('./config/config');
const postRoutes = require('./routes/posts');

const app = express();
app.use(express.json());
app.use('/posts', postRoutes);

// Función para iniciar el servidor
const startServer = async () => {
  try {
    await dbConnection();
    console.log('Conexión a MongoDB exitosa');

    const PORT = process.env.PORT || 8080;
    return app.listen(PORT, () =>
      console.log(`Servidor iniciado en http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error('Error a la hora de iniciar la base de datos', err);
    process.exit(1);
  }
};

// Solo inicia el servidor si ejecuto este archivo directamente
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
