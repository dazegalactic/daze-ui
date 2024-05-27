(()=>{var w=Object.defineProperty;var u=(s,t,e)=>t in s?w(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var n=(s,t,e)=>u(s,typeof t!="symbol"?t+"":t,e);var c=(s,t,e)=>new Promise((i,r)=>{var h=o=>{try{a(e.next(o))}catch(d){r(d)}},g=o=>{try{a(e.throw(o))}catch(d){r(d)}},a=o=>o.done?i(o.value):Promise.resolve(o.value).then(h,g);a((e=e.apply(s,t)).next())});var l=class extends HTMLElement{constructor(){super();n(this,"sessionId");n(this,"allowedOrigin");n(this,"shadowRoot");n(this,"backendUrl");this.shadowRoot=this.attachShadow({mode:"open"})}connectedCallback(){return c(this,null,function*(){let e=this.getAttribute("backendUrl");if(!e){console.error("backendUrl attribute is required");return}this.backendUrl=e,yield this.createSession(),window.addEventListener("message",this.handleMessage.bind(this))})}disconnectedCallback(){window.removeEventListener("message",this.handleMessage.bind(this))}createSession(){return c(this,null,function*(){try{let e=this.getAttribute("orderData")||"{}",i=yield fetch(`${this.backendUrl}`,{method:"POST",headers:{"Content-Type":"application/json","x-version":"1.0.0"},body:e});if(!i.ok)throw new Error("Failed to create session");let r=yield i.json();this.sessionId=r.sessionId,this.allowedOrigin=r.url,this.render()}catch(e){console.error("Error creating session:",e)}})}render(){let e=`${this.allowedOrigin}`;this.shadowRoot.innerHTML=`
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
        `}handleMessage(e){if(e.origin!==this.allowedOrigin){console.warn("Invalid origin:",e.origin);return}let i=new Function(`return ${this.getAttribute("onSuccess")}`)(),r=new Function(`return ${this.getAttribute("onError")}`)();e.data.type==="CONFIRMATION"?i&&i(e.data.timeslot):e.data.type==="ERROR"&&(console.error("Error selecting timeslot:",e.data.message),r&&r(e.data.message))}};customElements.define("timeslot-picker",l);})();
