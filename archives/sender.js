const amqp = require('amqplib');
const winston = require('winston');
const timestamp = require('time-stamp');
const queue = "product_today";

// logger 
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// DATA OBJECT
const data = {
  item_id: "macbook",
  text: "This is a sample message to send receiver to check the ordered Item Availablility",
  price: "this is the price",
  amount: 12000
};

// send log !!!
logger.log({
  level: 'info',
  status: 'send',
  message: 'item '+ data.item_id+ ' add',
  timestamp: timestamp('YYYY/MM/DD:HH:mm:ss')
});

(async () => {
  let connection;
  try {
    connection = await amqp.connect("amqp://127.0.0.1");
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: false });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
    console.log(" [x] Sent '%s'", data); 
    await channel.close();
  } catch (err) {
    console.warn(err);
  } finally {
    if (connection) await connection.close();
  }
})();