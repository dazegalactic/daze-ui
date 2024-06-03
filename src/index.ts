import { DazeSessionResponse } from "./types/DazeApi";

class TimeslotPickerComponent extends HTMLElement {
    sessionId: string | undefined;
    allowedOrigin: string | undefined;
    backendUrl: string | undefined;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        console.log('TimeslotPickerComponent connected', process.env.BACKEND_URL);
        const url = process.env.BACKEND_URL ?? this.getAttribute('backendUrl');
        if (!url) {
            console.error('backendUrl attribute is required');
            return;
        }
        this.backendUrl = url;
        this.sessionId = sessionStorage.getItem('sessionId') || undefined;


        await this.createOrUpdateSession();

        window.addEventListener('message', this.handleMessage.bind(this));
    }

    disconnectedCallback() {
        window.removeEventListener('message', this.handleMessage.bind(this));
    }

    async createOrUpdateSession() {
        if (!this.backendUrl) {
            throw new Error('backendUrl attribute is required');
        }
        try {
            const orderData = this.getAttribute('orderData') || '{}';
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
            this.sessionId = result.sessionId;
            this.allowedOrigin = result.url;

            this.renderIframe(); 
        } catch (error) {
            console.error('Error creating or updating session:', error);
        }
    }
    renderIframe() {
        const iframeSrc = `${this.allowedOrigin}`;
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
            <iframe src="${iframeSrc}" id="timeslotPickerIframe"></iframe>
        `;
    }

    handleMessage(event: MessageEvent) {
        if (event.origin !== this.allowedOrigin) {
            console.warn('Invalid origin:', event.origin);
            return;
        }

        const onSuccess = new Function(`return ${this.getAttribute('onSuccess')}`)();
        const onError = new Function(`return ${this.getAttribute('onError')}`)();
        if (event.data.type === 'CONFIRMATION') {
            if (onSuccess) {
                onSuccess(event.data.timeslot);
            }
        } else if (event.data.type === 'ERROR') {
            console.error('Error selecting timeslot:', event.data.message);
            if (onError) {
                onError(event.data.message);
            }
        }
    }
}

if (!customElements.get('timeslot-picker')) {
    customElements.define('timeslot-picker', TimeslotPickerComponent);
}
