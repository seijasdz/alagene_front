'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;
const uniqueValidator = require('mongoose-unique-validator');

const PredictionSchema = new Schema({
  dna: {
    type: String,
    required: [true, 'dna is required']
  },
  result: {
    type: mongoose.Schema.Types.Mixed
  }
});

const Prediction = mongoose.model('Prediction', PredictionSchema);
module.exports = Prediction;

