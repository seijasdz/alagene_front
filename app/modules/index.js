'use strict';
//const scaleRoutes = require('./scales/scale.routes');
//const groupRoutes = require('./groups/group.routes');
const predictionRoutes = require('./predictions/prediction.routes');

module.exports = app => {
  //app.use('/sca/v1/scales', scaleRoutes);
  //app.use('/sca/v1/groups', groupRoutes);
  app.use('/api/predictions', predictionRoutes);
}