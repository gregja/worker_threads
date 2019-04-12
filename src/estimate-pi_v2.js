// largely inspired by a napajs example : https://www.npmjs.com/package/napajs
// adapted to worker_threads by Gregory Jarrige
// node --experimental-worker estimate-pi.js
'use strict';
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

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

var bloblo = 0; // the variable "bloblo" exists independtly in main thread and in each worker

function estimatePI(points) {
    let temp = new Date();
    bloblo = temp.getMilliseconds(); // just to have something to show in bloblo ;)

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
    return [result];
}

var values_to_calc = [4000000, 4000000, 4000000, 4000000, 4000000];

if (isMainThread) {
    let results = [];
    const threadCount = values_to_calc.length;
    const threads = new Set();

    console.log(`Running with ${threadCount} threads...`);

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
                console.log('Finish !!!')
                console.log('Value of bloblo in the main worker ? '+bloblo);  // value of bloblo unchanged in the main worker

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
    let result = estimatePI(workerData.value);
    console.log('Value of bloblo in that worker ? '+bloblo);
    parentPort.postMessage(result);
}
