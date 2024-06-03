"use strict";
(() => {
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/index.ts
  var TimeslotPickerComponent = class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }
    connectedCallback() {
      return __async(this, null, function* () {
        console.log("TimeslotPickerComponent connected", "https://more-panther-striking.ngrok-free.app/daze-dev-71b6e/us-central1/createSession");
        const url = "https://more-panther-striking.ngrok-free.app/daze-dev-71b6e/us-central1/createSession";
        if (!url) {
          console.error("backendUrl attribute is required");
          return;
        }
        this.backendUrl = url;
        this.sessionId = sessionStorage.getItem("sessionId") || void 0;
        yield this.createOrUpdateSession();
        window.addEventListener("message", this.handleMessage.bind(this));
      });
    }
    disconnectedCallback() {
      window.removeEventListener("message", this.handleMessage.bind(this));
    }
    createOrUpdateSession() {
      return __async(this, null, function* () {
        if (!this.backendUrl) {
          throw new Error("backendUrl attribute is required");
        }
        try {
          const orderData = this.getAttribute("orderData") || "{}";
          const url = this.sessionId ? `${this.backendUrl}?sessionId=${this.sessionId}` : this.backendUrl;
          const response = yield fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-version": "1.0.0"
            },
            body: orderData
          });
          if (!response.ok) {
            throw new Error("Failed to create or update session");
          }
          const result = yield response.json();
          this.sessionId = result.sessionId;
          this.allowedOrigin = result.url;
          this.renderIframe();
        } catch (error) {
          console.error("Error creating or updating session:", error);
        }
      });
    }
    renderIframe() {
      const iframeSrc = `${this.allowedOrigin}`;
      this.shadowRoot.innerHTML = `
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
    handleMessage(event) {
      if (event.origin !== this.allowedOrigin) {
        console.warn("Invalid origin:", event.origin);
        return;
      }
      const onSuccess = new Function(`return ${this.getAttribute("onSuccess")}`)();
      const onError = new Function(`return ${this.getAttribute("onError")}`)();
      if (event.data.type === "CONFIRMATION") {
        if (onSuccess) {
          onSuccess(event.data.timeslot);
        }
      } else if (event.data.type === "ERROR") {
        console.error("Error selecting timeslot:", event.data.message);
        if (onError) {
          onError(event.data.message);
        }
      }
    }
  };
  if (!customElements.get("timeslot-picker")) {
    customElements.define("timeslot-picker", TimeslotPickerComponent);
  }
})();
//# sourceMappingURL=daze.js.map
