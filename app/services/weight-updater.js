'use strict';
const broker = require('./amqp-broker');
const ScaleModel = require('../modules/scales/scale.model');
const axios = require('axios');
const { MANAGER_URL_START, MANAGER_URL_END } = require('../config/constants');

const MAX_WEIGHT_ARRAY = 20;
const TIME_TO_END = 1;
const SCALE_UPDATE_TIMEOUT = 20;

class UndefinedScaleError extends Error {}
class UndefinedModelError extends Error {}
class SerialPortScaleConectionError extends Error {}
class ScaleWaitUpdateTimeout extends Error {}


class ScaleStatus {
  constructor(identifier) {
    this.connected = false;
    this.identifier = identifier;
    this.lastUpdate = 0;
    this.active = false;
    this.lastValidWeightEpoch = 0
    this.recentWeights = [];
    this.modelData = undefined
    ScaleModel.findOne({ identifier }).populate('group').then((scalex => {
      this.modelData = scalex;
      console.log('data assigned to', identifier, scalex);
    }));
  }
  checkAlive() {
    const nowEpoch = Math.floor((new Date).getTime()/1000);
    if (nowEpoch - this.lastUpdate > SCALE_UPDATE_TIMEOUT) {
      throw new ScaleWaitUpdateTimeout('La balanza dejó de envíar información / Tiempo de espera superado');
    }
  }
  updateModel(model){
    this.modelData = model;
    console.log(model);
  }
  update(info) {
    this.lastUpdate = info.epoch;
    this.connected = info.connected;
    this.updateWeights(info.weight, info.epoch);
  }
  updateWeights(weight, epoch) {
    this.recentWeights.push({ weight, epoch });
    if (this.recentWeights.length >= MAX_WEIGHT_ARRAY) {
      this.recentWeights.shift();
    }
    this.checkActivate(weight, epoch);
  }
  checkActivate(weight, epoch) {
    if (!this.modelData || !this.modelData.group ||!this.modelData.group.minweight) {
      return;
    }
    if (weight < this.modelData.group.minweight) {
      const nowEpoch = Math.floor((new Date).getTime() / 1000);
      const timeToEnd = this.modelData.group.wait || TIME_TO_END;
      if (this.active && nowEpoch - this.lastValidWeightEpoch >= timeToEnd) { // Desactiva después de pasado tiempo TIME_TO_END
        this.active = false;
        this.endActivation();
        console.log('se acabo');
      }
      return;
    }
    this.lastValidWeightEpoch = epoch;
    if (!this.active) { // Activa si no lo está
      this.active = true;
      this.startActivation(weight);
    }
  }
  async endActivation() {
    try {
      const data = {
        data: {
          weight,
          id: this.identifier,
          timestamp: Math.floor((new Date).getTime()/1000),
        },
        conf: {
          preKey: this.prekey,
          activatorId: this.identifier,
          devicetype: 'scale_car',
          id: this.identifier,
        }
      }
      await axios({
        url: MANAGER_URL_END,
        method: 'POST',
        timeout: 4000,
        data,
      });
    } catch (e) {
      console.error(e);
      console.log(e.response);
    }
  }
  async startActivation(weight) {
    const data = {
      data: {
        weight,
        id: this.identifier,
        timestamp: Math.floor((new Date).getTime()/1000),
      },
      conf: {
        activatorId: this.identifier,
        devicetype: 'scale_car',
        id: this.identifier,
      },
    };
    try {
      this.prekey = await axios({
        url: MANAGER_URL_START,
        method: 'POST',
        timeout: 4000,
        data,
      });
    } catch (e) {
      console.error(e);
      console.log(e.response);
    }
  }
  calcWeight() {
    this.checkAlive();
    const nowEpoch = Math.floor((new Date).getTime()/1000);
    const datas = [];
    const sampleTime = this.modelData && this.modelData.group && this.modelData.group.lotLife ? this.modelData.group.lotlife: 2;
    for (const wdata of this.recentWeights) {
      const olderValidEpoch = nowEpoch - sampleTime;
      if (wdata.epoch >= olderValidEpoch) {
        datas.push(wdata);
      }
    }
    if (this.modelData.weightCalc === 'max') {
      return this.max(datas);
    } else if (this.modelData.weightCalc === 'avg') {
      return this.avg(datas);
    }
  }
  avg(datas) {
    //TODO
    return 0;
  }
  max(datas) {
    let maxWeight = 0;
    for (const w of datas) {
      if (w.weight > maxWeight) {
        maxWeight = w.weight;
      }
    }
    return maxWeight;
  }
  getWeight() {
    if (!this.modelData) {
      throw new UndefinedModelError('¡La balanza no está definida en la base de datos!');
    }
    if (!this.connected) {
      throw new SerialPortScaleConectionError('¡Error de conexión en el puerto serial!');
    }
    return this.calcWeight();
    
  }
}



const scaleManager = () => {
  const scales = {}
  const receive = (message) => {
    const body = JSON.parse(message.content.toString());
    const identifier = body.identifier;
    let scale = scales[identifier];
    if (!scale)  {
      scales[identifier] = scale = new ScaleStatus(identifier);
    }
    scale.update(body);
  }
  const getWeight = identifier => {
    if (!scales[identifier]) {
      throw new UndefinedScaleError(`¡Balanza con identifier ${identifier} no ha enviado información!`);
    }
    return scales[identifier].getWeight();
  }

  const updateModel = (identifier, model) => {
    const scale = scales[identifier];
    console.log('updating1')
    if (scale){
      console.log('updating2')
      scale.updateModel(model);
    }
  }
  return { receive, getWeight, updateModel };
}

const sm = scaleManager();

broker.on('scale.weight', sm.receive);

module.exports.getWeight = sm.getWeight;
module.exports.updateModel = sm.updateModel;
module.exports.exceptions = {
  SerialPortScaleConectionError,
  UndefinedModelError,
  UndefinedScaleError,
  ScaleWaitUpdateTimeout,
}
