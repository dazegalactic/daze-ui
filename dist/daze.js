"use strict";(()=>{var a=(l,h,e)=>new Promise((s,t)=>{var i=n=>{try{r(e.next(n))}catch(o){t(o)}},c=n=>{try{r(e.throw(n))}catch(o){t(o)}},r=n=>n.done?s(n.value):Promise.resolve(n.value).then(i,c);r((e=e.apply(l,h)).next())});var d=class extends HTMLElement{constructor(){super();this.isInitialized=!1;this.attachShadow({mode:"open"})}connectedCallback(){return a(this,null,function*(){this.isInitialized=!0;let e="",s=(e==null?void 0:e.length)>0?e:this.getAttribute("backendUrl");if(!s){console.error("backendUrl attribute is required");return}this.backendUrl=s,this.sessionId=sessionStorage.getItem("sessionId")||void 0,yield this.createOrUpdateSession(this.getAttribute("orderData")||"{}"),this.isInitialized&&window.addEventListener("message",this.handleMessage.bind(this))})}disconnectedCallback(){this.isInitialized=!1,window.removeEventListener("message",this.handleMessage.bind(this))}createOrUpdateSession(e){return a(this,null,function*(){if(!this.backendUrl||!this.isInitialized){console.error("backendUrl attribute is missing or component is not connected");return}try{let s=this.sessionId?`${this.backendUrl}?sessionId=${this.sessionId}`:this.backendUrl,t=yield fetch(s,{method:"POST",headers:{"Content-Type":"application/json","x-version":"1.0.0"},body:e});if(!t.ok)throw new Error("Failed to create or update session");if(!this.isInitialized)return;let i=yield t.json();this.sessionId!==i.sessionId?console.log(`Created session with id: ${i.sessionId}`):console.log(`Updated session with id: ${i.sessionId}`),this.sessionId=i.sessionId,sessionStorage.setItem("sessionId",this.sessionId),this.iframeSrc=i.url,this.allowedOrigin=new URL(i.url).origin,this.dispatchEvent(new CustomEvent("onSessionIdChange",{detail:{sessionId:this.sessionId}})),this.renderIframe()}catch(s){if(!this.isInitialized)return;let t=s instanceof Error?s.message:"Could not get Daze session";this.dispatchEvent(new CustomEvent("onError",{detail:t})),console.error("Error creating or updating session:",s)}})}renderIframe(){!this.isInitialized||!this.iframeSrc||(this.shadowRoot.innerHTML=`
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
        `)}handleMessage(e){if(!this.isInitialized||e.origin!==this.allowedOrigin){console.warn("Invalid origin:",e.origin);return}switch(e.data.type){case"SUCCESS":this.dispatchEvent(new CustomEvent("onSuccess",{detail:e.data.timeslot}));break;case"ERROR":this.dispatchEvent(new CustomEvent("onError",{detail:e.data.message}));break;default:console.warn("Unknown message type:",e.data.type)}}};customElements.get("timeslot-picker")||customElements.define("timeslot-picker",d);})();
