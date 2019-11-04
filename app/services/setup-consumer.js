const predictionController = require('../modules/predictions/prediction.controller');
const { setConsumer } = require('./amqp');

const setupConsumer = () => {
  setConsumer('amqp://guest:guest@127.0.0.1', 'prediction_results', 
  'prediction.results', predictionController.updateFromPredictor);
}

module.exports = {
  setupConsumer,
}