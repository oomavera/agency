declare global {
  type WistiaEventName = 'play' | 'pause' | 'end' | string;

  interface WistiaVideo {
    pause: () => void;
    play?: () => void;
    bind: (eventName: WistiaEventName, handler: () => void) => void;
    unbind?: (eventName: WistiaEventName, handler?: () => void) => void;
  }

  interface WistiaQueueConfig {
    id?: string;
    onReady?: (video: WistiaVideo) => void;
  }

  type WistiaQueueItem = WistiaQueueConfig | Record<string, unknown>;

  interface Window {
    _wq?: WistiaQueueItem[];
  }
}

export {};


