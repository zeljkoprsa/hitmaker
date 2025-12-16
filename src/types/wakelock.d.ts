// Type definitions for Screen Wake Lock API

interface WakeLockSentinel extends EventTarget {
  released: boolean;
  type: 'screen';
  release(): Promise<void>;
  onrelease: ((this: WakeLockSentinel, ev: Event) => any) | null;
}

interface WakeLock {
  request(type: 'screen'): Promise<WakeLockSentinel>;
}

interface Navigator {
  wakeLock: WakeLock;
}
