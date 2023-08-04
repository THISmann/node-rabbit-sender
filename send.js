const amqp = require("amqplib");
const config = require("./config");
const timestamp = require('time-stamp');
const logger = require("./logger");

class Sender{
    channel;
    /**
     * create a channel
     */
    async createChannel() {
        const connection = await amqp.connect(config.rabbitMQ.url);
        this.channel = await connection.createChannel();
    }

    /**
     * publish the message
     * @param {string} routingKey 
     * @param {string} message 
     */
    async publishMessage(routingKey , message){
        if (!this.channel) {
            await this.createChannel();  
        }

        const exchangeName = config.rabbitMQ.exchangeName;
        await this.channel.assertExchange(exchangeName, "direct");

        // log information
        const logDetails = {
            logType: routingKey,
            message: message,
            timeStamp: timestamp('YYYY/MM/DD:HH:mm:ss'),
        };

        // local log file 
        logger.log({
            level: 'info',
            logType: routingKey,
            message: message,
            timeStamp: timestamp('YYYY/MM/DD:HH:mm:ss'),
        })

        await this.channel.publish(
            exchangeName,
            routingKey,
            Buffer.from(JSON.stringify(logDetails))
        );

        console.log(
            `The new ${routingKey} log is sent to exchange ${exchangeName}`
        );
    }
}

module.exports = Sender;