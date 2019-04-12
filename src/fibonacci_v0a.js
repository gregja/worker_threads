// largely inspired by a napajs example : https://www.npmjs.com/package/napajs
// adapted to worker_threads by Gregory Jarrige
// node --experimental-worker fibonacci_v0.js
'use strict';
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

function fibonacci(n){
    let arr = [0, 1];
    for (let i = 2; i < n + 1; i++){
        arr.push(arr[i - 2] + arr[i -1])
    }
    return {input:n, output: arr[n]};
}

if (isMainThread) {
    let value_to_calc = 20;
    let worker = new Worker(__filename, { workerData: { value: value_to_calc }});

    worker.on('error', (err) => { throw err; });
    worker.on('exit', () => {
        console.log('Thread exiting');
    })
    worker.on('message', (msg) => {
        console.log(msg);
    });

} else {
    let result = fibonacci(workerData.value);
    parentPort.postMessage(result);
}

/*
$ node --experimental-worker fibonacci_v0.js
{ input: 20, output: 6765 }
Thread exiting
*/
