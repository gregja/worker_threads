// https://medium.com/@Trott/using-worker-threads-in-node-js-80494136dbb6
// for the same subject in the browser side : https://developer.mozilla.org/en-US/docs/Tools/Performance/Scenarios/Intensive_JavaScript

// node --experimental-worker calc-prime.js

'use strict';
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

const min = 2; // const common of main thread and of workers
let primes = []; // the variable "primes" exists independtly in main thread and in each worker

function generatePrimes(start, range) {
    let isPrime = true;
    let end = start + range;
    for (let i = start; i < end; i++) {
        for (let j = min; j < Math.sqrt(end); j++) {
            if (i !== j && i%j === 0) {
                isPrime = false;
                break;
            }
        }
        if (isPrime) {
            primes.push(i);
        }
        isPrime = true;
    }
}

if (isMainThread) {
    const max = 1e7;
    const threadCount = +process.argv[2] || min;
    const threads = new Set();
    console.log(`Running with ${threadCount} threads...`);
    const range = Math.ceil((max - min) / threadCount);

    let start = min;
    for (let i = 0; i < threadCount - 1; i++) {
        threads.add(new Worker(__filename, { workerData: { start: start, range }}));
        start += range;
    }
    threads.add(new Worker(__filename, { workerData: { start, range: range + ((max - min + 1) % threadCount)}}));
    for (let worker of threads) {
        worker.on('error', (err) => { throw err; });
        worker.on('exit', () => {
            threads.delete(worker);
            console.log(`Thread exiting, ${threads.size} running...`);
            if (threads.size === 0) {
            //    console.log(primes.join('\n'));  // uncomment this line if you want to check the result
            }
        })
        worker.on('message', (msg) => {
            console.log(msg)
            primes = primes.concat(msg);
        });
    }
} else {
    generatePrimes(workerData.start, workerData.range);
    parentPort.postMessage(primes);
}
