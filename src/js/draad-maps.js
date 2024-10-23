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

	layers = [];

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

		const documentComputedStyles = getComputedStyle(document.documentElement);
		this.colors = {
			primary:
				documentComputedStyles.getPropertyValue("--dk__clr-primary") ||
				"#248641",
			secondary:
				documentComputedStyles.getPropertyValue(
					"--dk__clr-secondary"
				) || "#7D6200",
			accent:
				documentComputedStyles.getPropertyValue("--dk__clr-accent") ||
				"#1261A3",
		};

		/**
		 * Add clusters
		 */
		this.cluster = L.markerClusterGroup({
			showCoverageOnHover: false,
			iconCreateFunction: (cluster) => {
				const childCount = cluster.getChildCount();
				let c = " marker-cluster-large";
				if (childCount < 10) {
					c = "marker-cluster-small";
				} else if (childCount < 100) {
					c += "marker-cluster-medium";
				}

				return new L.DivIcon({
					html:
						"<div><span>" +
						childCount +
						' <span aria-label="markers"></span>' +
						"</span></div>",
					className: "marker-cluster" + c,
					iconSize: new L.Point(40, 40),
				});
			},
		});

		/** 
		 * Manually created markers
		 */
		const locations = this.outerWrapper.querySelectorAll('.draad-card--infowindow');
		const locationsLayer = L.layerGroup();
		let minHeight = 0;
		locations?.forEach((location) => {
			const height = location.offsetHeight;
			if (height > minHeight) {
				minHeight = height;
			}

			const marker = this.addMarker(location);
			marker.addTo(locationsLayer);
		});
		this.layers["locations"] = locationsLayer;
		this.layers["locations"].addTo(this.cluster);
		
		const baseFontSize = parseInt(
			getComputedStyle(document.documentElement).fontSize
		);
		node.style.minHeight = Math.round(minHeight / baseFontSize) + 3 + "rem";

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
						view: window,
					});
					// If cancelled, don't dispatch our event
					const canceled = !elem.dispatchEvent(evt);
				};

				simulateClick(e.target);
			}
		});

		/**
		 * Show current GPS location of user
		 */
		if (document.getElementById(node.id + "-gps")) {
			const options = {
				enableHighAccuracy: true,
				timeout: 5000,
				maximumAge: 0,
			};

			var success = (pos) => {
				const crd = pos.coords;
				const userLocation = L.layerGroup();
				const marker = L.marker(
					[parseFloat(crd.latitude), parseFloat(crd.longitude)],
					{
						icon: this.getLeafletIcon({
							iconUrl:
								"/wp-content/plugins/draad-kaarten/dist/images/marker-gps.png",
							iconSize: [48, 48],
							iconAnchor: [24, 24],
						}),
						riseOnHover: false,
						alt: "Your location",
					}
				);
				marker.addTo(userLocation);

				this.layers["userLocation"] = userLocation;
				this.layers["userLocation"].addTo(this.cluster);
			};

			function error(err) {
				console.warn(`ERROR(${err.code}): ${err.message}`);
			}

			navigator.geolocation.getCurrentPosition(success, error, options);
		}

		const datasetNodes = document.querySelectorAll(".draad-maps__dataset");
		if (datasetNodes.length) {
			datasetNodes.forEach((node) => {
				const endpoint = node.dataset.draadGeojson;
				const name = node.dataset.datasetName;

				if (document.getElementById(node.dataset.draadGeojsonTarget)) {
					const data = JSON.parse(
						document.getElementById(node.dataset.draadGeojsonTarget)
							.text
					);

					let geoJSON = null;
					if (
						typeof data.type === "undefined" ||
						data.type !== "FeatureCollection"
					) {
						geoJSON = this.jsonToGeoJSON(data);
					} else {
						geoJSON = data;
					}

					const geojsonLayer = this.addData(geoJSON, node);
					this.layers[name] = geojsonLayer;
					this.layers[name].addTo(this.cluster);
				} else if (endpoint) {
					const checkbox = node.querySelector("input");

					fetch(endpoint)
						.then((response) => response.json())
						.then((data) => {
							let geoJSON = null;
							if (
								typeof data.type === "undefined" ||
								data.type !== "FeatureCollection"
							) {
								geoJSON = this.jsonToGeoJSON(data);
							} else {
								geoJSON = data;
							}

							const markerSrc = node.dataset.draadMarker;
							const markerActiveSrc =
								node.dataset.draadMarkerActive;
							const geojsonLayer = this.addData(geoJSON, node);
							this.layers[name] = geojsonLayer;
							this.layers[name].addTo(this.cluster);
						});
				}
			});

			this.legendNode = this.outerWrapper.querySelector(
				".draad-maps__legend"
			);
			if (this.legendNode) {
				this.legendHandler();
			}
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
		 * Remove touch instructions ofter interaction
		 */
		const instructions = this.outerWrapper.querySelector('.draad-maps__instructions');
		if (instructions) {
			instructions.addEventListener("click", () => instructions.remove());
			instructions.addEventListener("touchstart", () =>
				instructions.remove()
			);
		}

	}

	/**
	 * Returns default marker styles
	 * 
	 * @param object config 
	 * @returns object
	 */
	getLeafletIcon = (config) =>
		L.icon({
			iconUrl: "",
			iconSize: [39.2, 51.2],
			iconAnchor: [19.6, 51.2],
			popupAnchor: [-3, -76],
			...config,
		});
	
	/**
	 * Converts json to GeoJson format
	 * 
	 * @param object json 
	 * @returns object
	 */
	jsonToGeoJSON = (json) => {
		const geoJson = {
			type: "FeatureCollection",
			features: json.result.records.map((record) => ({
				type: "Feature",
				geometry: record.wkb_geometry,
				properties: { ...record },
			})),
		};

		return geoJson;
	};

	/**
	 * Creates a new Leaflet map.
	 * 
	 * @returns object
	 */
	createMap = () => {
		const center = this.mapNode.dataset.draadCenter.split("/");

		this.center = [parseFloat(center[1]), parseFloat(center[2])];
		this.zoom = parseInt(center[0]);

		const map = L.map(this.mapNode.id, {
			dragging: !L.Browser.mobile,
			tap: !L.Browser.mobile,
			scrollWheelZoom: false,
		}).setView(this.center, this.zoom);

		// Tile layer
		L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
			maxZoom: 16,
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(map);

		// remove zoom control
		map.removeControl(map.zoomControl);

		L.control
			.zoom({
				position: "bottomleft",
				zoomInText:
					'<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g><path d="M10 4.16602V15.8327" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.16602 10H15.8327" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g></svg>',
				zoomInTitle: "Zoom in",
				zoomOutText:
					'<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g><path d="M4.16602 10H15.8327" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g></svg>',
				zoomOutTitle: "Zoom out",
			})
			.addTo(map);

		return map;
	};

	/**
	 * Adds a marker to the map.
	 *
	 * @param {HTMLElement} location Turns custom infowindow into a marker.
	 * 
	 * @returns object
	 */
	addMarker = (location) => {
		const center = location.dataset.draadCenter.split("/").map(parseFloat);
		const marker = L.marker(center, {
			riseOnHover: true,
			alt: location.querySelector(".draad-card__title")?.textContent,
		});

		marker._styles = {
			default:
				location.dataset.marker !== ""
					? this.getLeafletIcon({ iconUrl: location.dataset.marker })
					: this.getLeafletIcon({
							iconUrl:
								"/wp-content/plugins/draad-kaarten/dist/images/marker.png",
					  }),
			hover:
				location.dataset.markerHover !== ""
					? this.getLeafletIcon({
							iconUrl: location.dataset.markerHover,
					  })
					: this.getLeafletIcon({
							iconUrl:
								"/wp-content/plugins/draad-kaarten/dist/images/marker-hover.png",
					  }),
			active:
				location.dataset.markerActive !== ""
					? this.getLeafletIcon({
							iconUrl: location.dataset.markerActive,
					  })
					: this.getLeafletIcon({
							iconUrl:
								"/wp-content/plugins/draad-kaarten/dist/images/marker-active.png",
					  }),
		};

		marker.setIcon(marker._styles.default);

		// set aria-selected
		marker.selected = false;

		marker.locationTrap = new Draad_Focus_Trap(location);

		this.markerHandler(marker, location);

		return marker;
	};

	/**
	 * Event handler for markers.
	 *
	 * @param {object} marker The marker object.
	 * @param {HTMLElement} location The infowindow.
	 */
	markerHandler = (
		marker,
		location = null
	) => {
		const draad = this;

		const close = location
			? location.querySelector(".draad-card__close")
			: null;
		if (close) {
			close.addEventListener("click", (e) => {
				marker.locationTrap.active = false;

				this.markerSetState(
					marker,
					"default"
				);
				marker.selected = false;

				if (marker.icon) {
					marker.icon.focus();
				}

				location.classList.remove("draad-infowindow--active");
				location.setAttribute("aria-hidden", "true");
				location.setAttribute("hidden", "");
			});
		}

		marker.on("click", (e) => {
			if (
				location &&
				location.querySelector(".draad-card__content")?.textContent
			) {
				// close other infowindows
				const locations = location
					.closest(".draad-maps__wrapper")
					.querySelectorAll(".draad-card--infowindow");
				locations.forEach((location) => {
					location.classList.remove("draad-card--active");
					location.setAttribute("aria-hidden", "true");
					location.setAttribute("hidden", "");
				});

				// update marker of other infowindows
				this.layers["locations"].eachLayer((layer) => {
					if (layer.selected === true) {
						this.markerSetState(layer, "default");
						layer.selected = false;
					}
				});

				if (marker.selected === true) {
					marker.locationTrap.active = false;

					location.classList.remove("draad-card--active");
					location.setAttribute("aria-hidden", "true");
					location.setAttribute("hidden", "");

					if (marker.icon) {
						marker.icon.focus();
					}
				} else {
					location.classList.add("draad-card--active");
					location.setAttribute("aria-hidden", "false");
					location.removeAttribute("hidden");

					marker.locationTrap.active = true;

					const close = location.querySelector(".draad-card__close");
					close.focus();
				}
			} else {
				marker.openPopup();
			}

			this.markerSetState(
				marker,
				marker.selected ? "default" : "active"
			);
			marker.selected = !marker.selected;
		});

		marker.on("popupclose", (e) => {
			this.markerSetState(marker, "default");
			marker.selected = false;

			if (location) {
				marker.locationTrap.active = false;

				location.classList.remove("draad-card--active");
				location.setAttribute("aria-hidden", "true");
				location.setAttribute("hidden", "");

				if (marker.icon) {
					marker.icon.focus();
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
	markerSetState = (
		marker,
		state,
	) => {
		switch (state) {
			case "default":
				marker.setIcon(marker._styles.default);
				break;

			case "active":
				marker.setIcon(marker._styles.active);
				break;

			case "hover":
				marker.setIcon(marker._styles.hover);
				break;

			case "focus":
				marker.setIcon(marker._styles.active);
				break;
		}
	};

	/**
	 * Adds a GeoJSON layer to the map.
	 *
	 * @param {object} data The GeoJSON data.
	 * @param {HTMLElement} node The Legend item node.
	 */
	addData = (data, node) => {
		const layer = L.geoJSON(data);
		layer.getLayers()?.forEach((feature) => {
			feature._styles = {
				default:
					typeof node !== "undefined" && node.dataset.marker !== ""
						? this.getLeafletIcon({ iconUrl: node.dataset.marker })
						: this.getLeafletIcon({
								iconUrl:
									"/wp-content/plugins/draad-kaarten/dist/images/marker.png",
						  }),
				hover:
					typeof node !== "undefined" &&
					node.dataset.markerHover !== ""
						? this.getLeafletIcon({
								iconUrl: node.dataset.markerHover,
						  })
						: this.getLeafletIcon({
								iconUrl:
									"/wp-content/plugins/draad-kaarten/dist/images/marker-hover.png",
						  }),
				active:
					typeof node !== "undefined" &&
					node.dataset.markerActive !== ""
						? this.getLeafletIcon({
								iconUrl: node.dataset.markerActive,
						  })
						: this.getLeafletIcon({
								iconUrl:
									"/wp-content/plugins/draad-kaarten/dist/images/marker-active.png",
						  }),
			};

			feature._style = {
				color:
					typeof node !== "undefined" &&
					node.dataset.shapeColor !== ""
						? node.dataset.shapeColor
						: this.colors.primary,
				weight:
					typeof node !== "undefined" &&
					node.dataset.shapeWidth !== ""
						? node.dataset.shapeWidth
						: 4,
				dashArray:
					typeof node !== "undefined" &&
					node.dataset.shapeStyle === "solid"
						? "0, 0"
						: "8, 8",
				fillColor:
					typeof node !== "undefined" &&
					node.dataset.shapeColor !== ""
						? node.dataset.shapeColor
						: this.colors.primary,
				fillOpacity: 0,
			};

			// set popup
			if (feature.feature.properties.titel) {
				feature.bindPopup(feature.feature.properties.titel);
			}

			// set border
			if (typeof feature.setStyle === "function") {
				feature.setStyle(feature._style);
				feature.options.alt = feature.feature.properties?.name;
				feature.options.title = feature.feature.properties?.title;
				feature.selected = false;
				this.dataHandler(feature);
			}

			// set icon
			if (typeof feature.setIcon === "function") {
				feature.setIcon(feature._styles.default);

				feature.options.alt = feature.feature.properties?.name;
				feature.options.title = feature.feature.properties?.titel;
				feature.selected = false;
				this.markerHandler(feature, null);
			}
		});

		return layer;
	};

	/**
	 * Event handler for GeoJSON data.
	 *
	 * @param {object} feature The GeoJSON feature.
	 */
	dataHandler = (feature) => {
		const draad = this;
		feature.on("click", (e) => {
			this.dataSetState(feature, "active");
			this.map.flyToBounds(feature.getBounds(), { padding: [0, 0] });
		});

		feature.on("popupclose", (e) => this.dataSetState(feature, "default"));
	};

	/**
	 * Changes the state of a GeoJSON feature.
	 *
	 * @param {object} feature The GeoJSON feature.
	 * @param {string} state The state of the feature.
	 */
	dataSetState = (feature, state) => {
		switch (state) {
			case "default":
				const styleDefault = feature._style;
				styleDefault.fillOpacity = 0;
				feature.setStyle(styleDefault);
				break;
			case "active":
				const styleActive = feature._style;
				styleActive.fillOpacity = 0.15;
				feature.setStyle(styleActive);
				break;
			case "hover":
				const styleHover = feature._style;
				styleHover.fillOpacity = 0.15;
				feature.setStyle(styleHover);
				break;
			case "focus":
				const styleFocus = feature._style;
				styleFocus.fillOpacity = 0.15;
				feature.setStyle(styleFocus);
				break;
		}
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

						let geoJSON = null;
						if (
							typeof data.type === "undefined" ||
							data.type !== "FeatureCollection"
						) {
							geoJSON = this.jsonToGeoJSON(data);
						} else {
							geoJSON = data;
						}

						const geojsonLayer = this.addData(geoJSON, dataset);
						this.layers[name] = geojsonLayer;
						this.layers[name].addTo(this.cluster);
					} else if (endpoint) {
						const checkbox = dataset.querySelector("input");

						fetch(endpoint)
							.then((response) => response.json())
							.then((data) => {
								let geoJSON = data;
								if (
									typeof data.type === "undefined" ||
									data.type !== "FeatureCollection"
								) {
									geoJSON = this.jsonToGeoJSON(data);
								}

								const markerSrc = dataset.dataset.draadMarker;
								const markerActiveSrc =
									dataset.dataset.draadMarkerActive;
								const geojsonLayer = this.addData(
									geoJSON,
									dataset
								);
								this.layers[name] = geojsonLayer;
								this.layers[name].addTo(this.cluster);
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
	 * Event handler for the search input.
	 * 
	 * @return void
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
					`https://nominatim.openstreetmap.org/search?&q=Den+Haag+${this.searchInput.value}&layer=address,manmade,poi&polygon_geojson=1&countrycodes=nl&format=json&addressdetails=1&limit=10`
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
				`https://nominatim.openstreetmap.org/search?&q=Den+Haag+${this.searchInput.value}&layer=address,manmade,poi&polygon_geojson=1&countrycodes=nl&format=geojson&addressdetails=1&limit=1`
			)
				.then((response) => response.json())
				.then((data) => {
					if (data.features.length === 0) {
						return;
					}

					this.addSearchMarker(data);
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
					fillOpacity: 0.3,
				},
				onEachFeature: (feature, layer) => {
					if (typeof layer.setIcon === "function") {
						layer.setIcon(
							this.getLeafletIcon({
								iconUrl:
									"/wp-content/plugins/draad-kaarten/dist/images/marker-search.png",
							})
						);
					} else if (typeof layer.setStyle === "function") {
						layer.setStyle(
							{
								color: this.colors.accent,
								weight: 4,
								dashArray: "0, 0",
								fillColor: this.colors.accent,
								fillOpacity: 0.3,
							}
						);
					}
				},
			})
		);
		// zoom to search marker
		this.map.flyToBounds(L.geoJson(geojson).getBounds(), {
			padding: [50, 50],
		});

		searchLayer.addTo(this.map);
		this.layers["search"] = searchLayer;
	};

	/**
	 * Removes the search marker from the map.
	 */
	removeSearchMarker = () => {
		if (!this.layers["search"]) {
			return;
		}

		this.map.removeLayer(this.layers["search"]);

		// remove search marker from layers
		delete this.layers["search"];
	};

	/**
	 * Sorts locations by distance to search marker.
	 */
	sortLocations = () => {
		const wrapper = this.mapNode.closest(".draad-maps__wrapper");
		const list = wrapper.querySelector(".draad-grid");
		const locations = wrapper.querySelectorAll(
			".draad-card:not(.draad-card--infowindow)"
		);

		if (!this.layers["search"]) {
			return;
		}

		const center = this.layers["search"]
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