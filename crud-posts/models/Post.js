const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'El título es obligatorio'],
    trim: true,
    minlength: [1, 'El título no puede estar vacío']
  },
  body: { 
    type: String, 
    required: [true, 'El cuerpo del post es obligatorio'],
    trim: true,
    minlength: [1, 'El cuerpo del post no puede estar vacío']
  },
}, {
  timestamps: true // Esto me añade createdAt y updatedAt solo
});

module.exports = mongoose.model('Post', postSchema);
