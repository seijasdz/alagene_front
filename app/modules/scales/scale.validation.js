const joi = require('joi');

module.exports = {
  createScale: {
    body: {
      name: joi.string().min(3).required(),
    }
  }
}