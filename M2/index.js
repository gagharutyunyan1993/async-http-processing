const amqp = require('amqplib');
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'M2' },
    transports: [
        new winston.transports.Console()
    ]
});

const QUEUE_NAME = 'tasks';
const RESULT_QUEUE_NAME = 'results';

async function processTask(task) {
    try {
        logger.info('Processing task', { task });

        const result = { id: task.id, result: `Processed task: ${task.id}` };
        logger.info('Task processed', { result });

        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        await channel.assertQueue(RESULT_QUEUE_NAME, { durable: true });
        channel.sendToQueue(RESULT_QUEUE_NAME, Buffer.from(JSON.stringify(result)));
        await channel.close();
        await connection.close();

        return result;
    } catch (error) {
        logger.error('Error processing task', { error });
        throw error;
    }
}

async function main() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        channel.consume(QUEUE_NAME, async message => {
            const task = JSON.parse(message.content.toString());

            try {
                const result = await processTask(task);
                console.log(result);
                channel.ack(message);
            } catch (error) {
                logger.error('Error processing task', { error });
            }
        });

        logger.info('Microservice M2 is processing tasks...');
    } catch (error) {
        logger.error('Error starting microservice M2', { error });
    }
}

main();