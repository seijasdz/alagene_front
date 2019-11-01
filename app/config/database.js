'use strict';
const mongoose = require('mongoose');
const constants = require('./constants');

(async () => {
  try {
    mongoose.Promise = global.Promise;
    await mongoose.connect(constants.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
    console.log('Mongo Running')
  } catch (err) {
    console.error(err);
  }
})();