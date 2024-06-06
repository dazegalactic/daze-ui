"use strict";(()=>{var a=(c,e,s)=>new Promise((i,n)=>{var h=t=>{try{r(s.next(t))}catch(o){n(o)}},l=t=>{try{r(s.throw(t))}catch(o){n(o)}},r=t=>t.done?i(t.value):Promise.resolve(t.value).then(h,l);r((s=s.apply(c,e)).next())});var d=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){return a(this,null,function*(){let e="",s=(e==null?void 0:e.length)>0?e:this.getAttribute("backendUrl");if(!s){console.error("backendUrl attribute is required");return}this.backendUrl=s,this.sessionId=sessionStorage.getItem("sessionId")||void 0,yield this.createOrUpdateSession(this.getAttribute("orderData")||"{}"),window.addEventListener("message",this.handleMessage.bind(this))})}disconnectedCallback(){window.removeEventListener("message",this.handleMessage.bind(this))}createOrUpdateSession(e){return a(this,null,function*(){if(!this.backendUrl){console.error("backendUrl attribute is missing");return}try{let s=this.sessionId?`${this.backendUrl}?sessionId=${this.sessionId}`:this.backendUrl,i=yield fetch(s,{method:"POST",headers:{"Content-Type":"application/json","x-version":"1.0.0"},body:e});if(!i.ok)throw new Error("Failed to create or update session");let n=yield i.json();this.sessionId=n.sessionId,sessionStorage.setItem("sessionId",this.sessionId),this.iframeSrc=n.url,this.allowedOrigin=new URL(n.url).origin,this.dispatchEvent(new CustomEvent("onSessionIdChange",{detail:{sessionId:this.sessionId}})),this.renderIframe()}catch(s){let i=s instanceof Error?s.message:"Could not get Daze session";this.dispatchEvent(new CustomEvent("onError",{detail:i})),console.error("Error creating or updating session:",s)}})}renderIframe(){this.iframeSrc&&(this.shadowRoot.innerHTML=`
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
            `)}handleMessage(e){if(e.origin!==this.allowedOrigin){console.warn("Invalid origin:",e.origin);return}switch(e.data.type){case"SUCCESS":this.dispatchEvent(new CustomEvent("onSuccess",{detail:e.data.timeslot}));break;case"ERROR":this.dispatchEvent(new CustomEvent("onError",{detail:e.data.message}));break;default:console.warn("Unknown message type:",e.data.type)}}};customElements.get("timeslot-picker")||customElements.define("timeslot-picker",d);})();
