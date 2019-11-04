'use strict';
const amqp = require('amqplib');

const connectAngGetChannel = async (url, exchange) => {
    const conn = await amqp.connect(url);
    const channel = await conn.createChannel();
    await channel.assertExchange(exchange, 'topic', { durable: false });
    return channel;
};

const setPublisher = async (url, exchange, key) => {
  const channel = await connectAngGetChannel(url, exchange);
  return (message) => {
    channel.publish(exchange, key, Buffer.from(message), { persistent: true });
  };
};

const setConsumer = async (url, exchange, key, callback) => {
  const channel = await connectAngGetChannel(url, exchange);
  const q = await channel.assertQueue('receiver', { exclusive: true });
  channel.bindQueue(q.queue, exchange, key);
  channel.consume(q.queue, callback);
};

const publisherPromise = setPublisher('amqp://guest:guest@127.0.0.1', 'gene_prediction', 'prediction.created');

module.exports = {
  publisherPromise,
  setConsumer,
}
