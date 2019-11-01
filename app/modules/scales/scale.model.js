'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;
const uniqueValidator = require('mongoose-unique-validator');

const ScaleSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'name is required!'],
    minlength: [3, 'name too short!'],
    unique: true,      
  },
  identifier: {
    type: String,
    trim: true,
    required: [true, 'identifier is required'],
    minlength: [3, 'identifier is too short'],
    unique: true,
  },
  descr: {
    type: String,
    trim: true,
  },
  sampleTime: {
    type: Number,
    default: 2,
  },
  weightCalc: {
    type: String,
    trim: true,
    required: ['weight calc is required!'],
    enum: ['max', 'avg'],
    default: 'max'
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
  }
});

ScaleSchema.plugin(uniqueValidator, {
  message: '{VALUE} already taken',
})

module.exports = mongoose.model('Scale', ScaleSchema);