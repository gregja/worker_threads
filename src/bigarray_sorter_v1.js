// https://medium.com/lazy-engineering/node-worker-threads-b57a32d84845

//const { Worker } = require("worker_threads");
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

const path = require("path");

// create some big array
const elements = 1000000;
const bigArray = Array(elements).fill().map(() => Math.random());

// we get the path of the script
const workerScript = path.join(__dirname, "./bigarray_worker.js");
console.log(workerScript);

// create a new worker from our script
const worker = new Worker(workerScript, { workerData: bigArray });

// receive events from the worker
worker.on("message", (sortedArray) => console.log('message:', sortedArray[0]));
worker.on("error", (error) => console.error("error", error));
worker.on("exit", () => console.log("exit"));
