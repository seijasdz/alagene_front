'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;
const uniqueValidator = require('mongoose-unique-validator');

const GroupSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  identifier: {
    type: String,
    required: true,
    unique: true,
  },
  descr: {
    type: String,
  },
  wait: {
    type: Number,
    required: true,
  },
  lotLife: {
    type: Number,
    required: true,
  },
  minweight: {
    type: Number,
    required: true,
  }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }});

GroupSchema.virtual('scales', {
  ref: 'Scale',
  localField: '_id',
  foreignField: 'group',
  justOne: false,
});

GroupSchema.plugin(uniqueValidator);

GroupSchema.statics = {
  async clean() {
    const groups = await this.find().populate('scales').exec();
    for (const group of groups) {
      if (!group.scales || (group.scales && !group.scales.length)) {
        group.remove();
      }
    }
  }
}

GroupSchema.methods = {
  async free() {
    const scales = (await this.populate('scales').execPopulate('scales')).scales;
    const saves = [];
    for (const scale of scales) {
      scale.set({ group: undefined });
      saves.push(scale.save());
    }
    return Promise.all(saves);
  }
}

module.exports = mongoose.model('Group', GroupSchema);