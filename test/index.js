const test = require("ava");
const sinon = require("sinon");
const queue = require("..");

test("enqueue spawns worker", async (t) => {
  await queue({ filename: "./test/workers/return-true.js" })();
  t.pass();
});

test("enqueue spawns given worker", async (t) => {
  await queue()("./test/workers/return-true.js");
  t.pass();
});

test("given args are passed to worker", async (t) => {
  const args = [1, "string", true];

  const result = await queue()("./test/workers/return-given-args.js", ...args);

  t.deepEqual(result, args);
});

test("worker result is returned", async (t) => {
  const result = await queue()("./test/workers/return-true.js");

  t.true(result);
});

test("sync error in worker returns rejected promise", async (t) => {
  const err = await t.throwsAsync(() =>
    queue()("./test/workers/throw-sync-error.js")
  );

  t.true(err instanceof Error);
  t.is(err.message, "Test sync error");
});

test("async error in worker returns rejected promise", async (t) => {
  const err = await t.throwsAsync(() =>
    queue()("./test/workers/throw-async-error.js")
  );

  t.true(err instanceof Error);
  t.is(err.message, "Async error");
});

test("worker exited with code returns rejected promise", async (t) => {
  const filename = "./test/workers/exit-with-code.js";

  const err = await t.throwsAsync(() => queue()(filename));

  t.true(err instanceof Error);
  t.is(err.message, `Worker "${filename}" stopped with exit code 2`);
});

test("enqueue respects level of parallelism", async (t) => {
  const enqueue = queue({
    filename: "./test/workers/wait-one-second.js",
    parallelism: 2,
  });

  const spies = Array.from({ length: 3 }, () => sinon.spy());
  spies.map((spy) => enqueue().then(spy));

  const allPending = spies.reduce((pending, spy) => pending && spy.notCalled);
  t.true(allPending);

  // TODO: Use worker thread sync primitives instead of timers
  await new Promise((resolve) => setTimeout(resolve, 200));

  t.true(spies[0].calledOnce);
  t.true(spies[1].calledOnce);
  t.true(spies[2].notCalled);

  await new Promise((resolve) => setTimeout(resolve, 200));

  t.true(spies[0].calledOnce);
  t.true(spies[1].calledOnce);
  t.true(spies[2].calledOnce);
});
