// Play with a pool of 4 workers
const { Worker, isMainThread } = require("worker_threads");

var pool = ['worker1', 'worker2', 'worker3', 'worker4'];

function runService(workerData) {
    const threads = new Map();
    console.log(`Running with ${pool.length} threads...`);
    for (let i = 0, imax=pool.length; i < imax; i++) {
        console.log(`Thread ${i} runs with value : ${pool[i]}`);
        threads.set(pool[i], new Worker("./async_service.js", { workerData: { value: pool[i] }}));
    }

    for (let [key, worker] of threads.entries()) {
        worker.on('error', (err) => { throw err; });
        worker.on('exit', () => {
            threads.delete(key);
            console.log(`Thread ${key} exiting, ${threads.size} running...`);
        })
        worker.on('message', (msg) => {
            console.error(msg);
        });

        worker.postMessage("one");
        worker.postMessage("two");
        worker.postMessage("three");

        setTimeout(() => worker.postMessage("exit"), 300);
    }

}

async function run() {
    let result = runService("let's begin");
    console.log({ isMainThread, result }); // => { isMainThread: true, result: undefined }
}

run().catch(err => console.error(err));
