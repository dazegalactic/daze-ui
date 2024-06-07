import { DazeSessionResponse } from "./types/DazeApi";
class TimeslotPickerComponent extends HTMLElement {
    sessionId: string | undefined;
    allowedOrigin: string | undefined;
    backendUrl: string | undefined;
    iframeSrc: string | undefined;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        console.log('TimeslotPickerComponent connected');
        const backend = String(process.env.BACKEND_URL);
        const url = backend?.length > 0 ? backend : this.getAttribute('backendUrl');
        if (!url) {
            console.error('backendUrl attribute is required');
            return;
        }
        this.backendUrl = url;
        this.sessionId = sessionStorage.getItem('sessionId') || undefined;

        await this.createOrUpdateSession(this.getAttribute('orderData') || '{}');

        window.addEventListener('message', this.handleMessage.bind(this));
    }

    disconnectedCallback() {
        console.log('TimeslotPickerComponent disconnected');
        window.removeEventListener('message', this.handleMessage.bind(this));
    }

    async createOrUpdateSession(orderData: string) {
        if (!this.backendUrl) {
            console.error('backendUrl attribute is missing');
            return;
        }

        try {
            const url = this.sessionId ? `${this.backendUrl}?sessionId=${this.sessionId}` : this.backendUrl;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "x-version": "1.0.0"
                },
                body: orderData
            });

            if (!response.ok) {
                throw new Error('Failed to create or update session');
            }

            const result: DazeSessionResponse = await response.json();
            if (this.sessionId !== result.sessionId) {
                console.log(`Created session with id: ${result.sessionId}`);
            } else {
                console.log(`Updated session with id: ${result.sessionId}`);
            }
            this.sessionId = result.sessionId;
            sessionStorage.setItem('sessionId', this.sessionId);
            this.iframeSrc = result.url;
            this.allowedOrigin = new URL(result.url).origin;

            this.dispatchEvent(new CustomEvent('onSessionIdChange', { detail: { sessionId: this.sessionId } }));
            this.renderIframe();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Could not get Daze session';
            this.dispatchEvent(new CustomEvent('onError', { detail: message }));
            console.error('Error creating or updating session:', error);
        }
    }

    renderIframe() {
        if (this.iframeSrc) {
            this.shadowRoot!.innerHTML = `
                <style>
                    :host {
                        display: block;
                        width: 100%;
                        height: 100%;
                        position: relative;
                    }
                    iframe {
                        width: 100%;
                        height: 100%;
                        border: none;
                    }
                </style>
                <iframe src="${this.iframeSrc}" id="timeslotPickerIframe"></iframe>
            `;
        }
    }

    handleMessage(event: MessageEvent) {
        if (event.origin !== this.allowedOrigin) {
            console.warn('Invalid origin:', event.origin);
            return;
        }

        switch (event.data.type) {
            case 'SUCCESS':
                this.dispatchEvent(new CustomEvent('onSuccess', { detail: event.data.timeslot }));
                break;
            case 'ERROR':
                this.dispatchEvent(new CustomEvent('onError', { detail: event.data.message }));
                break;
            default:
                console.warn('Unknown message type:', event.data.type);
        }
    }
}

if (!customElements.get('timeslot-picker')) {
    customElements.define('timeslot-picker', TimeslotPickerComponent);
}
