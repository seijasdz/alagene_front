'use strict';
const HTTPStatus = require('http-status');
const Scale = require('./scale.model')
const weightUpdater = require('../../services/weight-updater');

const create = async (req, res) => {
  try {
    const scale = await Scale.create(req.body);
    return res.status(HTTPStatus.CREATED).json(scale);
  } catch (e) {
    return res.status(HTTPStatus.BAD_REQUEST).json(e);
  }
};

const getList = async (req, res) => {
  try {
    const scales = await Scale.find({});
    return res.status(HTTPStatus.OK).json(scales);
  } catch (e) {
    return res.status(HTTPStatus.BAD_REQUEST).json(e);
  }
};

const getById = async (req, res) => {
  try {
    const scale = await Scale.findOne({ identifier: req.params.id });
    if (!scale) {
      return res.status(404).json({ message: 'Scale not found!' });
    }
    return res.status(HTTPStatus.OK).json(scale);
  } catch (e) {
    return res.status(HTTPStatus.BAD_REQUEST).json(e);
  }
}

const update = async (req, res) => {
  try {
    const scale = await Scale.findOne({ identifier: req.params.id });
    scale.set(req.body);
    const updatedScale = await scale.save();
    weightUpdater.updateModel(req.params.id, updatedScale);
    return res.status(HTTPStatus.OK).json(updatedScale);
  } catch (e) {
    return res.status(HTTPStatus.BAD_REQUEST).json({ message: e });
  }
}

const deleteOne = async (req, res) => {
  try {
    const scale = await Scale.findOne({ identifier: req.params.id });
    await scale.remove();
    return res.sendStatus(HTTPStatus.OK);
  } catch (e) {
    return res.status(BAD_REQUEST).json(e);
  }
}


const weight = async (req, res) => {
  try {
    const weight = weightUpdater.getWeight(req.params.identifier);
    return res.status(200).json({ weight });
  } catch (e) {
    if (e instanceof weightUpdater.exceptions.SerialPortScaleConectionError) {
      return res.status(500).json({ message: e.message });
    }
    if (e instanceof weightUpdater.exceptions.ScaleWaitUpdateTimeout) {
      return res.status(500).json({ message: e.message });
    }
    return res.status(400).json({ message: e.message });
  }
};

module.exports = {
  create,
  getList,
  getById,
  update,
  deleteOne,
  weight,
}