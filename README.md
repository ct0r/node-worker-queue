# ct0r/worker-queue

[Worker thread] queue for Node.js.

## Installation

```bash
npm install @ct0r/worker-queue
```

## Usage

```js
// index.js
const queue = require("@ct0r/worker-queue");

const enqueue = queue({ parallelism: 2 });

Promise.all([
  enqueue("./parse-xml-worker.js", xml1),
  enqueue("./parse-xml-worker.js", xml2),
]);
```

```js
// parse-xml-worker.js
const { work } = require("@ct0r/worker-queue");

work((xml) => {
  // ...
});
```

or

```js
const enqueue = queue({
  filename: "./parse-xml-worker.js",
  parallelism: 2,
});

await Promise.all([enqueue(xml1), enqueue(xml2)]);

// or

await Promise.all([xml1, xml].map(enqueue));
```

## API

#### `queue({ filename, parallelism = 1 })`

Sets level of parallelism and returns `enqueue` function.

#### `enqueue(...args)`

Returned by `queue` if `filename` is provided.

#### `enqueue(filename, ...args)`

Returned by `queue` if `filename` is not provided.

#### `work(fn)`

Invokes given function inside of worker and delegates errors back to queue.

[worker thread]: https://nodejs.org/dist/latest/docs/api/worker_threads.html
