
export type WorkerCallback = () => Promise<void>;

export class Worker {
    queue: WorkerCallback[] = [];

    addJob(callback: WorkerCallback) {
        this.queue.push(callback)
    }

    async join(): Promise<void> {
        console.log("Launching worker : " + this.queue.length + " jobs");
        for (const callback of this.queue) {
            await callback()
        }
        this.queue = [];
    }
}

export class WorkerPool {

    size: number = 0;
    nextIndexToUse: number = 0;
    pool: Worker[] = []

    constructor(size: number) {
        this.size = size;
        for (let i=0; i<size; i++) {
            this.pool.push(new Worker());
        }
    }

    addJob(callback: WorkerCallback) {
        const worker = this.pool[this.nextIndexToUse]
        worker.addJob(callback);
        this.nextIndexToUse = (this.nextIndexToUse + 1) % this.size
    }

    async join() {
        console.log("Launching worker pool");
        await Promise.allSettled(this.pool.map(worker => worker.join()));
    }
}