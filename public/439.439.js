(self.webpackChunkmap_of_fame=self.webpackChunkmap_of_fame||[]).push([[439],{8407:(t,e,n)=>{"use strict";n.d(e,{T:()=>D});var a=n(5243),i={leafletAreaSelectorControl:"_37qQG",leafletMapOverlayPane:"_39tTo",drawPaneHelp:"_2Ftyt",endSelectionArea:"_3Xj9O",areaSelectMarker:"_1h_hk",areaSelectGhostMarker:"_1KD2U _1h_hk"};function r(t,e){void 0===e&&(e="");var n=function(t){return t.split("-").map((function(t,e){return 0===e?t:""+t[0].toUpperCase()+t.substring(1)})).join("")}(t);return i[n]?e?i[n]+" "+t+" "+e:i[n]+" "+t:e?t+" "+e:t}function o(t,e,n){void 0===n&&(n=null);var i=n?e.add(n):e;t._leaflet_pos=i,a.Browser.any3d?a.DomUtil.setTransform(t,i):(t.style.left=i.x+"px",t.style.top=i.y+"px")}var s=a.Browser.mobile?"touchend":"click";function l(t){return t.isTrusted||window.Cypress}var c="area-draw-selection";function h(t){var e=t.getMap().getPane(c).querySelector(".end-selection-area");e&&e.remove()}function d(){return d=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var a in n)Object.prototype.hasOwnProperty.call(n,a)&&(t[a]=n[a])}return t},d.apply(this,arguments)}function g(t){t.originalEvent.preventDefault(),t.originalEvent.stopPropagation()}function m(t){var e=this;if(!this.mapMoving){var n=this.getMap(),i=t.clientX,h=t.clientY;if(void 0===i&&void 0===h){var m=t.changedTouches[0];i=m.clientX,h=m.clientY}if(this.rectDrawing&&null!==this.rectDrawEnd)n.fire("as:dragging-rect-end");else{var u=t.index,v=void 0===u?null:u,p=n.getContainer().getBoundingClientRect(),f=i-p.left,k=h-p.top;0===this.markers.length&&function(t,e){var n=e[0],i=e[1],h=t.getMap(),d=h.getPane(c),g=a.DomUtil.create("div",r("end-selection-area"),d),m=g.getBoundingClientRect();g.setAttribute("role","button"),g.addEventListener(s,(function(t){l(t)&&(t.stopPropagation(),h.fire("as:creation-end"))}),{once:!0}),g.addEventListener("mouseenter",t.hoverClosePoint.bind(t)),g.addEventListener("mouseleave",t.outClosePoint.bind(t)),o(g,new a.Point(n,i),new a.Point(-m.width/2,-m.height/2))}(this,[f,k]);var L=new a.Point(f,k),w=new a.DivIcon({className:r("area-select-marker"),iconSize:[16,16]}),b=new a.Marker(n.containerPointToLatLng(L),{icon:w,draggable:!0}),P=y.bind(this);b.on("drag",P(null===v?this.markers.length:v)),b.on("dragstart",(function(t){t.target.getElement().classList.add("active")})),b.on("dragend",(function(t){t.target.getElement().classList.remove("active"),requestAnimationFrame((function(){e.onPolygonReady()}))}));var M,_={marker:b,index:v};if(b.on("dblclick",(M=this.markers.length,function(t){t.originalEvent.stopPropagation(),n.fire("as:marker-remove",d({},_,{index:null===v?M:v}))})),b.on(s,g),b.addTo(n),n.fire("as:marker-add",_),null!==v)for(var D=function(t){e.markers[t].marker.off("drag"),e.markers[t].marker.on("drag",P(t)),e.markers[t].marker.off(s),e.markers[t].marker.on(s,g),e.markers[t].marker.off("dblclick"),e.markers[t].marker.on("dblclick",(function(a){n.fire("as:marker-remove",d({},e.markers[t],{index:t}))}))},E=v+1;E<this.markers.length;E++)D(E)}}}function u(t){var e=t.index,n=void 0===e?null:e,i=function(t,e){if(null==t)return{};var n,a,i={},r=Object.keys(t);for(a=0;a<r.length;a++)n=r[a],e.indexOf(n)>=0||(i[n]=t[n]);return i}(t,["index"]),o=this.getMap(),s={marker:i.marker},l=this.markers;null===n?l.push(s):l.splice(n,0,s);var c=l.length>=3;"draw"===this.phase&&(c?3===l.length&&l.forEach((function(t,e){var n=t.marker,a=n.getIcon();a.options.className=r("area-select-marker",0===e?"start-marker":null),n.setIcon(a)})):l.forEach((function(t){var e=t.marker,n=e.getIcon();n.options.className=r("area-select-marker","invalid"),e.setIcon(n)}))),o.fire("as:update-polygon"),"adjust"===this.phase&&(o.fire("as:update-ghost-points"),this.onPolygonReady()),"draw"===this.phase&&(this.closeLine&&o.removeLayer(this.closeLine),c&&(this.closeLine=new a.Polyline([l[0].marker.getLatLng(),l[l.length-1].marker.getLatLng()],{weight:3,color:"#c0c0c0",className:"areaCloseLine"}),o.addLayer(this.closeLine)))}function v(t){var e=this,n=t.index,a=void 0===n?0:n,i=this.getMap();if(this.markers.length>3){this.markers.splice(a||0,1)[0].marker.removeFrom(i),i.fire("as:update-polygon"),"adjust"===this.phase&&i.fire("as:update-ghost-points");for(var r=function(t){e.markers[t].marker.off("drag"),e.markers[t].marker.on("drag",y.bind(e)(t)),e.markers[t].marker.off(s),e.markers[t].marker.on(s,g),e.markers[t].marker.off("dblclick"),e.markers[t].marker.on("dblclick",(function(n){n.originalEvent.stopPropagation(),i.fire("as:marker-remove",d({},e.markers[t],{index:t}))}))},o=a;o<this.markers.length;o++)r(o);this.onPolygonReady()}}function p(){var t=this,e=this.getMap(),n=this.markers,i=n.length>=3,r=new a.Polygon(n.map((function(t){return t.marker.getLatLng()})),d({color:i?"rgb(45, 123, 200)":"rgba(220, 53, 69, 0.7)",weight:2},!i&&{dashArray:"5, 10"},{className:"drawing-area-poligon"}));r.on(s,(function(t){a.DomEvent.stopPropagation(t)})),r.on("dblclick",(function(e){return a.DomEvent.stopPropagation(e),t.onPolygonDblClick(e),!1})),this.polygon&&e.removeLayer(this.polygon),this.polygon=r,e.addLayer(this.polygon)}function f(){var t=this,e=this.getMap();requestAnimationFrame((function(){t.clearGhostMarkers();var n=t.markers,i=t.ghostMarkers;n.forEach((function(o,l){var c=n[l+1]?n[l+1]:n[0],h=o.marker.getLatLng(),d=c.marker.getLatLng(),m=e.latLngToContainerPoint([(h.lat+d.lat)/2,(h.lng+d.lng)/2]),u=new a.DivIcon({className:r("area-select-ghost-marker"),iconSize:[16,16]}),v=new a.Marker(e.containerPointToLatLng(m),{icon:u,draggable:!0}),p={marker:v};v.on(s,g),v.on("dblclick",g),v.on("dragstart",b.bind(t)()),v.on("drag",w.bind(t)(i.length)),v.on("dragend",P.bind(t)(i.length)),i.push(p),v.addTo(e)}))}))}function k(){var t=this.getMap();t.dragging.enable(),t.removeLayer(this.closeLine),this.closeLine=null,this.markers[0].marker.getElement().classList.remove("start-marker"),this.setPhase("adjust"),t.fire("as:update-ghost-points"),this.onPolygonReady(),h(this)}function L(t){if(l(t)){var e=this.getMap();this._dragStatus=e.dragging._enabled,t.stopPropagation(),t.target.blur(),this.options.active||"adjust"===this.phase?(this._dragStatus||e.dragging.disable(),this.options.onButtonDeactivate(this.polygon,this,t),t.defaultPrevented||this.deactivate()):(this.options.onButtonActivate(this,t),t.defaultPrevented||this.activate())}}function y(t){var e=this.getMap();return function(t){requestAnimationFrame((function(){e.fire("as:update-polygon"),e.fire("as:update-ghost-points")}))}}function w(t){var e=this,n=this.getMap();return function(i){var r=i.latlng;requestAnimationFrame((function(){var i=e.markers[t],o=e.markers[t+1]?e.markers[t+1]:e.markers[0];e.ghostPolygon&&n.removeLayer(e.ghostPolygon),e.ghostPolygon=new a.Polygon([i.marker.getLatLng(),r,o.marker.getLatLng()],{color:"rgb(45, 123, 200)",weight:2,opacity:.5,fillOpacity:.1,dashArray:"5, 10"}),n.addLayer(e.ghostPolygon),n.fire("as:update-polygon")}))}}function b(){return function(t){t.target.getElement().classList.add("active")}}function P(t){var e=this,n=this.getMap();return function(a){var i=a.target;i.getElement().classList.remove("active"),i.removeFrom(n),e.ghostPolygon&&n.removeLayer(e.ghostPolygon);var r=n.latLngToContainerPoint(i.getLatLng()),o=n.getContainer().getBoundingClientRect(),s={clientX:r.x+o.left,clientY:r.y+o.top,index:t+1};n.fire("as:point-add",s)}}function M(t){if(!this.mapMoving&&0===this.markers.length&&0!==t.which&&1===t.buttons){var e=this.getMap();if(!this.rectDrawing){this.rectDrawStart=[t.clientX,t.clientY];var n={weight:2,color:"#8B4513",className:"rect-progress-line",opacity:.6};return this.draggingRect=(new a.LayerGroup).addLayer(new a.Polyline([],n)).addLayer(new a.Polyline([],n)).addTo(e),void(this.rectDrawing=!0)}this.rectDrawEnd=[t.clientX,t.clientY];var i=[this.rectDrawStart[0],t.clientY],r=[t.clientX,this.rectDrawStart[1]],o=this.draggingRect.getLayers();o[0].setLatLngs([e.mouseEventToLatLng({clientX:this.rectDrawEnd[0],clientY:this.rectDrawEnd[1]}),e.mouseEventToLatLng({clientX:i[0],clientY:i[1]}),e.mouseEventToLatLng({clientX:this.rectDrawStart[0],clientY:this.rectDrawStart[1]})]),o[1].setLatLngs([e.mouseEventToLatLng({clientX:this.rectDrawEnd[0],clientY:this.rectDrawEnd[1]}),e.mouseEventToLatLng({clientX:r[0],clientY:r[1]}),e.mouseEventToLatLng({clientX:this.rectDrawStart[0],clientY:this.rectDrawStart[1]})])}}function _(){this.rectDrawing=!1;var t={clientX:this.rectDrawStart[0],clientY:this.rectDrawStart[1]},e={clientX:this.rectDrawEnd[0],clientY:this.rectDrawStart[1]},n={clientX:this.rectDrawEnd[0],clientY:this.rectDrawEnd[1]},a={clientX:this.rectDrawStart[0],clientY:this.rectDrawEnd[1]};m.bind(this)(t),m.bind(this)(e),m.bind(this)(n),m.bind(this)(a),this._map.fire("as:creation-end"),this.rectDrawStart=null,this.rectDrawEnd=null,this.draggingRect.removeFrom(this._map)}var D=a.Control.extend({options:{active:!1,fadeOnActivation:!0,onPolygonReady:function(t,e){},onPolygonDblClick:function(t,e,n){},onButtonActivate:function(t,e){},onButtonDeactivate:function(t,e,n){}},initialize:function(t){void 0===t&&(t={}),a.Util.setOptions(this,t),this._map=null,this.phase=t.active?"draw":"inactive",this.mapMoving=!1,this.rectDrawing=!1,this.rectDrawStart=null,this.rectDrawEnd=null,this.draggingRect=null,this.markers=[],this.ghostMarkers=[],this.polygon=null,this.closeLine=null,this._mapMoveStart=this._mapMoveStart.bind(this),this._mapMoveEnd=this._mapMoveEnd.bind(this),this._handleMouseMove=this._handleMouseMove.bind(this)},onAdd:function(t){this._container=a.DomUtil.create("div",r("leaflet-area-selector-control")),this.activateButton=a.DomUtil.create("button","",this._container),this.activateButton.setAttribute("aria-label","Draw shape"),this.activateButton.setAttribute("aria-describedby","draw-panel-help"),this.activateButton.addEventListener("click",L.bind(this)),this.activateButton.addEventListener("dblclick",(function(t){t.stopPropagation()})),this.options.active?this.activateButton.classList.add("active"):this.activateButton.classList.remove("active"),this._map=t;var e=function(t,e){var n,i,o=t.getContainer().querySelector(".leaflet-map-pane"),h=function(t){var e=t.active,n=t.fadeOnActivation;return a.DomUtil.create("div",r("leaflet-map-overlay-pane","leaflet-pane"+(e?"":" inactive")+(n?" fading-enabled":"")))}(e);n=h,(i=o).parentNode.insertBefore(n,i.nextSibling);var d=t.createPane(c,h);return d.addEventListener(s,(function(e){l(e)&&(e.stopPropagation(),t.fire("as:point-add",e))})),d}(t,this.options);return this.addUserHelpPanel(e),t.getContainer().addEventListener("mousemove",this._handleMouseMove),t.on("movestart",this._mapMoveStart),t.on("moveend",this._mapMoveEnd),t.on("as:point-add",m.bind(this)),t.on("as:marker-add",u.bind(this)),t.on("as:marker-remove",v.bind(this)),t.on("as:creation-end",k.bind(this)),t.on("as:update-polygon",p.bind(this)),t.on("as:update-ghost-points",f.bind(this)),t.on("as:dragging-rect-end",_.bind(this)),this._container},onRemove:function(t){t.getContainer().removeEventListener("mousemove",this._handleMouseMove),t.off("movestart",this._mapMoveStart),t.off("moveend",this._mapMoveEnd),t.off("as:point-add"),t.off("as:marker-add"),t.off("as:marker-remove"),t.off("as:creation-end"),t.off("as:update-polygon"),t.off("as:update-ghost-points"),t.off("as:dragging-rect-end")},getMap:function(){return this._map},onPolygonReady:function(){this.options.onPolygonReady(this.polygon,this)},onPolygonDblClick:function(t){this.options.onPolygonDblClick(this.polygon,this,t)},addUserHelpPanel:function(t){var e=a.DomUtil.create("div",r("draw-pane-help"));e.setAttribute("id","draw-panel-help"),e.setAttribute("role","tooltip");var n="Define a polygon by clicking of the map to define vertexes"+(a.Browser.mobile?".":" or click-and-drag to obtain a rectangular shape.");e.textContent=n,t.appendChild(e)},setPhase:function(t,e){void 0===e&&(e=!1),this.phase=t,this.options.active="draw"===t,(e||"draw"===this.phase)&&(this.clearGhostMarkers(),this.clearMarkers(),this.clearPolygon());var n=this._map.getPane(c).parentNode;this.options.active?n.classList.remove("inactive"):n.classList.add("inactive")},_mapMoveStart:function(){this.options.active&&(this.mapMoving=!0)},_mapMoveEnd:function(){var t=this;if(this.options.active){var e=this._map;requestAnimationFrame((function(){t.mapMoving=!1}));var n=e.getPane(c).querySelector(".end-selection-area");if(n){var i=this.markers[0].marker,r=n.getBoundingClientRect();o(n,e.latLngToContainerPoint(i.getLatLng()),new a.Point(-r.width/2,-r.height/2))}}},hoverClosePoint:function(t){this.markers.length>2&&this.closeLine&&this.closeLine.removeFrom(this._map)},outClosePoint:function(t){this.closeLine&&this.closeLine.addTo(this._map)},clearMarkers:function(){var t=this;this.markers.forEach((function(e){e.marker.removeFrom(t._map)})),this.markers=[]},clearGhostMarkers:function(){var t=this;this.ghostMarkers.forEach((function(e){e.marker.removeFrom(t._map)})),this.ghostMarkers=[]},clearPolygon:function(){this.polygon&&this.polygon.removeFrom(this._map),this.polygon=null,this.closeLine&&this.closeLine.removeFrom(this._map),this.closeLine=null},deactivate:function(){h(this),this.activateButton.classList.remove("active"),this._map.getContainer().classList.remove("drawing-area"),this.setPhase("inactive",!0)},activate:function(){this._map.dragging.disable(),this.activateButton.classList.add("active"),this._map.getContainer().classList.add("drawing-area"),this.setPhase("draw",!0)},_handleMouseMove:function(t){this.options.active&&M.bind(this)(t)}});a.Util.extend(a.Control,{DrawAreaSelection:D,drawAreaSelection:function(t){return void 0===t&&(t={}),new D(t)}})},6438:()=>{}}]);