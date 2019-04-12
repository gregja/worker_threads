// node --experimental-worker mongoworker_main.js
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');


const assert = require('assert');

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}


var newDatas = [{a : 10}, {a : 11}, {a : 12}];

var script_worker = './mongoworker_worker.js';

var threads = [];
var wkr1 = new Worker(script_worker, { workerData: { data: "wait" }});
threads.push(wkr1);
var wkr2 = new Worker(script_worker, { workerData: { data: "wait" }});
threads.push(wkr2);

threads.forEach((wkr, idx) => {
    let val = (idx+21)*10*(getRandomInt(5)+1); // fake data
    wkr.postMessage({ data: [{a : val}], action:"insert" });
    val = (idx+21)*10*(getRandomInt(5)+1); // fake data
    wkr.postMessage({ data: [{a : val}], action:"insert" });
});

setTimeout(function(){
    wkr1.postMessage({ data: [], action:"read" });
}, 3000);
