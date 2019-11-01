const morgan = require('morgan');
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');


const isDev = process.env.NODE_ENV === 'developement';
const isProd = process.env.NODE_ENV === 'production';

module.exports = (app) => {
  if (isProd) {
    app.use(compression());
    app.use(helmet());
  }
  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  app.use(morgan('dev'));

    // CORS
  app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization, Content-Type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
  });
}