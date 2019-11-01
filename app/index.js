'use strict';
const express = require('express');
const constants = require('./config/constants');
require('./config/database');
const middlewareConfig = require('./config/middleware');
const apiRoutes = require('./modules');

const app = express();
middlewareConfig(app);

app.get('/', (req, res) => {
  res.send('OK');
});
apiRoutes(app);
const PORT = constants.PORT;

app.listen(PORT, err => {
  if (err) {
    throw err;
  } else {
    console.log(
      `Server running on port: ${PORT}-- -Running on 
        ${process.env.NODE_ENV || 'NODE ENV not set'}
       -- -OK`
    );
  }
});