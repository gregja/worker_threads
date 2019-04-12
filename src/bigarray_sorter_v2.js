// Example more interesting with 9 workers ;)
// note that the code of the worker is in an external file

const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

const path = require("path");

// create some big array
const elements = 1000000;
const bigArray = Array(elements).fill().map(() => Math.random());

// we get the path of the script
const workerScript = path.join(__dirname, "./bigarray_worker.js");
console.log(workerScript);

let timers = [];
let results = [];

const nb_workers = 9;

const threads = new Set();

for (let i = 0; i < nb_workers; i++) {
    console.log(`Thread ${i} runs `);
    timers[i] = Date.now();
    threads.add(new Worker(workerScript, { workerData: bigArray }));
}

for (let worker of threads) {
    worker.on('error', (err) => { throw err; });
    worker.on('exit', () => {
        threads.delete(worker);
        console.log(`Thread exiting, ${threads.size} running...`);
        if (threads.size === 0) {
            console.log('finish !!!')
            for (let i=0, imax=results.length; i<imax; i++) {
                let result = results[i];
                console.log(
                    `sorted array ${i} of ${result.length} items in ${Date.now() - timers[i]}ms`
                  );
            }
        }
    });
    worker.on('message', (msg) => {
        results.push(msg);
    });
}
