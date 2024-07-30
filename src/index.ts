import { DazeSessionResponse } from "./types/DazeApi";

class TimeslotPickerComponent extends HTMLElement {
    sessionId: string | undefined;
    allowedOrigin: string | undefined;
    backendUrl: string | undefined;
    iframeSrc: string | undefined;
    colorScheme: string | undefined;
    themeColor: string | undefined;
    themeColorDark: string | undefined;
    themeColorLight: string | undefined;
    isInitialized: boolean = false;
    testMode: boolean = false;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        this.isInitialized = true;
        const isTestMode = this.getAttribute('testMode');
        if (isTestMode) {
            console.log('Loading Daze timeslots in test mode - connecting to Daze Preview server');
            this.testMode = true;
        }
        const defaultBackend = String(process.env.BACKEND_URL_PROD);
        const previewBackend = String(process.env.BACKEND_URL_PREVIEW);
        const customBackend = this.getAttribute('backendUrl');
        if (defaultBackend?.length === 0 || previewBackend.length === 0) {
            console.error('BACKEND_URL and PREVIEW_BACKEND_URL environment variables are required');
            return;
        }
        const url = isTestMode ? previewBackend : customBackend || defaultBackend;
        if (!url) {
            console.error('Error setting backend url');
            return;
        }
        if (url === customBackend) {
            console.log('Using custom Daze backend URL:', url);
        }
        this.backendUrl = url;
        this.sessionId = sessionStorage.getItem('sessionId') || undefined;

        await this.createOrUpdateSession(this.getAttribute('orderData') || '{}');
        window.addEventListener('message', this.handleMessage.bind(this), false);
    }

    disconnectedCallback() {
        this.isInitialized = false;
        window.removeEventListener('message', this.handleMessage.bind(this), false);
    }

    async createOrUpdateSession(orderData: string) {
        if (!this.backendUrl || !this.isInitialized) {
            console.error('backendUrl attribute is missing or component is not connected');
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

            this.colorScheme = this.getAttribute('colorScheme') || undefined;
            this.themeColor = this.getAttribute('themeColor')?.replace('#', '') ?? undefined;
            this.themeColorDark = this.getAttribute('themeColorDark')?.replace('#', '') ?? undefined;
            this.themeColorLight = this.getAttribute('themeColorLight')?.replace('#', '') ?? undefined;

            const setColorScheme = Boolean(this.colorScheme);
            const setCustomThemeColors = this.colorScheme === "custom" && Boolean(this.themeColor && this.themeColorDark && this.themeColorLight);

            if (!this.isInitialized) return;

            const result: DazeSessionResponse = await response.json();
            if (this.testMode) {
                if (this.sessionId !== result.sessionId) {
                    console.log(`New Daze session id: ${result.sessionId}`);
                } else {
                    console.log(`Updated Daze session with id: ${result.sessionId}`);
                }
            }
            this.sessionId = result.sessionId;
            sessionStorage.setItem('sessionId', this.sessionId);
            this.iframeSrc = result.url
            if (setColorScheme) {
                this.iframeSrc += `&colorScheme=${this.colorScheme}`;
            }
            if (setCustomThemeColors) {
                this.iframeSrc += `&themeColor=${this.themeColor}&themeColorDark=${this.themeColorDark}&themeColorLight=${this.themeColorLight}`;
            }
            this.allowedOrigin = new URL(result.url).origin;

            this.dispatchEvent(new CustomEvent('onSessionIdChange', { detail: { sessionId: this.sessionId } }));
            this.renderIframe();
        } catch (error) {
            if (!this.isInitialized) return;
            const message = error instanceof Error ? error.message : 'Could not get Daze session';
            this.dispatchEvent(new CustomEvent('onError', { detail: message }));
            console.error('Error creating or updating session:', error);
        }
    }

    renderIframe() {
        if (!this.isInitialized || !this.iframeSrc) return;

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

    handleMessage(event: MessageEvent) {
        if (!this.isInitialized || event.origin !== this.allowedOrigin) {
            console.warn('Daze iframe: Invalid event origin:', event.origin);
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
