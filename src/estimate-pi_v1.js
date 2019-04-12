// largely inspired by a napajs example : https://www.npmjs.com/package/napajs
// adapted to worker_threads by Gregory Jarrige
// node --experimental-worker estimate-pi.js
'use strict';
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

let results = []; // the variable "results" exists independtly in main thread and in each worker

/*
    Estimate the value of π by using a Monte Carlo method.
    Take `points` samples of random x and y values on a
    [0,1][0,1] plane. Calculating the length of the diagonal
    tells us whether the point lies inside, or outside a
    quarter circle running from 0,1 to 1,0. The ratio of the
    number of points inside to outside gives us an
    approximation of π/4.
    See https://en.wikipedia.org/wiki/File:Pi_30K.gif
    for a visualization of how this works.
*/

function estimatePI(points) {
    var i = points;
    var inside = 0;

    while (i-- > 0) {
        var x = Math.random();
        var y = Math.random();
        if ((x * x) + (y * y) <= 1) {
            inside++;
        }
    }

    let result = {input:points, output: inside / points * 4};
    results.push(result);
    return true;
}

var values_to_calc = [4000000, 4000000, 4000000, 4000000, 4000000];

if (isMainThread) {
    const threadCount = values_to_calc.length;
    const threads = new Set();
    console.log(`Running with ${threadCount} threads...`);
    for (let i = 0, imax=values_to_calc.length; i < imax; i++) {
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
    estimatePI(workerData.value);
    parentPort.postMessage(results);
}
