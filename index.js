const { Worker, workerData, parentPort } = require("worker_threads");

const queue = ({ filename, parallelism = 1 } = {}) => {
  let pendings = 0;
  const workers = [];

  const next = () => {
    if (pendings >= parallelism || !workers.length) return;

    const { filename, args, resolve, reject } = workers.shift();

    pendings++;

    invoke(filename, args)
      .then((val) => {
        pendings--;
        resolve(val);
      })
      .catch((err) => {
        pendings--;
        reject(err);
      })
      .finally(next);
  };

  const enqueue = (filename, args) =>
    new Promise((resolve, reject) => {
      workers.push({ filename, args, resolve, reject });
      next();
    });

  return filename
    ? (...args) => enqueue(filename, args)
    : (filename, ...args) => enqueue(filename, args);
};

function invoke(filename, args) {
  try {
    return new Promise((resolve, reject) => {
      let error, result;

      new Worker(filename, { workerData: JSON.stringify(args) })
        .on("exit", (code) => {
          if (code !== 0 && !error) {
            error = new Error(
              `Worker "${filename}" stopped with exit code ${code}`
            );
          }

          error ? reject(error) : resolve(result);
        })
        .on("error", (err) => (error = err))
        .on("message", ({ type, data }) => {
          if (type === "end") result = data;
          if (type === "error") error = data;
        });
    });
  } catch (err) {
    return Promise.reject(err);
  }
}

async function work(fn) {
  try {
    const result = await fn(...JSON.parse(workerData));
    parentPort.postMessage({ type: "end", data: result });
  } catch (err) {
    parentPort.postMessage({ type: "error", data: err });
  }
}

module.exports = queue;
module.exports.work = work;
