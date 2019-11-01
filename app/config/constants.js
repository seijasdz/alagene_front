'use strict';
module.exports = {
  PORT: process.env.PORT || 3000,
  MONGO_URL: process.env.MONGO_URL || 'mongodb://raul:123456@127.0.0.1:27017/orc',
  JWT_SECRET: process.env.JWT_SECRET || 'zecrett'
}