if(!self.define){let s,e={};const i=(i,n)=>(i=new URL(i+".js",n).href,e[i]||new Promise((e=>{if("document"in self){const s=document.createElement("script");s.src=i,s.onload=e,document.head.appendChild(s)}else s=i,importScripts(i),e()})).then((()=>{let s=e[i];if(!s)throw new Error(`Module ${i} didn’t register its module`);return s})));self.define=(n,l)=>{const r=s||("document"in self?document.currentScript.src:"")||location.href;if(e[r])return;let t={};const u=s=>i(s,r),o={module:{uri:r},exports:t,require:u};e[r]=Promise.all(n.map((s=>o[s]||u(s)))).then((s=>(l(...s),t)))}}define(["./workbox-5ffe50d4"],(function(s){"use strict";self.skipWaiting(),s.clientsClaim(),s.precacheAndRoute([{url:"assets/index-7CQuqmcz.css",revision:null},{url:"assets/index-C7tymWIn.js",revision:null},{url:"assets/index-legacy-7VKThg4R.js",revision:null},{url:"assets/index9-BKscVSpF.js",revision:null},{url:"assets/index9-legacy-fZwi7hF5.js",revision:null},{url:"assets/input-shims-Bv3Vpqo-.js",revision:null},{url:"assets/input-shims-legacy-DOMYKtND.js",revision:null},{url:"assets/ios.transition-hqmYhk9w.js",revision:null},{url:"assets/ios.transition-legacy-BnoRchjg.js",revision:null},{url:"assets/md.transition-BgXUgtwx.js",revision:null},{url:"assets/md.transition-legacy-iwJwLmEe.js",revision:null},{url:"assets/polyfills-legacy-D_ulJKPp.js",revision:null},{url:"assets/status-tap-B55_KsXp.js",revision:null},{url:"assets/status-tap-legacy-BtG2CtCn.js",revision:null},{url:"assets/swipe-back-legacy-Uy8gl1S8.js",revision:null},{url:"assets/swipe-back-ViuAGTn1.js",revision:null},{url:"index.html",revision:"7b931f34d50e069ac4f26425207583ab"},{url:"registerSW.js",revision:"402b66900e731ca748771b6fc5e7a068"},{url:"favicon.ico",revision:"79493c1808b09614abdf2031b02c0216"},{url:"pwa-192x192.png",revision:"89c67223d1a09e2e639ca22ad1205dd0"},{url:"pwa-512x512.png",revision:"5832626f7dfce74481103cc2fd0d2f77"},{url:"manifest.webmanifest",revision:"8e093cb0f05d225ec26f7117f65b2cad"}],{}),s.cleanupOutdatedCaches(),s.registerRoute(new s.NavigationRoute(s.createHandlerBoundToURL("index.html")))}));
