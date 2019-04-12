// example of Jeff Lowery
// https://hackernoon.com/simple-bidirectional-messaging-in-node-js-worker-threads-7fe41de22e3c
const { Worker, isMainThread } = require("worker_threads");

function runService(workerData) {
    const worker = new Worker("./async_service.js", { workerData });

    worker.on("message", sending => console.log({ sending }));
    worker.on("error", code => new Error(`Worker error with exit code ${code}`));
    worker.on("exit", code =>
        console.log(`Worker stopped with exit code ${code}`)
    );

    worker.postMessage("one");
    worker.postMessage("two");
    worker.postMessage("three");
    worker.postMessage("exit");

    //setTimeout(() => worker.postMessage("you won't see me"), 100);
}

async function run() {
    let result = runService("let's begin");
    console.log({ isMainThread, result }); // => { isMainThread: true, result: undefined }
}

run().catch(err => console.error(err));
