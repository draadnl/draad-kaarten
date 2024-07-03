(()=>{var y=class{constructor(e){this.rootEl=e}rootEl=null;_active=!1;firstFocusableElement=null;lastFocusableElement=null;get active(){return this._active}set active(e){typeof e=="boolean"&&(this._active=e,this._active?this.activate():this.deactivate())}activate(){if(!this._active)return;let e=Array.from(this.rootEl.querySelectorAll("a[href], button, textarea, input, select, summary, [tabindex]"));if(e.filter(s=>s.getAttribute("tabindex")!=="-1"),e.length===0)return;let t=e.filter(s=>s.offsetParent!==null);this.firstFocusableElement=t[0],this.lastFocusableElement=t[t.length-1],this.rootEl.addEventListener("keydown",s=>{s.key==="Tab"&&(!s.shiftKey&&document.activeElement===this.lastFocusableElement?(s.preventDefault(),this.firstFocusableElement.focus()):s.shiftKey&&document.activeElement===this.firstFocusableElement&&(s.preventDefault(),this.lastFocusableElement.focus()))})}deactivate(){this.rootEl.removeEventListener("keydown",()=>{}),this.firstFocusableElement=null,this.lastFocusableElement=null}},g=y;var v={},b=new Event("draadMapsLoaded");function S(){v.maps=[],document.querySelectorAll(".draad-maps").forEach(e=>{let t=new f(e);v.maps.push(t),document.dispatchEvent(b)})}document.addEventListener("DOMContentLoaded",S);var f=class{constructor(e){if(!e)throw new Error("Draad Maps: No map node provided.");this.mapNode=e,this.outerWrapper=e.closest(".draad-maps__wrapper"),this.map=this.createMap();let t=L.markerClusterGroup({showCoverageOnHover:!1,iconCreateFunction:l=>{let r=l.getChildCount(),n=" marker-cluster-";return r<10?n+="small":r<100?n+="medium":n+="large",new L.DivIcon({html:"<div><span>"+r+' <span aria-label="markers"></span></span></div>',className:"marker-cluster"+n,iconSize:new L.Point(40,40)})}}),s=this.outerWrapper.querySelectorAll(".draad-card--infowindow"),a=L.layerGroup(),o=0;s.forEach(l=>{let r=l.offsetHeight;r>o&&(o=r),this.addMarker(l).addTo(a)}),this.layers.locations=a,this.layers.locations.addTo(t);let c=parseInt(getComputedStyle(document.documentElement).fontSize);if(e.style.minHeight=o/c+3+"rem",document.getElementById(e.id+"-borders")){let l=document.getElementById(e.id+"-borders").dataset.draadGeojson;fetch(l).then(r=>r.json()).then(r=>{let n=this.addData(r);this.layers.borders=n,this.layers.borders.addTo(t)})}if(document.getElementById(e.id+"-geojson")){let l=document.getElementById(e.id+"-geojson").dataset.draadGeojson;fetch(l).then(r=>r.json()).then(r=>{let n=document.getElementById(e.id+"-geojson").dataset.draadMarker,u=document.getElementById(e.id+"-geojson").dataset.draadMarkerActive,p=this.addData(r,n,u);this.layers.geojson=p,this.layers.geojson.addTo(t)})}if(document.getElementById(e.id+"-gps")){let r=function(n){console.warn(`ERROR(${n.code}): ${n.message}`)};console.log("Show GPS location");let l={enableHighAccuracy:!0,timeout:5e3,maximumAge:0};var d=n=>{let u=n.coords,p=L.layerGroup();L.marker([parseFloat(u.latitude),parseFloat(u.longitude)],{icon:this.markerStyles.gps,riseOnHover:!1,alt:"Your location"}).addTo(p),this.layers.userLocation=p,this.layers.userLocation.addTo(t)};navigator.geolocation.getCurrentPosition(d,r,l)}this.outerWrapper.addEventListener("keypress",l=>{l.key==="Enter"&&(n=>{let u=new MouseEvent("click",{bubbles:!0,cancelable:!0,view:window}),p=!n.dispatchEvent(u)})(l.target)}),this.map.addLayer(t);let h=this.outerWrapper.querySelector(".draad-search");h&&(this.searchInput=h.querySelector(".draad-search__input"),this.searchSubmit=h.querySelector(".draad-search__submit"),this.searchHandler());let i=this.outerWrapper.querySelector(".draad-maps__instructions");i&&(i.addEventListener("click",()=>i.remove()),i.addEventListener("touchstart",()=>i.remove()))}createMap=()=>{let e=this.mapNode.dataset.draadCenter.split("/");this.center=[parseFloat(e[1]),parseFloat(e[2])],this.zoom=parseInt(e[0]);let t=L.map(this.mapNode.id,{dragging:!L.Browser.mobile,tap:!L.Browser.mobile,scrollWheelZoom:!1}).setView(this.center,this.zoom);return L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:16,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(t),t.removeControl(t.zoomControl),L.control.zoom({position:"bottomleft",zoomInText:'<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g><path d="M10 4.16602V15.8327" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.16602 10H15.8327" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g></svg>',zoomInTitle:"Zoom in",zoomOutText:'<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g><path d="M4.16602 10H15.8327" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g></svg>',zoomOutTitle:"Zoom out"}).addTo(t),t};addMarker=e=>{let t=e.dataset.draadCenter.split("/").map(parseFloat),s=L.marker(t,{icon:this.markerStyles.primary,riseOnHover:!0,alt:e.querySelector(".draad-card__title").textContent});return s.selected=!1,s.locationTrap=new g(e),this.markerHandler(s,e),s};markerHandler=(e,t=null,s=null,a=null)=>{let o=this,c=t?t.querySelector(".draad-card__close"):null;c&&c.addEventListener("click",d=>{e.locationTrap.active=!1,this.markerSetState(e,"default",s,a),e.selected=!1,e.icon&&e.icon.focus(),t.classList.remove("draad-infowindow--active"),t.setAttribute("aria-hidden","true"),t.setAttribute("hidden","")}),e.on("click",d=>{t?(t.closest(".draad-maps__wrapper").querySelectorAll(".draad-card--infowindow").forEach(i=>{i.classList.remove("draad-card--active"),i.setAttribute("aria-hidden","true"),i.setAttribute("hidden","")}),this.layers.locations.eachLayer(i=>{i.selected===!0&&(this.markerSetState(i,"default"),i.selected=!1)}),e.selected===!0?(e.locationTrap.active=!1,t.classList.remove("draad-card--active"),t.setAttribute("aria-hidden","true"),t.setAttribute("hidden",""),e.icon&&e.icon.focus()):(t.classList.add("draad-card--active"),t.setAttribute("aria-hidden","false"),t.removeAttribute("hidden"),e.locationTrap.active=!0,t.querySelector(".draad-card__close").focus())):e.openPopup(),this.markerSetState(e,e.selected?"default":"active",s,a),e.selected=!e.selected}),e.on("popupclose",d=>{this.markerSetState(e,"default",s,a),e.selected=!1,t&&(e.locationTrap.active=!1,t.classList.remove("draad-card--active"),t.setAttribute("aria-hidden","true"),t.setAttribute("hidden",""),e.icon&&e.icon.focus())})};markerSetState=(e,t,s=null,a=null)=>{switch(t){case"default":s?e.setIcon(this.getLeafletIcon({iconUrl:s})):e.setIcon(this.markerStyles.primary);break;case"active":a?e.setIcon(this.getLeafletIcon({iconUrl:a})):e.setIcon(this.markerStyles.active);break;case"hover":a?e.setIcon(this.getLeafletIcon({iconUrl:a})):e.setIcon(this.markerStyles.hover);break;case"focus":a?e.setIcon(this.getLeafletIcon({iconUrl:a})):e.setIcon(this.markerStyles.focus);break}};addData=(e,t=null,s=null)=>{let a=L.geoJSON(e);return a.getLayers()?.forEach(o=>{o.bindPopup(o.feature.properties.name),typeof o.setStyle=="function"&&(o.setStyle(this.borderStyles.default),o.options.alt=o.feature.properties.name,o.selected=!1,this.dataHandler(o)),typeof o.setIcon=="function"&&(t?o.setIcon(this.getLeafletIcon({iconUrl:t})):o.setIcon(this.markerStyles.primary),o.options.alt=o.feature.properties.name,o.selected=!1,this.markerHandler(o,null,t,s))}),a};dataHandler=e=>{let t=this;e.on("click",s=>{this.dataSetState(e,"active"),this.map.flyToBounds(e.getBounds(),{padding:[0,0]})}),e.on("popupclose",s=>this.dataSetState(e,"default"))};dataSetState=(e,t)=>{switch(t){case"default":e.setStyle(this.borderStyles.default);break;case"active":e.setStyle(this.borderStyles.highlight);break;case"hover":e.setStyle(this.borderStyles.hover);break;case"focus":e.setStyle(this.borderStyles.focus);break}};searchHandler=()=>{let e=document.getElementById(this.searchInput.getAttribute("list"));this.searchInput.addEventListener("keyup",w(()=>{fetch(`https://nominatim.openstreetmap.org/search?&q=Den+Haag+${this.searchInput.value}&layer=address,manmade,poi&polygon_geojson=1&countrycodes=nl&format=json&addressdetails=1&limit=10`).then(t=>t.json()).then(t=>{e.innerHTML="",t.forEach(s=>{let a=document.createElement("option");a.value=s.display_name,e.appendChild(a)})})},750)),this.searchSubmit.addEventListener("click",t=>{t.preventDefault(),this.removeSearchMarker(),fetch(`https://nominatim.openstreetmap.org/search?&q=Den+Haag+${this.searchInput.value}&layer=address,manmade,poi&polygon_geojson=1&countrycodes=nl&format=geojson&addressdetails=1&limit=1`).then(s=>s.json()).then(s=>{s.features.length!==0&&this.addSearchMarker(s)}).then(()=>this.sortLocations())})};addSearchMarker=e=>{let t=L.layerGroup();t.addLayer(L.geoJson(e,{style:{color:this.colors.accent,weight:3,fillColor:this.colors.accent,fillOpacity:.3},onEachFeature:(s,a)=>{typeof a.setIcon=="function"?a.setIcon(this.markerStyles.search):typeof a.setStyle=="function"&&a.setStyle(this.borderStyles.search)}})),this.map.flyToBounds(L.geoJson(e).getBounds(),{padding:[50,50]}),t.addTo(this.map),this.layers.search=t};removeSearchMarker=()=>{this.layers.search&&(this.map.removeLayer(this.layers.search),delete this.layers.search)};sortLocations=()=>{let e=this.mapNode.closest(".draad-maps__wrapper"),t=e.querySelector(".draad-grid"),s=e.querySelectorAll(".draad-card:not(.draad-card--infowindow)");if(!this.layers.search)return;let a=this.layers.search.getLayers()[0].getBounds().getCenter(),o=[...s].sort((c,d)=>{let h=c.getAttribute("data-draad-center").split("/").map(Number),i=d.getAttribute("data-draad-center").split("/").map(Number),l=this.map.distance(a,h),r=this.map.distance(a,i);return l-r});t.innerHTML="",o.forEach(c=>t.appendChild(c))};node=null;map=null;center=null;zoom=null;outerWrapper=null;layers=[];getLeafletIcon=e=>L.icon({iconUrl:"",iconSize:[39.2,51.2],iconAnchor:[19.6,51.2],popupAnchor:[-3,-76],...e});markerStyles={primary:this.getLeafletIcon({iconUrl:"/wp-content/plugins/draad-kaarten/dist/images/marker.png"}),hover:this.getLeafletIcon({iconUrl:"/wp-content/plugins/draad-kaarten/dist/images/marker-hover.png"}),active:this.getLeafletIcon({iconUrl:"/wp-content/plugins/draad-kaarten/dist/images/marker-active.png"}),search:this.getLeafletIcon({iconUrl:"/wp-content/plugins/draad-kaarten/dist/images/marker-search.png"}),gps:this.getLeafletIcon({iconUrl:"/wp-content/plugins/draad-kaarten/dist/images/marker-gps.png",iconSize:[48,48],iconAnchor:[24,24]})};documentComputedStyles=getComputedStyle(document.documentElement);colors={primary:this.documentComputedStyles.getPropertyValue("--dk__clr-primary")||"#248641",secondary:this.documentComputedStyles.getPropertyValue("--dk__clr-secondary")||"#7D6200",accent:this.documentComputedStyles.getPropertyValue("--dk__clr-accent")||"#1261A3"};borderStyles={default:{color:this.colors.primary,weight:4,dashArray:"8, 8",fillColor:this.colors.primary,fillOpacity:0},focus:{color:this.colors.secondary,weight:4,dashArray:"0, 0",fillColor:this.colors.primary,fillOpacity:.15},hover:{color:this.colors.primary,weight:4,dashArray:"0, 0",fillColor:this.colors.primary,fillOpacity:.15},highlight:{color:this.colors.primary,weight:4,dashArray:"0, 0",fillColor:this.colors.primary,fillOpacity:.3},search:{color:this.colors.accent,weight:4,dashArray:"0, 0",fillColor:this.colors.accent,fillOpacity:.3}}};function w(m,e){let t;return(...s)=>{clearTimeout(t),t=setTimeout(()=>{m.apply(this,s)},e)}}})();
//# sourceMappingURL=draad-maps.js.map
