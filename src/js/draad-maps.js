import Draad_Focus_Trap from "./focusTrap.js";

`use strict`;

const draad = {};
const mapEvent = new Event("draadMapsLoaded");

/**
 * Initialize maps
 */
function draadMapsInit() {
	draad.maps = [];
	const nodes = document.querySelectorAll(".draad-maps");
	nodes.forEach((node) => {
		// initialize map
		const map = new Draad_Map(node);

		// save map to draad.maps
		draad.maps.push(map);

		document.dispatchEvent(mapEvent);
	});
}

document.addEventListener("DOMContentLoaded", draadMapsInit);

class Draad_Map {

	node = null;

	map = null;

	center = null;

	zoom = null;

	outerWrapper = null;

	layers = {};

	colors = {};

	/**
	 *  Constructor
	 *
	 * @param {HTMLElement} node The HTML element that contains the map.
	 */
	constructor(node) {

		if (!node) {
			throw new Error("Draad Maps: No map node provided.");
		}

		this.mapNode = node;
		this.outerWrapper = node.closest(".draad-maps__wrapper");
		this.map = this.createMap();

		const documentComputedStyles = getComputedStyle( document.documentElement );
		this.colors = {
			primary: documentComputedStyles.getPropertyValue("--dk__clr-primary" ) || "#248641",
			secondary: documentComputedStyles.getPropertyValue( "--dk__clr-secondary" ) || "#7D6200",
			accent: documentComputedStyles.getPropertyValue("--dk__clr-accent" ) || "#1261A3"
		};

		/**
		 * Add clusters
		 */
		this.cluster = L.markerClusterGroup(
			{
				showCoverageOnHover: false,
				iconCreateFunction: (cluster) => {

					const childCount = cluster.getChildCount();
					let c = " marker-cluster-large";
					let size = 56;

					if (childCount < 10) {
						c = "marker-cluster-small";
						size = 40;
					} else if (childCount < 100) {
						c += "marker-cluster-medium";
						size = 48;
					}

					return new L.DivIcon(
						{
							html:
								'<div class="marker-cluster"><span>' +
								childCount +
								' <span aria-label="markers"></span>' +
								"</span></div>",
							className: c,
							iconSize: new L.Point(size, size)
						}
					);

				}
			}
		);

		/**
		 * Add manually created markers
		 */
		this.loadFeatures( 'draad-maps-location' );

		/**
		 * Add datasets
		 */
		const datasets = Array.from( this.outerWrapper.querySelectorAll( '.draad-maps__dataset' ) ).map( dataset => {
			return dataset.dataset.datasetName;
		});
		datasets?.forEach( dataset => {
			this.loadFeatures( dataset );
		});

		this.legendNode = this.outerWrapper.querySelector( ".draad-maps__legend" );
		if (this.legendNode) {
			this.legendHandler();
		}

		/**
		 * Add support to open infowindows with enter key
		 */
		this.outerWrapper.addEventListener("keypress", (e) => {
			if (e.key === "Enter") {
				const simulateClick = (elem) => {
					// Create our event (with options)
					const evt = new MouseEvent("click", {
						bubbles: true,
						cancelable: true,
						view: window
					});

					elem.dispatchEvent(evt);
				};

				simulateClick(e.target);
			}
		});

		/**
		 * Show current GPS location of user
		 * 
		 * !! Not working
		 */
		if (document.getElementById(node.id + "-gps")) {
			const options = {
				enableHighAccuracy: true,
				timeout: 5000,
				maximumAge: 0
			};

			const success = (pos) => {
				const crd = pos.coords;

				const userLocation = L.layerGroup();
				const marker = L.marker(
					[parseFloat(crd.latitude), parseFloat(crd.longitude)],
					{
						icon: this.getLeafletIcon({
							iconUrl: `${draadMapsConfig.pluginDir}/dist/images/marker-gps.png`,
							iconSize: [48, 48],
							iconAnchor: [24, 24]
						}),
						riseOnHover: false,
						alt: "Your location"
					}
				);
				marker.addTo(userLocation);

				this.layers.userLocation = userLocation;
				this.layers.userLocation.addTo(this.cluster);
			};

			function error(err) {
				console.warn(`ERROR(${err.code}): ${err.message}`);
			}

			navigator.geolocation.getCurrentPosition(success, error, options);
		}

		/**
		 * Add clusters to map
		 */
		this.map.addLayer(this.cluster);

		/**
		 * Add search
		 */
		const search = this.outerWrapper.querySelector(".draad-search");
		if (search) {
			this.searchInput = search.querySelector(".draad-search__input");
			this.searchSubmit = search.querySelector(".draad-search__submit");
			this.searchHandler();
		}

		/**
		 * Remove touch instructions after interaction
		 */
		const instructions = this.outerWrapper.querySelector(
			".draad-maps__instructions"
		);
		if (instructions) {
			instructions.addEventListener("click", () => instructions.remove());
			instructions.addEventListener("touchstart", () =>
				instructions.remove()
			);
		}

	}
	
	/**
	 * Creates a new Leaflet map.
	 *
	 * @returns {object}
	 */
	createMap = () => {
		const center = this.mapNode.dataset.draadCenter.split("/");

		this.center = [parseFloat(center[1]), parseFloat(center[2])];
		this.zoom = parseInt(center[0]);

		const map = L.map(this.mapNode.id, {
			dragging: !L.Browser.mobile,
			tap: !L.Browser.mobile,
			scrollWheelZoom: false
		}).setView(this.center, this.zoom);

		// Tile layer
		L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
			maxZoom: 20,
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		// remove zoom control
		map.removeControl(map.zoomControl);

		L.control
			.zoom({
				position: "bottomleft",
				zoomInText: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g><path d="M10 4.16602V15.8327" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.16602 10H15.8327" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g></svg>',
				zoomInTitle: "Zoom in",
				zoomOutText: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g><path d="M4.16602 10H15.8327" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g></svg>',
				zoomOutTitle: "Zoom out"
			})
			.addTo(map);

		return map;
	};

	/**
	 * Add features found in the DOM to the map
	 */
	loadFeatures( datasetName ) {

		const features = this.outerWrapper.querySelectorAll( '.draad-card--infowindow[data-dataset-name="' + datasetName + '"]' );

		if ( features.length === 0 ) {
			return;
		}

		let featureCollection = {
			"type": "FeatureCollection",
			"features": []
		};

		this.layers[datasetName] = L.layerGroup();
		features.forEach((featureNode) => {

			const feature = JSON.parse( featureNode.dataset.draadFeature );
			feature.properties.infowindow = featureNode.id;
			feature.properties.datasetName = featureNode.dataset.datasetName;
			featureCollection.features.push( feature );

		});

		this.layers[datasetName] = L.geoJSON( featureCollection );
		this.layers[datasetName].getLayers()?.forEach((layer) => {
			
			const featureNode = document.getElementById( layer.feature.properties.infowindow );
			
			layer._styles = {
				default:
					typeof featureNode !== "undefined" && featureNode.dataset.marker !== ""
						? this.getLeafletIcon({ iconUrl: featureNode.dataset.marker })
						: this.getLeafletIcon({
								iconUrl: `${draadMapsConfig.pluginDir}/dist/images/marker.png`
							}),
				hover:
					typeof featureNode !== "undefined" &&
					featureNode.dataset.markerHover !== ""
						? this.getLeafletIcon({
								iconUrl: featureNode.dataset.markerHover
							})
						: this.getLeafletIcon({
								iconUrl: `${draadMapsConfig.pluginDir}/dist/images/marker-hover.png`
							}),
				active:
					typeof featureNode !== "undefined" &&
					featureNode.dataset.markerActive !== ""
						? this.getLeafletIcon({
								iconUrl: featureNode.dataset.markerActive
							})
						: this.getLeafletIcon({
								iconUrl: `${draadMapsConfig.pluginDir}/dist/images/marker-active.png`
							})
			};

			layer._style = {
				color:
					typeof featureNode !== "undefined" &&
					featureNode.dataset.shapeColor !== ""
						? featureNode.dataset.shapeColor
						: this.colors.primary,
				weight:
					typeof featureNode !== "undefined" &&
					featureNode.dataset.shapeWidth !== ""
						? featureNode.dataset.shapeWidth
						: 4,
				dashArray:
					typeof featureNode !== "undefined" &&
					featureNode.dataset.shapeStyle === "solid"
						? "0, 0"
						: "8, 8",
				fillColor:
					typeof featureNode !== "undefined" &&
					featureNode.dataset.shapeColor !== ""
						? featureNode.dataset.shapeColor
						: this.colors.primary,
				fillOpacity: 0
			};

			layer.locationTrap = new Draad_Focus_Trap(featureNode);

			// set style
			if (typeof layer.setIcon === "function") {
				layer.setIcon(layer._styles.default);
			} else if (typeof layer.setStyle === "function") {
				layer.setStyle(layer._style);
			}
			layer.selected = false;
			this.markerHandler(layer, featureNode);

		});

		this.layers[datasetName].addTo( this.cluster );
	}

	/**
	 * Changes the state of a GeoJSON feature.
	 *
	 * @param {object} feature The GeoJSON feature.
	 * @param {string} state The state of the feature.
	 */
	dataSetState = (feature, state) => {
		const style = feature._style;
		switch (state) {
			case "active":
			case "hover":
			case "focus":
				style.fillOpacity = 0.15;
				break;
			default:
				style.fillOpacity = 0;
				break;
		}
		feature.setStyle(style);
	};

	/**
	 * Event handler for markers.
	 *
	 * @param {object} marker The marker object.
	 * @param {HTMLElement} location The infowindow.
	 */
	markerHandler = (layer, location = null) => {

		const close = location ? location.querySelector(".draad-card__close") : null;
		if (close) {
			close.addEventListener("click", (e) => {
				if (typeof layer.setIcon === "function") {
					layer.setIcon(layer._styles.default);
				} else if (typeof layer.setStyle === "function") {
					layer.setStyle(layer._style);
				}

				layer.selected = false;

				if (layer.icon) {
					layer.icon.focus();
				}

				location.classList.remove("draad-infowindow--active");
				location.setAttribute("aria-hidden", "true");
				location.setAttribute("hidden", "");
			});
		}

		layer.on("click", (e) => {

			if ( location ) {
				
				// close other infowindows
				const infowindows = this.outerWrapper.querySelectorAll(".draad-card--infowindow");
				infowindows.forEach((infowindow) => {
					infowindow.classList.remove("draad-card--active");
					infowindow.setAttribute("aria-hidden", "true");
					infowindow.setAttribute("hidden", "");
				});
				
				// update marker of other infowindows
				for (let layerGroupName in this.layers) {
					this.layers[layerGroupName].eachLayer((layer) => {
						if (layer.selected === true) {
							
							if ( typeof layer.setStyle === 'function' ) {
								this.dataSetState(layer, "default");
							}
							
							if ( typeof layer.setIcon === 'function' ) {
								this.markerSetState(layer, "default");
							}
							layer.locationTrap.active = false;
							layer.selected = false;
						}
					});
				}

				if (layer.selected === true) {
					location.classList.remove("draad-card--active");
					location.setAttribute("aria-hidden", "true");
					location.setAttribute("hidden", "");
					layer.locationTrap.active = false;

					if (marker.icon) {
						marker.icon.focus();
					}
				} else {
					location.classList.add("draad-card--active");
					location.setAttribute("aria-hidden", "false");
					location.removeAttribute("hidden");
					layer.locationTrap.active = true;

					const close = location.querySelector(".draad-card__close");
					close.focus();
				}
			} else {
				
				for (let key in this.layers) {
					this.layers[key].eachLayer( layer => {

						if ( typeof layer.setIcon === 'function' ) {
							this.markerSetState(layer, "default");
						} else if ( typeof layer.setStyle === 'function' ) {
							layer.setStyle(layer._style);
						}

						layer.selected = false;
						layer.locationTrap.active = false;
						layer.closePopup();

					} );
				}

				layer.openPopup();
			}

			if ( typeof layer.getLatLng === 'function' ) {
				this.map.panTo(layer.getLatLng());
			} else if ( typeof layer.getBounds === 'function' ) {
				this.map.flyToBounds(layer.getBounds(), { padding: [0, 0] });
			}
		});

		layer.on("popupclose", (e) => {
			this.markerSetState(layer, "default");
			layer.selected = false;

			if (location) {
				location.classList.remove("draad-card--active");
				location.setAttribute("aria-hidden", "true");
				location.setAttribute("hidden", "");

				if (layer.icon) {
					layer.icon.focus();
				}
			}
		});
	};

	/**
	 * Changes the state of a marker.
	 *
	 * @param {object} marker The marker object.
	 * @param {string} state The state of the marker.
	 */
	markerSetState = (marker, state) => {
		switch (state) {
			case "active":
			case "focus":
				marker.setIcon(marker._styles.active);
				break;

			case "hover":
				marker.setIcon(marker._styles.hover);
				break;

			default:
				marker.setIcon(marker._styles.default);
				break;
		}
	};

	/**
	 * Event handler for the search input.
	 *
	 * @return {void}
	 */
	searchHandler = () => {
		const autocomplete = document.getElementById(
			this.searchInput.getAttribute("list")
		);

		this.searchInput.addEventListener(
			"keyup",
			debounce(() => {
				// get posible locations from nominatim api
				fetch(
					`https://nominatim.openstreetmap.org/search?&q=Den+Haag+${this.searchInput.value}&layer=address,manmade,poi&polygon_geojson=1&countrycodes=nl&format=json&addressdetails=1&accept-language=nl-NL&limit=10`
				)
					.then((response) => response.json())
					.then((data) => {
						autocomplete.innerHTML = "";
						data.forEach((location) => {
							const option = document.createElement("option");
							option.value = location.display_name;
							autocomplete.appendChild(option);
						});
					});
			}, 750)
		);

		this.searchSubmit.addEventListener("click", (e) => {
			e.preventDefault();

			this.removeSearchMarker();

			// get posible locations from nominatim api
			fetch(
				`https://nominatim.openstreetmap.org/search?&q=${encodeURIComponent(this.searchInput.value)}&layer=address,manmade,poi&polygon_geojson=1&countrycodes=nl&format=geojson&addressdetails=1&accept-language=nl-NL&limit=50`
			)
				.then((response) => response.json())
				.then((data) => {
					const noticeNode = document.getElementById(
						"draad-search-notice"
					);

					if (!noticeNode) {
						return;
					}

					data.features = data.features.filter((feature) => {
						return (
							feature.properties.address.municipality ===
							"Den Haag"
						);
					});

					if (data.features.length === 0) {
						if (noticeNode) {
							noticeNode.innerHTML =
								"<p>Geen resultaten gevonden</p>";
						}

						return;
					}

					noticeNode.innerHTML = "";

					this.addSearchMarker(data.features);
				})
				.then(() => this.sortLocations());
		});
	};

	/**
	 * Adds a search marker to the map.
	 *
	 * @param {object} geojson The GeoJSON data.
	 */
	addSearchMarker = (geojson) => {
		// add new layer group top map with search marker
		const searchLayer = L.layerGroup();

		// add geojson layer to layer group
		searchLayer.addLayer(
			L.geoJson(geojson, {
				style: {
					color: this.colors.accent,
					weight: 3,
					fillColor: this.colors.accent,
					fillOpacity: 0.3
				},
				onEachFeature: (feature, layer) => {
					if (typeof layer.setIcon === "function") {
						layer.setIcon(
							this.getLeafletIcon({
								iconUrl: `${draadMapsConfig.pluginDir}/dist/images/marker-search.png`
							})
						);
					} else if (typeof layer.setStyle === "function") {
						layer.setStyle({
							color: this.colors.accent,
							weight: 4,
							dashArray: "0, 0",
							fillColor: this.colors.accent,
							fillOpacity: 0.3
						});
					}
				}
			})
		);
		// zoom to search marker
		this.map.flyToBounds(L.geoJson(geojson).getBounds(), {
			padding: [50, 50]
		});

		searchLayer.addTo(this.map);
		this.layers.search = searchLayer;
	};

	/**
	 * Removes the search marker from the map.
	 */
	removeSearchMarker = () => {
		if (!this.layers.search) {
			return;
		}

		this.map.removeLayer(this.layers.search);

		// remove search marker from layers
		delete this.layers.search;
	};

	/**
	 * Sorts locations by distance to search marker.
	 */
	sortLocations = () => {
		const wrapper = this.mapNode.closest(".draad-maps__wrapper");
		const list = wrapper.querySelector(".draad-grid");
		const locations = list.querySelectorAll(
			".draad-card"
		);

		if (!this.layers.search) {
			return;
		}

		const center = this.layers.search
			.getLayers()[0]
			.getBounds()
			.getCenter();

		// sort locations by distance to search marker
		const sortedLocations = [...locations].sort((a, b) => {
			const aCenter = a
				.getAttribute("data-draad-center")
				.split("/")
				.map(Number);
			const bCenter = b
				.getAttribute("data-draad-center")
				.split("/")
				.map(Number);

			const aDistance = this.map.distance(center, aCenter);
			const bDistance = this.map.distance(center, bCenter);

			return aDistance - bDistance;
		});

		// remove all locations from dom
		list.innerHTML = "";

		// add sorted locations to dom
		sortedLocations.forEach((location) => list.appendChild(location));
	};

	/**
	 * Event handler for legend
	 */
	legendHandler = () => {
		const checkboxes = this.legendNode.querySelectorAll("input");
		checkboxes?.forEach((checkbox) => {
			const dataset = checkbox.closest(".draad-maps__dataset");
			const name = dataset.dataset.datasetName;

			checkbox.addEventListener("change", (event) => {
				if (checkbox.checked) {
					const endpoint = dataset.dataset.draadGeojson;

					if (
						document.getElementById(
							dataset.dataset.draadGeojsonTarget
						)
					) {
						const data = JSON.parse(
							document.getElementById(
								dataset.dataset.draadGeojsonTarget
							).text
						);
						
						this.loadFeatures( name );
						// this.loadGeoJson( data, name, dataset );
						return;
					} else if (endpoint) {
						const checkbox = dataset.querySelector("input");

						fetch(endpoint)
							.then((response) => response.json())
							.then((data) => {
								this.loadFeatures( name );
								// this.loadGeoJson( data, name, dataset );
								return;
							});
					}
				} else {
					if (!this.layers[name]) {
						return;
					}

					this.cluster.removeLayer(this.layers[name]);

					// remove search marker from layers
					delete this.layers[name];
				}
			});
		});
	};
	
	/**
	 * Returns default marker styles
	 *
	 * @param {object} config
	 * 
	 * @returns {object}
	 */
	getLeafletIcon = (config) =>
		L.icon({
			iconUrl: "",
			iconSize: [39.2, 51.2],
			iconAnchor: [19.6, 51.2],
			popupAnchor: [-3, -76],
			...config
	});

}

/**
 * Limits the number of times the callback can be called.
 *
 * @param {function} callback The function to debounce.
 * @param {number} wait The time to wait.
 */
function debounce(callback, wait) {
	let timeout;
	return (...args) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			callback.apply(this, args);
		}, wait);
	};
}
