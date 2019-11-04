'use strict';
const predictionRoutes = require('./predictions/prediction.routes');

module.exports = app => {
  app.use('/api/predictions', predictionRoutes);
}