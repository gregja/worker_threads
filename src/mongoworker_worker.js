const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'myproject';
const defcollection = 'collworkers';

function mongoWorker (newDatas, action) {
    // Use connect method to connect to the server
    MongoClient.connect(url,  { useNewUrlParser: true }, function(err, client) {
    //    assert.equal(null, err);
        console.log("Connected successfully to server");

        const db = client.db(dbName);

        if (action == 'insert') {
            insertDocuments(db, newDatas, function() {
                client.close();
            });
        }

        /*
        insertDocuments(db, newDatas, function() {
            findDocuments(db, function() {
                client.close();
            });
        });
        */

        if (action == 'read') {
            findDocuments(db, function() {
                client.close();
            });
        }

        //client.close();
    });
}

const insertDocuments = function(db, datas, callback) {
    // Get the documents collection
    const collection = db.collection(defcollection);
    // Insert some documents
    collection.insertMany(datas, function(err, result) {
        let count = datas.length;
    /*    assert.equal(err, null);
        assert.equal(count, result.result.n);
        assert.equal(count, result.ops.length);*/
        console.log(`Inserted ${count} documents into the collection`);
        callback(result);
    });
}

const findDocuments = function(db, callback) {
    // Get the documents collection
    const collection = db.collection(defcollection);
    // Find some documents
    collection.find({}).toArray(function(err, docs) {
    //    assert.equal(err, null);
        console.log("Found the following records");
        console.log(docs)
        callback(docs);
    });
}

if (!isMainThread) {

    parentPort.on("message", message => {
        if (message.data === "exit") {
            parentPort.close();
        } else {
            if (message.data != "wait") {
                parentPort.postMessage(mongoWorker(message.data, message.action));
            }
        }
    });
    console.log('parameter received by worker on init : ', workerData.data);
}
