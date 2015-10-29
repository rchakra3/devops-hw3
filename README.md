# HW #3 Proxies, Queues, Cache Fluency.

## Artifacts:
- [Main Server Instance - app.js](app.js)
- [Proxy Server - proxy.js](proxy.js)
- [Screencast](https://youtu.be/AQH4UJASegE)


## Running:

```
npm install
node app.js 3000& node app.js 3001& node app.js 3002& (etc)
node proxy.js 3000 3001 3002
```

## Functionality:

- ***Basic set/get, request, upload functionality***
    - As described in https://github.com/CSC-DevOps/Queues

- ***Run an additional instance of the service layer (main.js) on a different port (e.g., 3001):***
	- In the screencast, I've created instances at 3000, 3001, 3002. The file is app.js, not main.js.

- ***Create a proxy that will uniformly deliver requests to localhost/ to localhost:3000, localhost:3001, etc.  Use redis to look up which host to resolve to:***
    - I've created a file proxy.js that uses http-proxy and a redis queue to implement this functionality. The head of the queue contains the address of the next node that will service the request.