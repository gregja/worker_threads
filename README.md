# worker_threads
Tests on the module Worker Threads of Node.js


The worker module of Node.js, available from version 10, provides a way to create multiple environments running on independent threads, and to create message channels between them. 

The module is described in the documentation here :

https://nodejs.org/dist/latest-v10.x/docs/api/worker_threads.html

but the documentation lacks concrete examples. So I realized some tests et created this repository.

The source code of the examples is not very well documented at the moment (for lack of time), I hope you will excuse me. I think the source code of the examples is not very complicated for the developpers who know well Node.js.

For each subject, you created different examples, with increasing complexity.
The "fibonacci" series is probably the most interesting, especially the example "fibonacci_v3.js" in which I show how to create a pool of 4 workers sharing a series of values to calculate with the function Fibonacci.


