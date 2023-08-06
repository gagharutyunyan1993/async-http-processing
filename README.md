# Async HTTP Processing
## Description

Example of asynchronous processing of HTTP requests using Node.js and RabbitMQ.

It consists of two microservices:
* M1 - accepts an HTTP request, puts the task in the RabbitMQ queue, gets the result from another queue and returns it in response to the HTTP request.

* M2 - retrieves tasks from the RabbitMQ queue, processes them and puts the result in another queue.
### Requirements

- Node.js (version 14 or higher)
- RabbitMQ (local or remote)

### Setup

1. Clone this repository:
```bash
git clone https://github.com/gagharutyunyan1993/async-http-processing.git
```
```
cd async-http-processing/M1
```
Or
```
cd async-http-processing/M2
```

2. Install dependencies:
```
npm install
```

3. Configure RabbitMQ connection:
* Open index.js.
* Find and update the RabbitMQ connection URL if needed.

4. Start the microservice:
```
npm start
```

5. Send an HTTP request to http://localhost:3002/process for processing.
```json
{
  "id": 1,
  "data": "Привет ООО Грин-Апи!"
}
```