'use strict';
const { Router } = require('express');
const validate = require('express-validation');
const groupController = require('./group.controller');
// const groupValidation = require('./group.validation');

const routes = new Router();

routes.post(
    '/',
    groupController.create,
);

routes.get(
    '/',
    groupController.list,
);

routes.put(
    '/:identifier/2',
    groupController.update,
);

routes.delete(
    '/:identifier/2',
    groupController.del,
);

module.exports = routes;