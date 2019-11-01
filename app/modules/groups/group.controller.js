'use strict';
const HTTPStatus = require('http-status');
const Group = require('./group.model');
const Scale = require('../scales/scale.model');

const assign = async (group, items) => {
  await group.free();
  const querys = [];
  for (const identifier of items) {
    querys.push(Scale.findOne({ identifier }));
  }
  const scales = await Promise.all(querys);
  const updates = [];
  for (const scale of scales) {
    scale.set({ group: group._id });
    updates.push(scale.save());
  }
  return await Promise.all(updates);
};

const create = async (req, res) => {
  const data = req.body.data ? req.body.data: req.body;
  try {
    const group = await Group.create(data);
    if (!req.body.items) {
      return res.status(201).json(group)
    }
    await assign(group, req.body.items);
    return res.status(201).json(group);
  } catch (e) {
    console.log(e)
    return res.status(HTTPStatus.UNPROCESSABLE_ENTITY).json({ message: e.messsage });
  }
};

const update = async (req, res) => {
  const data = req.body.data ? req.body.data: req.body;
  console.log(req.params.identifier)
  try {
    let group = await Group.findOne({ identifier: req.params.identifier });
    console.log(group)
    group.set(data);
    group = await group.save();
    if (!req.body.items) {
      return res.status(HTTPStatus.OK).json(group);
    }
    await assign(group, req.body.items);
    return res.status(HTTPStatus.OK).json(group);
  } catch (e) {
    console.error(e);
    return res.status(HTTPStatus.UNPROCESSABLE_ENTITY);
  }
};

const del = async (req, res) => {
  try {
    const group = await Group.findOne({identifier: req.params.identifier});
    if (!group) {
      return res.status(HTTPStatus.NOT_FOUND).json({ message: 'not found' });
    }
    await group.free();
    await group.delete();
    return res.status(HTTPStatus.NO_CONTENT).json();
  } catch (e) {
    return res.status(HTTPStatus.BAD_REQUEST).json({ error: 'error' });
  }
};

const get = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    return res.status(HTTPStatus.OK).json(group);
  } catch (e) {
    console.error(error);
    return res.status(HTTPStatus.UNPROCESSABLE_ENTITY).json({ messsage: 'improcesable'});
  }
}

const list = async (req, res) => {
  try {
    const groups = await Group.find().populate('scales');
    return res.status(200).json(groups);
  } catch (e) {
    console.error(e);
    return res.status(HTTPStatus.UNPROCESSABLE_ENTITY).json({ message: 'improcesable'});
  }
}

module.exports = {
  list,
  get,
  del,
  update,
  create,
}