// https://medium.com/@Trott/using-worker-threads-in-node-js-80494136dbb6
// node --experimental-worker calc-prime.js
'use strict';
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

const min = 2;

function generatePrimes(start, range) {
    let primes = [];
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
    return primes;
}

if (isMainThread) {

    var final_primes = [];
    const max = 1e7;
    const threadCount = +process.argv[2] || min;
    const threads = new Set();
    const range = Math.ceil((max - min) / threadCount);

    console.log(`Running with ${threadCount} threads...`);

    let start = min;
    for (let i = 0; i < threadCount-1; i++) {
        console.log(`Thread ${i} runs with values : start=${start}, range=${range}`);
        threads.add(new Worker(__filename, { workerData: { start: start, range }}));
        start += range;
    }

    let last_range = range + ((max - min + 1) % threadCount)
    console.log(`Last thread runs with values : start=${start}, range=${last_range}`);
    threads.add(new Worker(__filename, { workerData: { start, range:last_range}}));

    for (let worker of threads) {
        worker.on('error', (err) => { throw err; });
        worker.on('exit', () => {
            threads.delete(worker);
            console.log(`Thread exiting, ${threads.size} running...`);
            if (threads.size === 0) {
                //console.log(final_primes.join('\n'));
                console.log('Counting prime numbers => '+final_primes.length);
            }
        })
        worker.on('message', (msg) => {
            final_primes = final_primes.concat(msg);
        });
    }
} else {
    parentPort.postMessage(generatePrimes(workerData.start, workerData.range));
}
