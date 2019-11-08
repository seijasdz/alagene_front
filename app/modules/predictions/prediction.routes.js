'use strict';
const { Router } = require('express');
const predictionController = require('./prediction.controller');
const routes = new Router();

routes.post('/', predictionController.create);
routes.get('/', predictionController.list);
routes.get('/:id', predictionController.get);
routes.get('/:id/gff', predictionController.getGff);

module.exports = routes;