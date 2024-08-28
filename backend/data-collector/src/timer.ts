import { EventEmitter } from 'events';

export class Timer extends EventEmitter {
  private interval: number;
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(interval: number) {
    super();
    this.interval = interval;
  }

  start() {
    const startTime = Date.now();
    const tick = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const nextTick = this.interval - (elapsed % this.interval);

      this.emit('tick', now);

      this.timeoutId = setTimeout(tick, nextTick);
    };

    tick(); // Start the first tick
  }

  stop() {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
