const express = require('express');
const bodyParser = require('body-parser');
const amqp = require('amqplib');
const winston = require('winston');

const app = express();
app.use(bodyParser.json());

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'M1' },
    transports: [
        new winston.transports.Console()
    ]
});

const QUEUE_NAME = 'tasks';
const RESULT_QUEUE_NAME = 'results';

let connection;
let channel;

amqp.connect('amqp://localhost')
    .then(conn => {
        connection = conn;
        return conn.createChannel();
    })
    .then(ch => {
        channel = ch;
        return ch.assertQueue(QUEUE_NAME, { durable: true });
    })
    .then(() => channel.assertQueue(RESULT_QUEUE_NAME, { durable: true }))
    .then(() => {
        logger.info('Connected to RabbitMQ');
    })
    .catch(error => {
        logger.error('Could not connect to RabbitMQ', { error });
        process.exit(1);
    });

app.post('/process', async (req, res) => {
    try {
        const task = req.body;
        logger.info('Received HTTP request', { task });

        channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(task)));

        channel.consume(RESULT_QUEUE_NAME, message => {
            const result = JSON.parse(message.content.toString());

            if (result.id === task.id) {
                res.status(200).json(result);
                channel.ack(message);
            }
        });
    } catch (error) {
        logger.error('Error processing HTTP request', { error });
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(3002, () => {
    logger.info('Microservice M1 listening on port 3002');
});