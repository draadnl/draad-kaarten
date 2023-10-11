(()=>{var u=class{constructor(e){this._rootEl=e}_rootEl=null;_active=!1;_firstFocusableElement=null;_lastFocusableElement=null;get active(){return this._active}set active(e){typeof e=="boolean"&&(this._active=e,this._active?this.activate():this.deactivate())}activate(){if(!this.active)return;let t=Array.from(this._rootEl.querySelectorAll("a[href], button, textarea, input, select, summary, [tabindex]")).filter(a=>a.offsetParent!==null);this._firstFocusableElement=t[0],this._lastFocusableElement=t[t.length-1],this._rootEl.addEventListener("keydown",a=>{a.key==="Tab"&&(!a.shiftKey&&document.activeElement===this._lastFocusableElement?(a.preventDefault(),this._firstFocusableElement.focus()):a.shiftKey&&document.activeElement===this._firstFocusableElement&&(a.preventDefault(),this._lastFocusableElement.focus()))})}deactivate(){this._rootEl.removeEventListener("keydown",()=>{}),this._firstFocusableElement=null,this._lastFocusableElement=null}},m=u;var _={},w=new Event("draadMapsLoaded");function y(){_.maps=[],document.querySelectorAll(".draad-maps").forEach(function(e){let t=new p(e);_.maps.push(t)})}document.addEventListener("DOMContentLoaded",y);var p=class{constructor(e){this._node=e,this._outerWrapper=e.closest(".draad-maps__wrapper"),this._map=this._createMap();let t=L.markerClusterGroup({showCoverageOnHover:!1,iconCreateFunction:n=>{var r=n.getChildCount(),i=" marker-cluster-";return r<10?i+="small":r<100?i+="medium":i+="large",new L.DivIcon({html:"<div><span>"+r+' <span aria-label="markers"></span></span></div>',className:"marker-cluster"+i,iconSize:new L.Point(40,40)})}}),a=this._outerWrapper.querySelectorAll(".draad-infowindow"),o=L.layerGroup(),s=0;for(let n of a){let r=n.offsetHeight;r>s&&(s=r),this.addMarker(n).addTo(o)}this._layers.locations=o,this._layers.locations.addTo(t);let l=parseInt(getComputedStyle(document.documentElement).fontSize);if(e.style.minHeight=s/l+3+"rem",document.getElementById(e.id+"-borders")){let n=document.getElementById(e.id+"-borders").dataset.draadGeojson;fetch(n).then(r=>r.json()).then(r=>{let i=this._addData(r);this._layers.borders=i,this._layers.borders.addTo(t)})}if(document.getElementById(e.id+"-geojson")){let n=document.getElementById(e.id+"-geojson").dataset.draadGeojson;fetch(n).then(r=>r.json()).then(r=>{let i=document.getElementById(e.id+"-geojson").dataset.draadMarker,d=document.getElementById(e.id+"-geojson").dataset.draadMarkerActive,f=this._addData(r,i,d);this._layers.geojson=f,this._layers.geojson.addTo(t)})}this._outerWrapper.addEventListener("keypress",n=>{if(n.key==="Enter"){var r=function(i){var d=new MouseEvent("click",{bubbles:!0,cancelable:!0,view:window}),f=!i.dispatchEvent(d)};r(n.target)}}),this._map.addLayer(t);let c=this._outerWrapper.querySelector(".draad-search");c&&(this._searchInput=c.querySelector(".draad-search__input"),this._searchSubmit=c.querySelector(".draad-search__submit"),this._searchHandler())}_createMap=()=>{let e=this._node.dataset.draadCenter.split("/");this._center=[parseFloat(e[1]),parseFloat(e[2])],this._zoom=parseInt(e[0]);let t=L.map(this._node.id,{dragging:!L.Browser.mobile,tap:!L.Browser.mobile,scrollWheelZoom:!1}).setView(this._center,this._zoom);return L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:16,minZoom:10,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(t),t.removeControl(t.zoomControl),L.control.zoom({position:"bottomleft",zoomInText:'<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g><path d="M10 4.16602V15.8327" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.16602 10H15.8327" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g></svg>',zoomInTitle:"Zoom in",zoomOutText:'<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g><path d="M4.16602 10H15.8327" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g></svg>',zoomOutTitle:"Zoom out"}).addTo(t),t};addMarker=e=>{let t=e.dataset.draadCenter.split("/").map(parseFloat),a=L.marker(t,{icon:this._markerStyles.primary,riseOnHover:!0,alt:e.querySelector(".draad-infowindow__title").textContent});return a.selected=!1,a.locationTrap=new m(e),this._markerHandler(a,e),a};_markerHandler=(e,t=null,a=null,o=null)=>{let s=this,l=t?t.querySelector(".draad-infowindow__close"):null;l&&l.addEventListener("click",c=>{e.locationTrap.active=!1,s._markerSetState(e,"default",a,o),e.selected=!1,e._icon&&e._icon.focus(),t.classList.remove("draad-infowindow--active"),t.setAttribute("aria-hidden","true"),t.setAttribute("hidden","")}),e.on("click",c=>{t?e.selected===!0?(e.locationTrap.active=!1,t.classList.remove("draad-infowindow--active"),t.setAttribute("aria-hidden","true"),t.setAttribute("hidden",""),e._icon&&e._icon.focus()):(t.classList.add("draad-infowindow--active"),t.setAttribute("aria-hidden","false"),t.removeAttribute("hidden"),e.locationTrap.active=!0,t.querySelector(".draad-infowindow__close").focus()):e.openPopup(),e.selected===!0?(s._markerSetState(e,"default",a,o),e.selected=!1):(s._markerSetState(e,"active",a,o),e.selected=!0)}),e.on("popupclose",c=>{s._markerSetState(e,"default",a,o),e.selected=!1,t&&(e.locationTrap.active=!1,t.classList.remove("draad-infowindow--active"),t.setAttribute("aria-hidden","true"),t.setAttribute("hidden",""),e._icon&&e._icon.focus())})};_markerSetState=(e,t,a=null,o=null)=>{switch(t){case"default":var s=this._markerStyles.primary;a&&(s.options.iconUrl=a),e.setIcon(s);break;case"active":var s=this._markerStyles.active;a&&(s.options.iconUrl=o),e.setIcon(s);break;case"hover":var s=this._markerStyles.hover;a&&(s.options.iconUrl=o),e.setIcon(s);break;case"focus":var s=this._markerStyles.focus;a&&(s.options.iconUrl=o),e.setIcon(s);break}};_addData=(e,t=null,a=null)=>{let o=L.geoJSON(e);for(let s of o.getLayers())if(s.bindPopup(s.feature.properties.name),typeof s.setStyle=="function"&&(s.setStyle(this._borderStyles.default),s.options.alt=s.feature.properties.name,s.selected=!1,this._dataHandler(s)),typeof s.setIcon=="function")if(t){let l=this._markerStyles.primary;l.options.iconUrl=t,s.setIcon(l),s.options.alt=s.feature.properties.name,s.selected=!1,this._markerHandler(s,null,t,a)}else s.setIcon(this._markerStyles.primary),s.options.alt=s.feature.properties.name,s.selected=!1,this._markerHandler(s);return o};_dataHandler=e=>{let t=this;e.on("click",a=>{t._dataSetState(e,"active"),t._map.flyToBounds(e.getBounds(),{padding:[0,0]})}),e.on("popupclose",a=>{t._dataSetState(e,"default")})};_dataSetState=(e,t)=>{switch(t){case"default":e.setStyle(this._borderStyles.default);break;case"active":e.setStyle(this._borderStyles.highlight);break;case"hover":e.setStyle(this._borderStyles.hover);break;case"focus":e.setStyle(this._borderStyles.focus);break}};_searchHandler=()=>{let e=document.getElementById(this._searchInput.getAttribute("list"));this._searchInput.addEventListener("keyup",g(()=>{fetch(`https://nominatim.openstreetmap.org/search?&q=Den+Haag+${this._searchInput.value}&layer=address,manmade,poi&polygon_geojson=1&countrycodes=nl&format=json&addressdetails=1&limit=10`).then(t=>t.json()).then(t=>{e.innerHTML="",t.forEach(a=>{let o=document.createElement("option");o.value=a.display_name,e.appendChild(o)})})},750)),this._searchSubmit.addEventListener("click",t=>{t.preventDefault(),this._removeSearchMarker(),fetch(`https://nominatim.openstreetmap.org/search?&q=Den+Haag+${this._searchInput.value}&layer=address,manmade,poi&polygon_geojson=1&countrycodes=nl&format=geojson&addressdetails=1&limit=1`).then(a=>a.json()).then(a=>{a.features.length!==0&&this._addSearchMarker(a)}).then(()=>{this._sortLocations()})})};_addSearchMarker=e=>{let t=L.layerGroup();t.addLayer(L.geoJson(e,{style:{color:"#1261A3",weight:3,fillColor:"#1261A3",fillOpacity:.3},onEachFeature:(a,o)=>{typeof o.setIcon=="function"?o.setIcon(this._markerStyles.search):typeof o.setStyle=="function"&&o.setStyle(this._borderStyles.search)}})),this._map.flyToBounds(L.geoJson(e).getBounds(),{padding:[50,50]}),t.addTo(this._map),this._layers.search=t};_removeSearchMarker=()=>{this._layers.search&&(this._map.removeLayer(this._layers.search),delete this._layers.search)};_sortLocations=()=>{let e=this._node.closest(".draad-maps__wrapper"),t=e.querySelector(".draad-grid"),a=e.querySelectorAll(".draad-card");if(!this._layers.search)return;let o=this._layers.search.getLayers()[0].getBounds().getCenter(),s=[...a].sort((l,c)=>{let n=l.getAttribute("data-draad-center").split("/").map(Number),r=c.getAttribute("data-draad-center").split("/").map(Number),i=this._map.distance(o,n),d=this._map.distance(o,r);return i-d});t.innerHTML="",s.forEach(l=>{t.appendChild(l)})};_node=null;_map=null;_center=null;_zoom=null;_outerWrapper=null;_layers=[];_markerStyles={primary:L.icon({iconUrl:"/wp-content/plugins/draad-kaarten/dist/images/marker.png",iconSize:[39.2,51.2],iconAnchor:[19.6,51.2],popupAnchor:[-3,-76]}),hover:L.icon({iconUrl:"/wp-content/plugins/draad-kaarten/dist/images/marker-hover.png",iconSize:[39.2,51.2],iconAnchor:[19.6,51.2],popupAnchor:[-3,-76]}),active:L.icon({iconUrl:"/wp-content/plugins/draad-kaarten/dist/images/marker-active.png",iconSize:[39.2,51.2],iconAnchor:[19.6,51.2],popupAnchor:[-3,-76]}),search:L.icon({iconUrl:"/wp-content/plugins/draad-kaarten/dist/images/marker-search.png",iconSize:[39.2,51.2],iconAnchor:[19.6,51.2],popupAnchor:[-3,-76]})};_borderStyles={default:{color:"#248641",weight:4,dashArray:"8, 8",fillColor:"#248641",fillOpacity:0},focus:{color:"#7D6200",weight:4,dashArray:"0, 0",fillColor:"#248641",fillOpacity:.15},hover:{color:"#248641",weight:4,dashArray:"0, 0",fillColor:"#248641",fillOpacity:.15},highlight:{color:"#248641",weight:4,dashArray:"0, 0",fillColor:"#248641",fillOpacity:.3},search:{color:"#1261A3",weight:4,dashArray:"0, 0",fillColor:"#1261A3",fillOpacity:.3}}};function g(h,e){let t;return(...a)=>{clearTimeout(t),t=setTimeout(function(){h.apply(this,a)},e)}}})();
//# sourceMappingURL=draad-maps.js.map
