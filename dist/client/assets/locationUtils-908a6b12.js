import{bn as E,aS as g,aU as U,aV as A,v as i,a8 as M,aT as P,aQ as T,bI as m,bJ as F,br as V,aq as v,a4 as O,bo as B,ab as D,an as N}from"./index-b97375a6.js";import{c as z}from"./init-36a9a4f8.js";import{v as j}from"./datesUtils-b7e6e6ca.js";let C=null,c=null,d={},Y=null,w=null,h=null;E.subscribe(t=>{d=t});g.subscribe(t=>{Y=t});U.subscribe(t=>{w=t});A.subscribe(t=>{h=t});const k=({mapContainer:t,params:e,clearParams:o})=>{const s=i(M),a=t||C,r=Y;let n=c||"";const l=a==null?void 0:a.getCenter(),p=l&&L(l.lat),b=l&&L(l.lng),S=a==null?void 0:a.getZoom();if(e||w||h){const u=e?e.artist:w,y=e?e.crew:h;n="",u&&(n=n.concat(`&artist=${u}`)),y&&(n=n.concat(`&crew=${y}`)),c=n}o==="all"&&(c=null,n=""),o&&Array.isArray(o)&&c&&(n=new URLSearchParams(c.substring(1)),o.forEach(u=>{n.delete(u)}),n=n.toString()?`&${n}`:"",c=n);const R=`/?lat=${p}&lng=${b}&zoom=${S}&year=${r}${n}`;decodeURIComponent(window.location.href).endsWith(R)||s("/",{lat:p,lng:b,zoom:S,year:r},{mode:window.location.pathname==="/"?"replace":"push"})},f=t=>{const e=t.get("year"),o=t.get("artist"),s=t.get("crew");return{year:e,artist:o,crew:s}},G=(t=window.location.search)=>{const e=new URLSearchParams(t);return f(e)},W=t=>{const{year:e,artist:o,crew:s}=f(t),r=[...d.additionalYears?JSON.parse(d.additionalYears):[],P];e&&(o||s)&&r.push(T),e&&j(e,d.yearStart,r)&&g.set(e),o&&U.set(o),s&&A.set(s)},Z=()=>{let t,e;const o=window.location.search;if(o){const s=new URLSearchParams(o),a=s.get("lat"),r=s.get("lng");e=[a,r].map(n=>parseFloat(n,10)),t=+s.get("zoom"),W(s)}return t||e?{zoom:t,center:e}:null},q=(t,e,o,s)=>{const{origin:a,pathname:r}=window.location,n=getSearchUrlFromParams(t,e,o,s);return`${a}${r}${n}`},J=(t,e)=>{const{origin:o}=window.location;return`${o}/registration?invite_code=${t}&from_user=${e}`},x=t=>{C=t},_={getMapLocation:Z,setup:x,update:k,getCustomUrl:q,getInviteUrl:J,getDataFromParams:f,getDataFromUrl:G},$=()=>fetch("https://ipinfo.io/json?token=f7826cd7c9e44b").then(t=>t.json()).then(t=>{const{loc:e}=t;return{center:e.split(",").map(o=>+o),zoom:11}}),Q=async t=>{const e=!t&&_.getMapLocation();if(e)return e;if(navigator.geolocation)try{const o=await new Promise((r,n)=>{navigator.geolocation.getCurrentPosition(r,n)}),{latitude:s,longitude:a}=o.coords;return{center:[+s,+a],zoom:F}}catch{return $()}return $()},I=t=>{const e=t.getBounds();return[e.getNorthWest(),e.getSouthEast()]},tt=t=>{const e=I(t);if(v.set(e),!i(D)&&!i(N)){const o=i(g);z(o)}},et=(t,e)=>{Q(e).then(o=>{t.setView(o.center||m.coordinates,o.zoom||F)}).catch(()=>{t.setView(m.coordinates,m.zoom)}).finally(()=>{_.setup(t),V.set(!0);const o=I(t),s=i(g);v.set(o),e||(O.set(!0),z(s||B()))})},L=t=>Math.round(t*1e5)/1e5;export{tt as h,L as n,_ as p,et as s};
