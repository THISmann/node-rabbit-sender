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

(async () => {
  try {
    const connection = await amqp.connect("amqp://127.0.0.1");
    const channel = await connection.createChannel();

    process.once("SIGINT", async () => {
      await channel.close();
      await connection.close();
    });

    await channel.assertQueue(queue, { durable: false });
    await channel.consume(
      queue,
      (message) => {
        console.log('____________________________')
        console.log(message)
        console.log('____________________________')
        if (message) {
          console.log(
            " [x] Received '%s'",
            JSON.parse(message.content.toString())
          ); 
          // logging for receive message 
          // send log !!!
            logger.log({
              level: 'info',
              status: 'receive',
              message: 'item '+ message.fields.routingKey,
              timestamp:timestamp('YYYY/MM/DD:HH:mm:ss'),
            });
        }
      },
      { noAck: true }
    );

    console.log(" [*] Waiting for messages. To exit press CTRL+C");
  } catch (err) {
    console.warn(err);
  }
})();