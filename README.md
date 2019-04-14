# worker_threads
Tests on the module Worker Threads of Node.js


The worker module of Node.js, available from version 10, provides a way to create multiple environments running on independent threads, and to create message channels between them.

The module is described in the documentation here :

https://nodejs.org/dist/latest-v10.x/docs/api/worker_threads.html

... but the official documentation lacks concrete examples. So I realized some tests et created this repository.

The source code of my examples is not very well documented at the moment (for lack of time, I hope you will excuse me), but I think the sources are not really complex for developpers who know well the Javascript language.

For each subject (prime number, fibonacci..), I created different examples, with increasing complexity.

The "fibonacci" series is probably the most interesting, especially the example "fibonacci_v3.js" in which I show how to create a pool of 4 workers sharing a series of values to calculate with the function Fibonacci.

Be careful ! To launch a Node script with the worker module available, you must use the parameter "-experimental-worker", like in the command below :

node --experimental-worker myscript.js
