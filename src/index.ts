const BACKEND = process.env.BACKEND_URL;
class TimeslotPickerComponent extends HTMLElement {
    sessionId: string;
    allowedOrigin: string;
    shadowRoot: ShadowRoot;

    constructor() {
        super();
        this.shadowRoot = this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        await this.createSession();
        window.addEventListener('message', this.handleMessage.bind(this));
    }

    disconnectedCallback() {
        window.removeEventListener('message', this.handleMessage.bind(this));
    }

    async createSession() {
        try {
            const orderData = this.getAttribute('orderData') || '{}';
            const response = await fetch(`https://${BACKEND}/daze-dev-71b6e/us-central1/create-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "x-version": "1.0.0"
                },
                body: orderData
            });

            if (!response.ok) {
                throw new Error('Failed to create session');
            }

            const result = await response.json();
            this.sessionId = result.sessionId;
            this.allowedOrigin = result.url;

            this.render();
        } catch (error) {
            console.error('Error creating session:', error);
        }
    }

    render() {
        const iframeSrc = `${this.allowedOrigin}`;
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
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

    handleMessage(event) {
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

// Define the custom element
customElements.define('timeslot-picker', TimeslotPickerComponent);
