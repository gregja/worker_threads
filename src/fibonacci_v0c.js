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
    var values_to_calc = [20, 2, 50, 160, 33];
    var nb_values_to_calc = values_to_calc.length;
    let worker = new Worker(__filename, { workerData: {name:"fibo", action: "wait" }});

    worker.on('error', (err) => { throw err; });
    worker.on('exit', () => {
        console.log('Thread exiting');
    })
    worker.on('message', (msg) => {
        console.log(msg);
        nb_values_to_calc--;
        if (nb_values_to_calc == 0) {
            worker.postMessage({action: "exit"});
        }
    });
    values_to_calc.forEach(value_to_calc => {
        worker.postMessage({action: "calc", input:value_to_calc});
    });
} else {
    parentPort.on("message", message => {
        if (message.action === "exit") {
            parentPort.close();
        } else {
            if (message.action === "calc") {
                parentPort.postMessage(fibonacci(message.input));
            }
        }
    });
    console.log('parameter received by worker '+workerData.name+' on init : ', workerData.action);
}
