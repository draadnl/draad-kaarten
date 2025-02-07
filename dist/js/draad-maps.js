(()=>{var M=class{constructor(e){this.rootEl=e}rootEl=null;_active=!1;firstFocusableElement=null;lastFocusableElement=null;get active(){return this._active}set active(e){typeof e=="boolean"&&(this._active=e,this._active?this.activate():this.deactivate())}activate(){if(!this._active)return;let e=Array.from(this.rootEl.querySelectorAll("a[href], button, textarea, input, select, summary, [tabindex]"));if(e.filter(s=>s.getAttribute("tabindex")!=="-1"),e.length===0)return;let t=e.filter(s=>s.offsetParent!==null);this.firstFocusableElement=t[0],this.lastFocusableElement=t[t.length-1],this.rootEl.addEventListener("keydown",s=>{s.key==="Tab"&&(!s.shiftKey&&document.activeElement===this.lastFocusableElement?(s.preventDefault(),this.firstFocusableElement.focus()):s.shiftKey&&document.activeElement===this.firstFocusableElement&&(s.preventDefault(),this.lastFocusableElement.focus()))})}deactivate(){this.rootEl.removeEventListener("keydown",()=>{}),this.firstFocusableElement=null,this.lastFocusableElement=null}},E=M;var C={},J=new Event("draadMapsLoaded");function P(){C.maps=[],document.querySelectorAll(".draad-maps").forEach(e=>{let t=new _(e);C.maps.push(t),document.dispatchEvent(J)})}document.addEventListener("DOMContentLoaded",P);var _=class{node=null;map=null;center=null;zoom=null;outerWrapper=null;layers=[];colors={};constructor(e){if(!e)throw new Error("Draad Maps: No map node provided.");this.mapNode=e,this.outerWrapper=e.closest(".draad-maps__wrapper"),this.map=this.createMap();let t=getComputedStyle(document.documentElement);this.colors={primary:t.getPropertyValue("--dk__clr-primary")||"#248641",secondary:t.getPropertyValue("--dk__clr-secondary")||"#7D6200",accent:t.getPropertyValue("--dk__clr-accent")||"#1261A3"},this.cluster=L.markerClusterGroup({showCoverageOnHover:!1,iconCreateFunction:i=>{let d=i.getChildCount(),p=" marker-cluster-large",h=56;return d<10?(p="marker-cluster-small",h=40):d<100&&(p+="marker-cluster-medium",h=48),new L.DivIcon({html:'<div class="marker-cluster"><span>'+d+' <span aria-label="markers"></span></span></div>',className:p,iconSize:new L.Point(h,h)})}});let s=this.outerWrapper.querySelectorAll(".draad-card--infowindow"),a=L.layerGroup(),o=0;s?.forEach(i=>{let d=i.offsetHeight;d>o&&(o=d),this.addMarker(i).addTo(a)}),this.layers.locations=a,this.layers.locations.addTo(this.cluster);let r=parseInt(getComputedStyle(document.documentElement).fontSize);if(e.style.minHeight=Math.round(o/r)+3+"rem",this.outerWrapper.addEventListener("keypress",i=>{i.key==="Enter"&&(p=>{let h=new MouseEvent("click",{bubbles:!0,cancelable:!0,view:window});p.dispatchEvent(h)})(i.target)}),document.getElementById(e.id+"-gps")){let p=function(h){console.warn(`ERROR(${h.code}): ${h.message}`)},i={enableHighAccuracy:!0,timeout:5e3,maximumAge:0},d=h=>{let f=h.coords,y=L.layerGroup();L.marker([parseFloat(f.latitude),parseFloat(f.longitude)],{icon:this.getLeafletIcon({iconUrl:`${draadMapsConfig.pluginDir}/dist/images/marker-gps.png`,iconSize:[48,48],iconAnchor:[24,24]}),riseOnHover:!1,alt:"Your location"}).addTo(y),this.layers.userLocation=y,this.layers.userLocation.addTo(this.cluster)};navigator.geolocation.getCurrentPosition(d,p,i)}let n=document.querySelectorAll(".draad-maps__dataset");n.length&&(n.forEach(i=>{let d=i.dataset.draadGeojson,p=i.dataset.datasetName;if(document.getElementById(i.dataset.draadGeojsonTarget)){let h=JSON.parse(document.getElementById(i.dataset.draadGeojsonTarget).text),f=h;f=this.jsonToGeoJSON(h);let y=this.addData(f,i);this.layers[p]=y,this.layers[p].addTo(this.cluster)}else if(d){let h=i.querySelector("input");fetch(d).then(f=>f.json()).then(f=>{let y=f;y=this.jsonToGeoJSON(f);let v=this.addData(y,i);this.layers[p]=v,this.layers[p].addTo(this.cluster)})}}),this.legendNode=this.outerWrapper.querySelector(".draad-maps__legend"),this.legendNode&&this.legendHandler()),this.map.addLayer(this.cluster);let u=this.outerWrapper.querySelector(".draad-search");u&&(this.searchInput=u.querySelector(".draad-search__input"),this.searchSubmit=u.querySelector(".draad-search__submit"),this.searchHandler());let m=this.outerWrapper.querySelector(".draad-maps__instructions");m&&(m.addEventListener("click",()=>m.remove()),m.addEventListener("touchstart",()=>m.remove()))}getLeafletIcon=e=>L.icon({iconUrl:"",iconSize:[39.2,51.2],iconAnchor:[19.6,51.2],popupAnchor:[-3,-76],...e});isRdCoordinates(e,t){return typeof e!="number"||typeof t!="number"?(console.error("Draad_Map.isRdCoordinates(): coordinates not valid",e,t),!1):e>0&&e<3e5&&t>3e5&&t<62e4}rdToWgs84=(e,t)=>{if(typeof e!="number"||typeof t!="number")return console.error("Draad_Map.rdToWgs84(): coordinates not valid"),!1;e<1e3&&(e*=1e3),t<1e3&&(t*=1e3);let s=155e3,a=463e3,o=52.156160556,r=5.387638889,n=3236.0331637,u=5261.3028966,m=-32.5915821,i=105.9780241,d=-.2472814,p=2.4576469,h=-.8501341,f=-.8192156,y=-.0655238,v=-.0560092,T=-.0171137,I=.0560089,A=.0052771,N=-.0025614,H=-3859e-7,O=.001277,D=3314e-7,j=2574e-7,F=371e-7,q=-973e-7,G=143e-7,W=293e-7,x=-9e-6,z=291e-7,c=(e-s)*Math.pow(10,-5),l=(t-a)*Math.pow(10,-5),b=n*l+m*Math.pow(c,2)+d*Math.pow(l,2)+h*Math.pow(c,2)*l+y*Math.pow(l,3);b+=A*Math.pow(c,4)+T*Math.pow(c,2)*Math.pow(l,2)+F*Math.pow(l,4)+D*Math.pow(c,4)*l,b+=H*Math.pow(c,2)*Math.pow(l,3)+G*Math.pow(c,4)*Math.pow(l,2)+x*Math.pow(c,2)*Math.pow(l,4);let w=o+b/3600,S=u*c+i*c*l+f*Math.pow(c,3)+p*c*Math.pow(l,2)+v*Math.pow(c,3)*l;S+=I*c*Math.pow(l,3)+j*Math.pow(c,5)+N*Math.pow(c,3)*Math.pow(l,2)+O*c*Math.pow(l,4),S+=W*Math.pow(c,5)*l+q*Math.pow(c,3)*Math.pow(l,3)+z*c*Math.pow(l,5);let k=r+S/3600,B=w+(-96.862-11.714*(w-52)-.125*(k-5))/1e5,U=k+(-37.902+.329*(w-52)-14.667*(k-5))/1e5;return{lat:B,lon:U}};parseGeometry=(e,t)=>{let s,a,o,r;if(typeof t.properties<"u"&&typeof t.properties.wkb_geometry<"u")return t.properties.wkb_geometry;if(typeof t.wkb_geometry<"u")return t.wkb_geometry;if(!(typeof e>"u"))switch(e.type){case"Point":return o=e.coordinates[0],r=e.coordinates[1],s=[o,r],this.isRdCoordinates(o,r)&&(a=this.rdToWgs84(o,r),s=[a.lon,a.lat]),{type:"Point",coordinates:s};break;case"MultiPoint":return s=e.coordinates.map(n=>(o=n[0],r=n[1],s=[o,r],this.isRdCoordinates(o,r)&&(a=this.rdToWgs84(o,r),s=[a.lon,a.lat]),s)),{type:"Point",coordinates:s[0]};break;case"Polygon":return s=e.coordinates[0].map(n=>(o=n[0],r=n[1],s=[o,r],this.isRdCoordinates(o,r)?(a=this.rdToWgs84(o,r),[a.lat,a.lon]):s)),{type:"Polygon",coordinates:[s]};break;default:console.error("Not a valid geometry type",e,t);break}};jsonToGeoJSON=e=>{let t=typeof e.result=="object"?e.result.records:e.features;return typeof t[0].properties<"u"&&typeof t[0].properties.wkb_geometry<"u"?e:{type:"FeatureCollection",features:t.map(s=>({type:"Feature",geometry:this.parseGeometry(s.geometry,s),properties:typeof s.properties<"u"?{...s.properties}:{...s}}))}};createMap=()=>{let e=this.mapNode.dataset.draadCenter.split("/");this.center=[parseFloat(e[1]),parseFloat(e[2])],this.zoom=parseInt(e[0]);let t=L.map(this.mapNode.id,{dragging:!L.Browser.mobile,tap:!L.Browser.mobile,scrollWheelZoom:!1}).setView(this.center,this.zoom);return L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:16,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(t),t.removeControl(t.zoomControl),L.control.zoom({position:"bottomleft",zoomInText:'<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g><path d="M10 4.16602V15.8327" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.16602 10H15.8327" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g></svg>',zoomInTitle:"Zoom in",zoomOutText:'<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g><path d="M4.16602 10H15.8327" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g></svg>',zoomOutTitle:"Zoom out"}).addTo(t),t};addMarker=e=>{let t=e.dataset.draadCenter.split("/").map(parseFloat),s=L.marker(t,{riseOnHover:!0,alt:e.querySelector(".draad-card__title")?.textContent});return s._styles={default:e.dataset.marker!==""?this.getLeafletIcon({iconUrl:e.dataset.marker}):this.getLeafletIcon({iconUrl:`${draadMapsConfig.pluginDir}/dist/images/marker.png`}),hover:e.dataset.markerHover!==""?this.getLeafletIcon({iconUrl:e.dataset.markerHover}):this.getLeafletIcon({iconUrl:`${draadMapsConfig.pluginDir}/dist/images/marker-hover.png`}),active:e.dataset.markerActive!==""?this.getLeafletIcon({iconUrl:e.dataset.markerActive}):this.getLeafletIcon({iconUrl:`${draadMapsConfig.pluginDir}/dist/images/marker-active.png`})},s.setIcon(s._styles.default),s.selected=!1,s.locationTrap=new E(e),this.markerHandler(s,e),s};markerHandler=(e,t=null)=>{let s=this,a=t?t.querySelector(".draad-card__close"):null;a&&a.addEventListener("click",o=>{e.locationTrap.active=!1,this.markerSetState(e,"default"),e.selected=!1,e.icon&&e.icon.focus(),t.classList.remove("draad-infowindow--active"),t.setAttribute("aria-hidden","true"),t.setAttribute("hidden","")}),e.on("click",o=>{t&&t.querySelector(".draad-card__content")?.textContent?(t.closest(".draad-maps__wrapper").querySelectorAll(".draad-card--infowindow").forEach(n=>{n.classList.remove("draad-card--active"),n.setAttribute("aria-hidden","true"),n.setAttribute("hidden","")}),this.layers.locations.eachLayer(n=>{n.selected===!0&&(this.markerSetState(n,"default"),n.selected=!1)}),e.selected===!0?(e.locationTrap.active=!1,t.classList.remove("draad-card--active"),t.setAttribute("aria-hidden","true"),t.setAttribute("hidden",""),e.icon&&e.icon.focus()):(t.classList.add("draad-card--active"),t.setAttribute("aria-hidden","false"),t.removeAttribute("hidden"),e.locationTrap.active=!0,t.querySelector(".draad-card__close").focus())):e.openPopup(),this.markerSetState(e,e.selected?"default":"active"),e.selected=!e.selected}),e.on("popupclose",o=>{this.markerSetState(e,"default"),e.selected=!1,t&&(e.locationTrap.active=!1,t.classList.remove("draad-card--active"),t.setAttribute("aria-hidden","true"),t.setAttribute("hidden",""),e.icon&&e.icon.focus())})};markerSetState=(e,t)=>{switch(t){case"active":case"focus":e.setIcon(e._styles.active);break;case"hover":e.setIcon(e._styles.hover);break;default:e.setIcon(e._styles.default);break}};addData=(e,t)=>{let s=L.geoJSON(e);return s.getLayers()?.forEach(a=>{a._styles={default:typeof t<"u"&&t.dataset.marker!==""?this.getLeafletIcon({iconUrl:t.dataset.marker}):this.getLeafletIcon({iconUrl:`${draadMapsConfig.pluginDir}/dist/images/marker.png`}),hover:typeof t<"u"&&t.dataset.markerHover!==""?this.getLeafletIcon({iconUrl:t.dataset.markerHover}):this.getLeafletIcon({iconUrl:`${draadMapsConfig.pluginDir}/dist/images/marker-hover.png`}),active:typeof t<"u"&&t.dataset.markerActive!==""?this.getLeafletIcon({iconUrl:t.dataset.markerActive}):this.getLeafletIcon({iconUrl:`${draadMapsConfig.pluginDir}/dist/images/marker-active.png`})},a._style={color:typeof t<"u"&&t.dataset.shapeColor!==""?t.dataset.shapeColor:this.colors.primary,weight:typeof t<"u"&&t.dataset.shapeWidth!==""?t.dataset.shapeWidth:4,dashArray:typeof t<"u"&&t.dataset.shapeStyle==="solid"?"0, 0":"8, 8",fillColor:typeof t<"u"&&t.dataset.shapeColor!==""?t.dataset.shapeColor:this.colors.primary,fillOpacity:0},a.feature.properties.titel&&a.bindPopup(a.feature.properties.titel),typeof a.setStyle=="function"&&(a.setStyle(a._style),a.options.alt=a.feature.properties?.name,a.options.title=a.feature.properties?.titel,a.selected=!1,this.dataHandler(a)),typeof a.setIcon=="function"&&(a.setIcon(a._styles.default),a.options.alt=a.feature.properties?.name,a.options.title=a.feature.properties?.titel,a.selected=!1,this.markerHandler(a,null))}),s};dataHandler=e=>{let t=this;e.on("click",s=>{this.dataSetState(e,"active"),this.map.flyToBounds(e.getBounds(),{padding:[0,0]})}),e.on("popupclose",s=>this.dataSetState(e,"default"))};dataSetState=(e,t)=>{switch(t){case"active":let s=e._style;s.fillOpacity=.15,e.setStyle(s);break;case"hover":let a=e._style;a.fillOpacity=.15,e.setStyle(a);break;case"focus":let o=e._style;o.fillOpacity=.15,e.setStyle(o);break;default:let r=e._style;r.fillOpacity=0,e.setStyle(r);break}};legendHandler=()=>{this.legendNode.querySelectorAll("input")?.forEach(t=>{let s=t.closest(".draad-maps__dataset"),a=s.dataset.datasetName;t.addEventListener("change",o=>{if(t.checked){let r=s.dataset.draadGeojson;if(document.getElementById(s.dataset.draadGeojsonTarget)){let n=JSON.parse(document.getElementById(s.dataset.draadGeojsonTarget).text),u=null;typeof n.type>"u"||n.type!=="FeatureCollection"?u=this.jsonToGeoJSON(n):u=this.jsonToGeoJSON(n);let m=this.addData(u,s);this.layers[a]=m,this.layers[a].addTo(this.cluster)}else if(r){let n=s.querySelector("input");fetch(r).then(u=>u.json()).then(u=>{let m=u;m=this.jsonToGeoJSON(u);let i=s.dataset.draadMarker,d=s.dataset.draadMarkerActive,p=this.addData(m,s);this.layers[a]=p,this.layers[a].addTo(this.cluster)})}}else{if(!this.layers[a])return;this.cluster.removeLayer(this.layers[a]),delete this.layers[a]}})})};searchHandler=()=>{let e=document.getElementById(this.searchInput.getAttribute("list"));this.searchInput.addEventListener("keyup",$(()=>{fetch(`https://nominatim.openstreetmap.org/search?&q=Den+Haag+${this.searchInput.value}&layer=address,manmade,poi&polygon_geojson=1&countrycodes=nl&format=json&addressdetails=1&accept-language=nl-NL&limit=10`).then(t=>t.json()).then(t=>{e.innerHTML="",t.forEach(s=>{let a=document.createElement("option");a.value=s.display_name,e.appendChild(a)})})},750)),this.searchSubmit.addEventListener("click",t=>{t.preventDefault(),this.removeSearchMarker(),fetch(`https://nominatim.openstreetmap.org/search?&q=${encodeURIComponent(this.searchInput.value)}&layer=address,manmade,poi&polygon_geojson=1&countrycodes=nl&format=geojson&addressdetails=1&accept-language=nl-NL&limit=50`).then(s=>s.json()).then(s=>{let a=document.getElementById("draad-search-notice");if(a&&(a.innerHTML=""),s.features=s.features.filter(o=>o.properties.address.municipality==="Den Haag"),s.features.length===0){a&&(a.innerHTML="<p>Geen resultaten gevonden</p>");return}this.addSearchMarker(s.features)}).then(()=>this.sortLocations())})};addSearchMarker=e=>{let t=L.layerGroup();t.addLayer(L.geoJson(e,{style:{color:this.colors.accent,weight:3,fillColor:this.colors.accent,fillOpacity:.3},onEachFeature:(s,a)=>{typeof a.setIcon=="function"?a.setIcon(this.getLeafletIcon({iconUrl:`${draadMapsConfig.pluginDir}/dist/images/marker-search.png`})):typeof a.setStyle=="function"&&a.setStyle({color:this.colors.accent,weight:4,dashArray:"0, 0",fillColor:this.colors.accent,fillOpacity:.3})}})),this.map.flyToBounds(L.geoJson(e).getBounds(),{padding:[50,50]}),t.addTo(this.map),this.layers.search=t};removeSearchMarker=()=>{this.layers.search&&(this.map.removeLayer(this.layers.search),delete this.layers.search)};sortLocations=()=>{let e=this.mapNode.closest(".draad-maps__wrapper"),t=e.querySelector(".draad-grid"),s=e.querySelectorAll(".draad-card:not(.draad-card--infowindow)");if(!this.layers.search)return;let a=this.layers.search.getLayers()[0].getBounds().getCenter(),o=[...s].sort((r,n)=>{let u=r.getAttribute("data-draad-center").split("/").map(Number),m=n.getAttribute("data-draad-center").split("/").map(Number),i=this.map.distance(a,u),d=this.map.distance(a,m);return i-d});t.innerHTML="",o.forEach(r=>t.appendChild(r))}};function $(g,e){let t;return(...s)=>{clearTimeout(t),t=setTimeout(()=>{g.apply(this,s)},e)}}})();
//# sourceMappingURL=draad-maps.js.map
