'use strict';
const { Router } = require('express');
const validate = require('express-validation');
const scaleController = require('./scale.controller');
const scaleValidation = require('./scale.validation');

const routes = new Router();

routes.post(
  '/',
  scaleController.create,
);

routes.get(
  '/',
  scaleController.getList,
);

routes.get(
  '/:id',
  scaleController.getById,
);

routes.put(
  '/:id',
  scaleController.update,
);

routes.delete(
  '/:id',
  scaleController.deleteOne,
);

routes.get(
  '/:identifier/weight',
  scaleController.weight,
);

routes.use((err, req, res, next) => {
  if (err instanceof validate.ValidationError) {
    res.status(err.status).json(err);
  }
});

module.exports = routes;
