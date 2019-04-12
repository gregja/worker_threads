// Adaptation for Worker Threads of a NapaJS script taken from :
//   https://github.com/dumindux/matrix-vector-multiplication/blob/master/main.js
'use strict';

const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

function multiply (row, vector) {
    let result = 0;
    for (let i = 0; i < row.length; i++) {
        result += row[i] * vector[i][0];
    }

    for (const currentTime  = new Date().getTime() + 50; new Date().getTime() < currentTime;){};  //looping to simulate some work

    return result;
}


if (isMainThread) {
    let results = [];

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    let size;
    if (process.argv[2]) {
        size = parseInt(process.argv[2]);
        if (size != process.argv[2]) {
            console.error('Size should be an integer (between 1 and 9)');
            process.exit(1);
        }
        if (size < 1 || size > 9) {
            console.error('Size should be valued between 1 and 9')
            console.error('(node:2548) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 error listeners added. Use emitter.setMaxListeners() to increase limit');
            process.exit(1);
        }
    } else {
        console.error('Size should be provided (between 1 and 9)');
        process.exit(1);
    }

    const matrix = [];
    const vector = [];

    for (let i = 0; i < size; i++) {
        matrix.push([]);
        for (let j = 0; j < size; j++) {
            matrix[i].push(getRandomInt(0,100));
        }
    }

    for (let i = 0; i < size; i++) {
        vector.push([getRandomInt(0,100)]);
    }

    console.log('Matrix:');
    console.log(matrix);
    console.log('Vector:');
    console.log(vector);

    const start = Date.now();

    var promises = [];

/*
    for(var i = 0; i < size; i++) {
        promises[i] = zone.execute(multiply, [matrix[i], vector]);
    }

    Promise.all(promises).then((results) => {
        const end = Date.now();
        console.log('Result:');
        console.log(results.map(result => [parseInt(result._payload)]));
        console.log('Runtime: ' + (end - start) + 'ms');
    });
*/
    const threads = new Set();

    for (let i = 0; i < size; i++) {
        console.log(`Thread ${i} runs`);
        threads.add(new Worker(__filename, { workerData: { matrix: matrix[i], vector }}));
    }

    for (let worker of threads) {
        worker.on('error', (err) => { throw err; });
        worker.on('exit', () => {
            threads.delete(worker);
            console.log(`Thread exiting, ${threads.size} running...`);
            if (threads.size === 0) {
                let end = Date.now();
                console.log('finish !!!')
                for (let i=0, imax=results.length; i<imax; i++) {
                    let result = results[i];
                    console.log(result);
                }
                console.log('Runtime: ' + (end - start) + 'ms');
            }
        })
        worker.on('message', (msg) => {
            results.push(msg);
        });
    }

} else {
    let result = multiply(workerData.matrix, workerData.vector);
    parentPort.postMessage(result);
}
