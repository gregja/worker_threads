// largely inspired by a napajs example : https://www.npmjs.com/package/napajs
// adapted to worker_threads by Gregory Jarrige
// node --experimental-worker fibonacci.js
'use strict';
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

const fibonacci = function(n){
    let arr = [0, 1];
    for (let i = 2; i < n + 1; i++){
        arr.push(arr[i - 2] + arr[i -1])
    }
    let result = {input:n, output: arr[n]};
    return [result];
}

if (isMainThread) {
    let results = [];

    var values_to_calc = [20, 2, 50, 160, 33];

    const threads = new Set();
    console.log(`Running with ${values_to_calc.length} threads...`);
    for (let i = 0, imax=values_to_calc.length; i < imax; i++) {
        console.log(`Thread ${i} runs with value : ${values_to_calc[i]}`);
        threads.add(new Worker(__filename, { workerData: { value: values_to_calc[i] }}));
    }

    for (let worker of threads) {
        worker.on('error', (err) => { throw err; });
        worker.on('exit', () => {
            threads.delete(worker);
            console.log(`Thread exiting, ${threads.size} running...`);
            if (threads.size === 0) {
                console.log('finish !!!')
                for (let i=0, imax=results.length; i<imax; i++) {
                    let result = results[i][0];
                    console.log(result);
                }
            }
        })
        worker.on('message', (msg) => {
            results.push(msg);
        });
    }
} else {
    parentPort.postMessage(fibonacci(workerData.value));
}
