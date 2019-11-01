'use strict';
const amqp = require('amqplib');
const constants = require('../config/constants');

const EXCHANGE = 'scale_car';

const connect = () => {
  const connectionPromise = amqp.connect(constants.AMQP_URL);
  const channelPromise = connectionPromise.then(async (conn) => {
    const ch = await conn.createChannel();
    await ch.assertExchange(EXCHANGE, 'topic', { durable: false });
    return ch;
  }).catch(async e => {
    console.log(e);
    process.exit(1);
  });

  channelPromise.catch( err => {
    console.error(err);
  });
  return {
    channelPromise,
  }
}

const manage = (connect) => {
  const events = {};
  const {channelPromise} = connect();

  const executeCallbacks = (key, message) => {
    const callbacks = events[key];
    for (const callback of callbacks) {
      callback(message);
    }
  };

  const on = async (key, callback) => {
    try {
      const channel = await channelPromise;
      if (!events[key]) {
        const q = await channel.assertQueue('', {exclusive: true});
        channel.bindQueue(q.queue, EXCHANGE, key);
        channel.consume(q.queue, (message) => {
          executeCallbacks(key, message);
        }, {noAck: false});
      }
      events[key] = events[key] ? events[key].concat([callback]): [callback];
      console.log('done');
    } catch (err) {
      console.error(err);
    }
  }

  const notify = async (exchange, type, key, message, durable) => {
    try {
      const channel = await channelPromise;
      await channel.assertExchange(exchange, type, {durable});
      channel.publish(exchange, key, new Buffer.from(message));
    } catch (err) {
      console.error(err);
    }
  }

  return {
    on,
    notify,
  }
} 

const handles = manage(connect);

module.exports.on = handles.on;
module.exports.notify = handles.notify;