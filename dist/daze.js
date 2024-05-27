(()=>{var w=Object.defineProperty;var m=(t,s,e)=>s in t?w(t,s,{enumerable:!0,configurable:!0,writable:!0,value:e}):t[s]=e;var n=(t,s,e)=>m(t,typeof s!="symbol"?s+"":s,e);var c=(t,s,e)=>new Promise((o,i)=>{var l=r=>{try{a(e.next(r))}catch(d){i(d)}},g=r=>{try{a(e.throw(r))}catch(d){i(d)}},a=r=>r.done?o(r.value):Promise.resolve(r.value).then(l,g);a((e=e.apply(t,s)).next())});var u="https://gorgeous-severely-clam.ngrok-free.app",h=class extends HTMLElement{constructor(){super();n(this,"sessionId");n(this,"allowedOrigin");n(this,"shadowRoot");this.shadowRoot=this.attachShadow({mode:"open"})}connectedCallback(){return c(this,null,function*(){yield this.createSession(),window.addEventListener("message",this.handleMessage.bind(this))})}disconnectedCallback(){window.removeEventListener("message",this.handleMessage.bind(this))}createSession(){return c(this,null,function*(){try{let e=this.getAttribute("orderData")||"{}",o=yield fetch(`${u}/daze-dev-71b6e/us-central1/createSession`,{method:"POST",headers:{"Content-Type":"application/json","x-version":"1.0.0"},body:e});if(!o.ok)throw new Error("Failed to create session");let i=yield o.json();this.sessionId=i.sessionId,this.allowedOrigin=i.url,this.render()}catch(e){console.error("Error creating session:",e)}})}render(){let e=`${this.allowedOrigin}`;this.shadowRoot.innerHTML=`
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
            <iframe src="${e}" id="timeslotPickerIframe"></iframe>
        `}handleMessage(e){if(e.origin!==this.allowedOrigin){console.warn("Invalid origin:",e.origin);return}let o=new Function(`return ${this.getAttribute("onSuccess")}`)(),i=new Function(`return ${this.getAttribute("onError")}`)();e.data.type==="CONFIRMATION"?o&&o(e.data.timeslot):e.data.type==="ERROR"&&(console.error("Error selecting timeslot:",e.data.message),i&&i(e.data.message))}};customElements.define("timeslot-picker",h);})();
