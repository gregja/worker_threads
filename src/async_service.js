const { workerData, parentPort, isMainThread } = require("worker_threads");

function informer(data) {
    console.log("message received from the main thread => ")
    console.log(data);
}

// You can do any heavy stuff here, in a synchronous way
// without blocking the "main thread"
parentPort.on("message", message => {
    if (message === "exit") {
        informer(message);
        parentPort.postMessage("sold!");
        parentPort.close();
    } else {
        informer(message);
        parentPort.postMessage({ going: message });
    }
});

parentPort.postMessage(informer({ start: workerData, isMainThread }));
