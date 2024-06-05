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
        const backend = String(process.env.BACKEND_URL);
        const url = backend?.length > 0 ? backend :  this.getAttribute('backendUrl');
        
        console.log('TimeslotPickerComponent connected', url);
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
            this.iframeSrc = result.url;
            this.allowedOrigin = new URL(result.url).origin;

            this.renderIframe(); 
        } catch (error) {
            console.error('Error creating or updating session:', error);
        }
    }

    renderIframe() {
        const iframeSrc = `${this.iframeSrc}`;
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

        const type = event.data.type;

        switch (type) {
            case 'SUCCESS':
                this.dispatchEvent(new CustomEvent('onSuccess', { detail: event.data.timeslot }));
                break;
            case 'ERROR':
                this.dispatchEvent(new CustomEvent('onError', { detail: event.data.message }));
                break;
            default:
                console.warn('Unknown message type:', type);
        
        }
    }
}

if (!customElements.get('timeslot-picker')) {
    customElements.define('timeslot-picker', TimeslotPickerComponent);
}
