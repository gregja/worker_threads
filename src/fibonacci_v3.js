// largely inspired by a napajs example : https://www.npmjs.com/package/napajs
// adapted to worker_threads by Gregory Jarrige
// this version use a pool of workers
// node --experimental-worker fibonacci_v3.js
'use strict';
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
    let values_to_calc = [20, 2, 50, 160, 33, 45, 55];

    // array to store the fibonacci results
    let results = [];

    // name of the workers used by the pool
    let pool = ['worker1', 'worker2', 'worker3', 'worker4'];

    function runService(workerData) {
        const threads = new Map();  // more useful than Set (used in fibonacci_v2) because we can define a key

        console.log(`Calc ${values_to_calc.length} values dispatched between ${pool.length} threads...`);

        // Preparation of the workers
        for (let i = 0, imax=pool.length; i < imax; i++) {
            threads.set(pool[i], new Worker(__filename, { workerData: { name:pool[i], data: "wait" }}));
        }

        // when all numbers are calculated, we can close all workers of the pool
        function closeWorkers() {
            for (let [key, worker] of threads.entries()) {
                worker.postMessage({ data: "exit" });
            }
        }

        // attach the calculus of a fibonacci series to a worker transmitted
        function attachJob(worker) {
            if(values_to_calc.length > 0) {
                worker.postMessage({ data: values_to_calc.pop() });
            }
        }

        // create a new worker
        function addOneWorker(key, worker) {
            worker.on('error', (err) => { throw err; });
            worker.on('exit', () => {
                threads.delete(key);
                console.log(`Thread ${key} exiting, ${threads.size} running...`);
                if (threads.size === 0) {
                    console.log('finish !!! Display the results please ;)');
                    for (let i=0, imax=results.length; i<imax; i++) {
                        let result = results[i][0];
                        console.log(result);
                    }
                }
            })
            worker.on('message', (msg) => {
                results.push(msg);
                if(values_to_calc.length > 0) {
                    attachJob(worker);
                } else {
                    // good job guys, you can close the stores ;)
                    closeWorkers();
                }
            });
        }

        for (let [key, worker] of threads.entries()) {
            addOneWorker(key, worker);
            attachJob(worker);
        }

    }

    async function run() {
        runService("let's begin");
    }

    run().catch(err => console.error(err));

} else {
    const fibonacci = function(n){
        let arr = [0, 1];
        for (let i = 2; i < n + 1; i++){
            arr.push(arr[i - 2] + arr[i -1])
        }
        let result = {input:n, output: arr[n]};
        return [result];
    }

    // You can do any heavy stuff here, in a synchronous way
    // without blocking the "main thread"
    parentPort.on("message", message => {
        if (message.data === "exit") {
            parentPort.close();
        } else {
            parentPort.postMessage(fibonacci(message.data));
        }
    });
    console.log('parameter received by worker '+workerData.name+' on init : ', workerData.data);
}
