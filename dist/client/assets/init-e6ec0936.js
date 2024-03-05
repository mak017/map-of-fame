import{bn as d,a6 as T,af as c,aG as u,aJ as b,v as r,bs as A,b6 as y,ao as f,bO as h,ah as E,aE as k,aP as R,bi as p,bj as g,aO as m,aq as v,bq as w,aT as q,aQ as G}from"./index-e502461a.js";import{v as I}from"./auth-e9453778.js";import{S as L,c as F,d as N,F as _}from"./endpoints-6d51edb4.js";import{c as x,e as H}from"./spot-9709e91e.js";import{a as Y}from"./transformers-2ad5cf36.js";const j=async()=>await(await fetch(L(),{method:"GET"})).json(),K=async()=>await(await fetch(_(),{method:"GET"})).json(),$=async()=>await(await fetch(F(),{method:"GET"})).json(),V=async()=>await(await fetch(N(),{method:"GET"})).json(),z=()=>j().then(s=>{s.success&&s.result&&d.set(Y(s.result))}),D=()=>{$().then(s=>{const{success:t,result:a}=s;t&&a&&T.set(a)})},B=s=>I(s).then(t=>{const{success:a,result:o,errors:e}=t;a&&o?(k.set(o),R.set(!0),p.set(o.isNewbie),o.token&&g("token",o.token)):Array.isArray(e)&&e[0]==="Provided token is expired."&&m("token"),u.set(!1)}).catch(()=>{m("token"),u.set(!1)}),J=()=>{const s=c("token")||null,t=c("isKnownUser")||null;s&&(u.set(!0),B(s)),t||b.set(!0)},Q=s=>{const t=r(v),a=r(w),o=r(p);let e=c("categories"),n=s;return t.length?(e||(e=[1],g("categories",e)),s===q&&(n=""),s===G&&(n=void 0),H(n,t,e,a,o).then(i=>{const{success:S,result:l}=i;S&&l&&f.set(l)})):null},W=(s,t)=>{const a=r(w),o=r(p);x(s,a,o).then(({result:e})=>{if(A.set(s),y.set(e),f.set({spots:e}),t){const i=r(h);h.set({...i,[t]:{areaSpots:e}})}const n=`
      .map-marker-with-photo, .map-marker-cluster
        {
          width: 34px !important;
          height: 34px !important;
          border-width: 2px;
          opacity: 1 !important;
          font-size: 14px;
          pointer-events: auto !important;
        }
      `;document.getElementById("highlighted").innerHTML=n,E.set(!1)})};export{W as a,V as b,Q as c,K as d,z as g,J as i,D as r};
