interface IdleTrackerOptions {
	timeout?: number;
	onIdleCallback?: VoidFunction;
	events?: Array<Event['type']>;
	throttle?: number;
}

const ACTIVE_EVENTS: Event['type'][] = [
	'change',
	'keydown',
	'mousedown',
	'mousemove',
	'mouseup',
	'orientationchange',
	'resize',
	'scroll',
	'touchend',
	'touchmove',
	'touchstart',
	'visibilitychange',
];

const DEFAULT_CALLBACK = (): void => {};
const DEFAULT_THROTTLE = 1000;
const DEFAULT_TIMEOUT = 30000;

interface CallbackPayload {
	idle: boolean;
	event?: Event;
}

const IDLE_TRACKER_STORAGE_KEY = 'IDLE_TRACKER_LAST_ACTIVE';

const defaultEventOption = {
	capture: false,
	passive: false,
};

export class IdleTracker {
	private callback: ({ idle, event }: CallbackPayload) => void;

	private timer: ReturnType<typeof setTimeout> | null;

	private readonly events: Array<Event['type']>;

	private readonly throttleTime: number;

	private readonly timeout: number;

	public listeners: Array<Event['type']>;

	private get state(): {
		idle: boolean;
		lastActive: number;
	} {
		return (
			JSON.parse(localStorage.getItem(IDLE_TRACKER_STORAGE_KEY) || '') || {
				idle: false,
				lastActive: 0,
			}
		);
	}

	private set state(state: IdleTracker['state']) {
		localStorage.setItem(IDLE_TRACKER_STORAGE_KEY, JSON.stringify(state));
	}

	constructor({
		timeout = DEFAULT_TIMEOUT,
		onIdleCallback = DEFAULT_CALLBACK,
		events = ACTIVE_EVENTS,
		throttle = DEFAULT_THROTTLE,
	}: IdleTrackerOptions) {
		this.callback = onIdleCallback;
		this.events = events;
		this.listeners = [];
		this.throttleTime = throttle;
		this.timeout = timeout;
		this.timer = null;

		this.state = {
			idle: false,
			lastActive: 0,
		};
	}

	public start({ onIdleCallback }: { onIdleCallback?: VoidFunction | undefined } = {}): void {
		this.callback = onIdleCallback || this.callback;
		this.handleEvent = this.handleEvent.bind(this);

		this.listeners = this.events.map((eventName) => {
			document.addEventListener(eventName, this.handleEvent, defaultEventOption);
			return eventName;
		});

		this.startTimer.call(this);
	}

	public startTimer(): void {
		this.state = { ...this.state, lastActive: Date.now() };
		this.resetTimer();
	}

	public handleEvent(e: Event): void {
		const time = Date.now();

		if (time - this.state.lastActive < this.throttleTime) {
			// throttle on change
			return;
		}

		this.state = { ...this.state, lastActive: time, idle: false };
		if (e.type === 'mousemove' || e.type === 'touchmove') {
			this.resetTimer(e);
			return;
		}

		// only evoke callback when value change
		if (this.state.idle) {
			this.callback({
				event: e,
				idle: false,
			});
		}

		this.resetTimer();
	}

	public resetTimer(e?: Event): void {
		this.clearTimer();
		this.state = { ...this.state };

		this.timer = setTimeout(() => {
			if (!this.state.idle && Date.now() - this.state.lastActive > this.timeout) {
				this.callback({ event: e, idle: true });
				this.state = { ...this.state, idle: true };
			}

			this.resetTimer(e);
		}, this.timeout);
	}

	public clearTimer(): void {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
	}
}
