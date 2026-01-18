const mongoose = require('mongoose');

const dbConnection = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('La variable de entorno MONGO_URI no está definida');

  try {
    await mongoose.connect(uri);
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err);
    throw new Error('Error a la hora de iniciar la base de datos');
  }
};

module.exports = dbConnection;
