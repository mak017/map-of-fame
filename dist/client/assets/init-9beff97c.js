import{bo as d,a6 as S,ag as i,aH as c,aK as A,v as r,bt as T,b7 as b,ap as m,ai as k,aF as E,aQ as R,bj as u,bk as g,aP as l,ar as y,br as h,aU as v,aR as F}from"./index-09f9502f.js";import{v as I}from"./auth-f14ad06a.js";import{S as L,c as G,d as q,F as N}from"./endpoints-b6cf54a2.js";import{c as _,e as x}from"./spot-3b7b98da.js";import{a as Y}from"./transformers-2ad5cf36.js";const j=async()=>await(await fetch(L(),{method:"GET"})).json(),B=async()=>await(await fetch(N(),{method:"GET"})).json(),H=async()=>await(await fetch(G(),{method:"GET"})).json(),V=async()=>await(await fetch(q(),{method:"GET"})).json(),z=()=>j().then(s=>{s.success&&s.result&&d.set(Y(s.result))}),D=()=>{H().then(s=>{const{success:t,result:a}=s;t&&a&&S.set(a)})},C=s=>I(s).then(t=>{const{success:a,result:e,errors:o}=t;a&&e?(E.set(e),R.set(!0),u.set(e.isNewbie),e.token&&g("token",e.token)):Array.isArray(o)&&o[0]==="Provided token is expired."&&l("token"),c.set(!1)}).catch(()=>{l("token"),c.set(!1)}),O=()=>{const s=i("token")||null,t=i("isKnownUser")||null;s&&(c.set(!0),C(s)),t||A.set(!0)},Q=s=>{const t=r(y),a=r(h),e=r(u);let o=i("categories"),n=s;return t.length?(o||(o=[1],g("categories",o)),s===v&&(n=""),s===F&&(n=void 0),x(n,t,o,a,e).then(f=>{const{success:w,result:p}=f;w&&p&&m.set(p)})):null},J=s=>{const t=r(h),a=r(u);_(s,t,a).then(({result:e})=>{T.set(s),b.set(e),m.set({spots:e});const o=`
      .map-marker-with-photo, .map-marker-cluster
        {
          width: 34px !important;
          height: 34px !important;
          border-width: 2px;
          opacity: 1 !important;
          font-size: 14px;
          pointer-events: auto !important;
        }
      `;document.getElementById("highlighted").innerHTML=o,k.set(!1)})};export{J as a,V as b,Q as c,B as d,z as g,O as i,D as r};
