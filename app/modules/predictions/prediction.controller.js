'use strict';
const HTTPStatus = require('http-status');
const Prediction = require('./prediction.model');
const { publisherPromise } = require('../../services/amqp');
const { makeGff } = require('../../helpers/gffSerializer');


const create = async (req, res) => {
  try {
    const prediction = await Prediction.create(req.body);
    const publish = await publisherPromise;
    publish(JSON.stringify(prediction));
    res.status(HTTPStatus.CREATED).json(prediction);
  } catch (e) {
    const consumer = (message) => {
      const body = JSON.parse(message.content.toString());
      console.log(body)
    }
    res.status(HTTPStatus.BAD_REQUEST).json({ message: e.message });
  }
};

const list = async (req, res) => {
  try {
    const predictions = await Prediction.find();
    res.status(HTTPStatus.OK).json(predictions);
  } catch (e) {
    res.status(HTTPStatus.BAD_REQUEST).json({ message: e.message });
  }
}

const get = async (req, res) => {
  try {
    const prediction = await Prediction.findById(req.params.id);
    if (!prediction) {
      return res.status(HTTPStatus.NOT_FOUND).json({ message: 'not found' });
    }
    res.status(HTTPStatus.OK).json(prediction);
  } catch (e) {
    res.status(HTTPStatus.BAD_REQUEST).json({ message: 'not found'});
  }
}

const updateFromPredictor = async (fullMessage) => {
  try {
    const body = JSON.parse(fullMessage.content.toString());
    const prediction = await Prediction.findById(body._id);
    if (prediction) {
      prediction.set({ result: body.result });
      await prediction.save();
    }
  } catch (e) {
    console.error(e);
  }
}

const getGff = async (req, res) => {
  try {
    const prediction = await Prediction.findById(req.params.id, 'seq_id result');
    if (!prediction) {
      return res.status(HTTPStatus.NOT_FOUND).json({ message: 'not found' });
    }
    return res.status(HTTPStatus.OK).send(makeGff(prediction));
  } catch (e) {
    return res.status(HTTPStatus.BAD_REQUEST).json({ message: e.message });
  }
};

module.exports = {
  create,
  list,
  get,
  updateFromPredictor,
  getGff,
}