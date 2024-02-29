import Draad_Focus_Trap from './focusTrap.js';

`use strict`;

const draad = {};
const mapEvent = new Event('draadMapsLoaded');

/**
 * Initialize maps
 */
function draadMapsInit() {

	draad.maps = [];
	const nodes = document.querySelectorAll('.draad-maps');
	nodes.forEach((node) => {

		// initialize map
		const map = new Draad_Map(node);

		// save map to draad.maps
		draad.maps.push(map);

		document.dispatchEvent(mapEvent);

	});

}

document.addEventListener('DOMContentLoaded', draadMapsInit);

class Draad_Map {

	/**
	 *  Constructor
	 * 
	 * @param {HTMLElement} node The HTML element that contains the map.
	 */
	constructor(node) {
		if (!node) {
			throw new Error('Draad Maps: No map node provided.');
		}

		this.mapNode = node;
		this.outerWrapper = node.closest('.draad-maps__wrapper');

		this.map = this.createMap();

		// Add clusters
		const cluster = L.markerClusterGroup(
			{
				showCoverageOnHover: false,
				iconCreateFunction: cluster => {

					const childCount = cluster.getChildCount();
					let c = ' marker-cluster-';
					if (childCount < 10) {
						c += 'small';
					} else if (childCount < 100) {
						c += 'medium';
					} else {
						c += 'large';
					}

					return new L.DivIcon({ html: '<div><span>' + childCount + ' <span aria-label="markers"></span>' + '</span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(40, 40) });

				},
			}
		);

		// Manually created markers
		const locations = this.outerWrapper.querySelectorAll('.draad-card--infowindow');
		const locationsLayer = L.layerGroup();
		let minHeight = 0;
		locations.forEach(location => {
			const height = location.offsetHeight;
			if (height > minHeight) {
				minHeight = height;
			}

			const marker = this.addMarker(location);
			marker.addTo(locationsLayer);

		});
		this.layers['locations'] = locationsLayer;
		this.layers['locations'].addTo(cluster);

		const baseFontSize = parseInt(getComputedStyle(document.documentElement).fontSize);
		node.style.minHeight = minHeight / baseFontSize + 3 + 'rem';

		// Borders
		if (document.getElementById(node.id + '-borders')) {
			const borders = document.getElementById(node.id + '-borders').dataset.draadGeojson;
			fetch(borders)
				.then(response => response.json())
				.then(data => {

					const geojsonLayer = this.addData(data);
					this.layers['borders'] = geojsonLayer;
					this.layers['borders'].addTo(cluster);
				});
		}

		// GeoJSON
		if (document.getElementById(node.id + '-geojson')) {
			const geojson = document.getElementById(node.id + '-geojson').dataset.draadGeojson;
			fetch(geojson)
				.then(response => response.json())
				.then(data => {

					const markerSrc = document.getElementById(node.id + '-geojson').dataset.draadMarker;
					const markerActiveSrc = document.getElementById(node.id + '-geojson').dataset.draadMarkerActive;
					const geojsonLayer = this.addData(data, markerSrc, markerActiveSrc);
					this.layers['geojson'] = geojsonLayer;
					this.layers['geojson'].addTo(cluster);

				});
		}

		// Add support to open infowindows with enter key
		this.outerWrapper.addEventListener('keypress', (e) => {

			if (e.key === 'Enter') {

				const simulateClick = (elem) => {
					// Create our event (with options)
					const evt = new MouseEvent('click', {
						bubbles: true,
						cancelable: true,
						view: window
					});
					// If cancelled, don't dispatch our event
					const canceled = !elem.dispatchEvent(evt);
				};

				simulateClick(e.target);
			}

		});

		// Add clusters to map
		this.map.addLayer(cluster);

		const search = this.outerWrapper.querySelector('.draad-search');
		if (search) {

			this.searchInput = search.querySelector('.draad-search__input');
			this.searchSubmit = search.querySelector('.draad-search__submit');
			this.searchHandler();

		}

		const instructions = this.outerWrapper.querySelector('.draad-maps__instructions');
		if (instructions) {
			instructions.addEventListener('click', () => instructions.remove());
			instructions.addEventListener('touchstart', () => instructions.remove());
		}

	}

	/**
	 * Creates a new Leaflet map.
	 */
	createMap = () => {

		const center = this.mapNode.dataset.draadCenter.split('/');

		this.center = [parseFloat(center[1]), parseFloat(center[2])];
		this.zoom = parseInt(center[0]);

		const map = L.map(this.mapNode.id, {
			dragging: !L.Browser.mobile,
			tap: !L.Browser.mobile,
			scrollWheelZoom: false
		}).setView(this.center, this.zoom);

		// Tile layer
		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 16,
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		// remove zoom control
		map.removeControl(map.zoomControl);

		L.control.zoom(
			{
				position: 'bottomleft',
				zoomInText: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g><path d="M10 4.16602V15.8327" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.16602 10H15.8327" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g></svg>',
				zoomInTitle: 'Zoom in',
				zoomOutText: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g><path d="M4.16602 10H15.8327" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g></svg>',
				zoomOutTitle: 'Zoom out'
			}
		).addTo(map);

		return map;

	}

	/**
	 * Adds a marker to the map.
	 * 
	 * @param {HTMLElement} location Turns custom infowindow into a marker.
	 */
	addMarker = (location) => {

		const center = location.dataset.draadCenter.split('/').map(parseFloat);
		const marker = L.marker(
			center,
			{
				icon: this.markerStyles.primary,
				riseOnHover: true,
				alt: location.querySelector('.draad-card__title').textContent,
			}
		);

		// set aria-selected
		marker.selected = false;

		marker.locationTrap = new Draad_Focus_Trap(location);

		this.markerHandler(marker, location);

		return marker;

	}

	/**
	 * Event handler for markers.
	 * 
	 * @param {object} marker The marker object.
	 * @param {HTMLElement} location The infowindow.
	 * @param {string} markerSrc The default marker image.
	 * @param {string} markerActiveSrc The active marker image.
	 */
	markerHandler = (marker, location = null, markerSrc = null, markerActiveSrc = null) => {

		const draad = this;

		const close = location ? location.querySelector('.draad-card__close') : null;
		if (close) {
			close.addEventListener('click', (e) => {

				marker.locationTrap.active = false;

				this.markerSetState(marker, 'default', markerSrc, markerActiveSrc);
				marker.selected = false;

				if (marker.icon) {
					marker.icon.focus();
				}

				location.classList.remove('draad-infowindow--active');
				location.setAttribute('aria-hidden', 'true');
				location.setAttribute('hidden', '');

			});
		}

		marker.on('click', (e) => {

			if (location) {

				// close other infowindows
				const locations = location.closest('.draad-maps__wrapper').querySelectorAll('.draad-card--infowindow');
				locations.forEach((location) => {
					location.classList.remove('draad-card--active');
					location.setAttribute('aria-hidden', 'true');
					location.setAttribute('hidden', '');
				});

				// update marker of other infowindows
				this.layers['locations'].eachLayer((layer) => {
					if (layer.selected === true) {
						this.markerSetState(layer, 'default');
						layer.selected = false;
					}
				});


				if (marker.selected === true) {

					marker.locationTrap.active = false;

					location.classList.remove('draad-card--active');
					location.setAttribute('aria-hidden', 'true');
					location.setAttribute('hidden', '');

					if (marker.icon) {
						marker.icon.focus();
					}

				} else {

					location.classList.add('draad-card--active');
					location.setAttribute('aria-hidden', 'false');
					location.removeAttribute('hidden');

					marker.locationTrap.active = true;

					const close = location.querySelector('.draad-card__close');
					close.focus();

				}

			} else {
				marker.openPopup();
			}

			this.markerSetState(marker, (marker.selected ? 'default' : 'active'), markerSrc, markerActiveSrc);
			marker.selected = !marker.selected;

		});

		marker.on('popupclose', (e) => {

			this.markerSetState(marker, 'default', markerSrc, markerActiveSrc);
			marker.selected = false;

			if (location) {

				marker.locationTrap.active = false;


				location.classList.remove('draad-card--active');
				location.setAttribute('aria-hidden', 'true');
				location.setAttribute('hidden', '');

				if (marker.icon) {
					marker.icon.focus();
				}

			}

		});
	}

	/**
	 * Changes the state of a marker.
	 * 
	 * @param {object} marker The marker object.
	 * @param {string} state The state of the marker.
	 * @param {string} markerSrc The default marker image.
	 * @param {string} markerActiveSrc The active marker image.
	 */
	markerSetState = (marker, state, markerSrc = null, markerActiveSrc = null) => {

		switch (state) {

			case 'default':
				if (markerSrc) {
					marker.setIcon(this.getLeafletIcon({
						iconUrl: markerSrc,
					}));
				} else {
					marker.setIcon(this.markerStyles.primary);
				}
				break;

			case 'active':
				if (markerActiveSrc) {
					marker.setIcon(this.getLeafletIcon({
						iconUrl: markerActiveSrc,
					}));
				} else {
					marker.setIcon(this.markerStyles.active);
				}
				break;

			case 'hover':
				if (markerActiveSrc) {
					marker.setIcon(this.getLeafletIcon({
						iconUrl: markerActiveSrc,
					}));
				} else {
					marker.setIcon(this.markerStyles.hover);
				}
				break;

			case 'focus':
				if (markerActiveSrc) {
					marker.setIcon(this.getLeafletIcon({
						iconUrl: markerActiveSrc,
					}));
				} else {
					marker.setIcon(this.markerStyles.focus);
				}
				break;

		}

	}

	/**
	 * Adds a GeoJSON layer to the map.
	 * 
	 * @param {object} data The GeoJSON data.
	 * @param {string} markerSrc The default marker image.
	 * @param {string} markerActiveSrc The active marker image.
	 */
	addData = (data, markerSrc = null, markerActiveSrc = null) => {

		const layer = L.geoJSON(data);
		layer.getLayers()?.forEach((feature) => {

			// set popup
			feature.bindPopup(feature.feature.properties.name);

			// set border
			if (typeof feature.setStyle === 'function') {
				feature.setStyle(this.borderStyles.default);
				feature.options.alt = feature.feature.properties.name;
				feature.selected = false;
				this.dataHandler(feature);
			}

			// set icon
			if (typeof feature.setIcon === 'function') {

				if (markerSrc) {
					feature.setIcon(this.getLeafletIcon({
						iconUrl: markerSrc,
					}));
				} else {
					feature.setIcon(this.markerStyles.primary);
				}

				feature.options.alt = feature.feature.properties.name;
				feature.selected = false;
				this.markerHandler(feature, null, markerSrc, markerActiveSrc);


			}

		});

		return layer;

	}

	/**
	 * Event handler for GeoJSON data.
	 * 
	 * @param {object} feature The GeoJSON feature.
	 */
	dataHandler = (feature) => {

		const draad = this;
		feature.on('click', (e) => {

			this.dataSetState(feature, 'active');
			this.map.flyToBounds(feature.getBounds(), { padding: [0, 0] });

		});

		feature.on('popupclose', (e) => this.dataSetState(feature, 'default'));

	}

	/**
	 * Changes the state of a GeoJSON feature.
	 * 
	 * @param {object} feature The GeoJSON feature.
	 * @param {string} state The state of the feature.
	 */
	dataSetState = (feature, state) => {

		switch (state) {
			case 'default':
				feature.setStyle(this.borderStyles.default);
				break;
			case 'active':
				feature.setStyle(this.borderStyles.highlight);
				break;
			case 'hover':
				feature.setStyle(this.borderStyles.hover);
				break;
			case 'focus':
				feature.setStyle(this.borderStyles.focus);
				break;
		}

	}

	/**
	 * Event handler for the search input.
	 */
	searchHandler = () => {

		const autocomplete = document.getElementById(this.searchInput.getAttribute('list'));

		this.searchInput.addEventListener('keyup', debounce(() => {

			// get posible locations from nominatim api
			fetch(`https://nominatim.openstreetmap.org/search?&q=Den+Haag+${this.searchInput.value}&layer=address,manmade,poi&polygon_geojson=1&countrycodes=nl&format=json&addressdetails=1&limit=10`)
				.then(response => response.json())
				.then(data => {

					autocomplete.innerHTML = '';
					data.forEach((location) => {
						const option = document.createElement('option');
						option.value = location.display_name;
						autocomplete.appendChild(option);
					});
				});

		}, 750));

		this.searchSubmit.addEventListener('click', (e) => {
			e.preventDefault();

			this.removeSearchMarker();

			// get posible locations from nominatim api
			fetch(`https://nominatim.openstreetmap.org/search?&q=Den+Haag+${this.searchInput.value}&layer=address,manmade,poi&polygon_geojson=1&countrycodes=nl&format=geojson&addressdetails=1&limit=1`)
				.then(response => response.json())
				.then(data => {

					if (data.features.length === 0) {
						return;
					}

					this.addSearchMarker(data);
				}).then(() => this.sortLocations());

		});

	}

	/**
	 * Adds a search marker to the map.
	 * 
	 * @param {object} geojson The GeoJSON data.
	 */
	addSearchMarker = (geojson) => {

		// add new layer group top map with search marker
		const searchLayer = L.layerGroup();

		// add geojson layer to layer group
		searchLayer.addLayer(L.geoJson(geojson, {
			style: {
				color: this.colors.accent,
				weight: 3,
				fillColor: this.colors.accent,
				fillOpacity: .3,
			},
			onEachFeature: (feature, layer) => {

				if (typeof layer.setIcon === 'function') {
					layer.setIcon(this.markerStyles.search);
				} else if (typeof layer.setStyle === 'function') {
					layer.setStyle(this.borderStyles.search);
				}
			}
		}));
		// zoom to search marker
		this.map.flyToBounds(L.geoJson(geojson).getBounds(), { padding: [50, 50] });

		searchLayer.addTo(this.map);
		this.layers['search'] = searchLayer;

	}

	/**
	 * Removes the search marker from the map.
	 */
	removeSearchMarker = () => {

		if (!this.layers['search']) {
			return;
		}

		this.map.removeLayer(this.layers['search']);

		// remove search marker from layers
		delete this.layers['search'];

	}

	/**
	 * Sorts locations by distance to search marker.
	 */
	sortLocations = () => {

		const wrapper = this.mapNode.closest('.draad-maps__wrapper');
		const list = wrapper.querySelector('.draad-grid');
		const locations = wrapper.querySelectorAll('.draad-card:not(.draad-card--infowindow)');

		if (!this.layers['search']) {
			return;
		}

		const center = this.layers['search'].getLayers()[0].getBounds().getCenter();

		// sort locations by distance to search marker
		const sortedLocations = [...locations].sort((a, b) => {

			const aCenter = a.getAttribute('data-draad-center').split('/').map(Number);
			const bCenter = b.getAttribute('data-draad-center').split('/').map(Number);

			const aDistance = this.map.distance(center, aCenter);
			const bDistance = this.map.distance(center, bCenter);

			return aDistance - bDistance;

		});

		// remove all locations from dom
		list.innerHTML = '';

		// add sorted locations to dom
		sortedLocations.forEach((location) => list.appendChild(location));

	}

	node = null;

	map = null;

	center = null;

	zoom = null;

	outerWrapper = null;

	layers = [];

	/**
	 * Sets Leaflet icon options.
	 * 
	 * @param {object} config The Leaflet icon options.
	 */
	getLeafletIcon = (config) => L.icon({
		iconUrl: '',
		iconSize: [39.2, 51.2],
		iconAnchor: [19.6, 51.2],
		popupAnchor: [-3, -76]
		, ...config
	});

	markerStyles = {
		"primary": this.getLeafletIcon({ iconUrl: '/wp-content/plugins/draad-kaarten/dist/images/marker.png' }),
		"hover": this.getLeafletIcon({ iconUrl: '/wp-content/plugins/draad-kaarten/dist/images/marker-hover.png' }),
		"active": this.getLeafletIcon({ iconUrl: '/wp-content/plugins/draad-kaarten/dist/images/marker-active.png' }),
		"search": this.getLeafletIcon({ iconUrl: '/wp-content/plugins/draad-kaarten/dist/images/marker-search.png' }),
	};

	documentComputedStyles = getComputedStyle(document.documentElement);
	colors = {
		"primary": this.documentComputedStyles.getPropertyValue('--dk__clr-primary') || "#248641",
		"secondary": this.documentComputedStyles.getPropertyValue('--dk__clr-secondary') || "#7D6200",
		"accent": this.documentComputedStyles.getPropertyValue('--dk__clr-accent') || "#1261A3",
	};

	borderStyles = {
		"default": {
			"color": this.colors.primary,
			"weight": 4,
			"dashArray": "8, 8",
			"fillColor": this.colors.primary,
			"fillOpacity": 0
		},
		"focus": {
			"color": this.colors.secondary,
			"weight": 4,
			"dashArray": "0, 0",
			"fillColor": this.colors.primary,
			"fillOpacity": 0.15
		},
		"hover": {
			"color": this.colors.primary,
			"weight": 4,
			"dashArray": "0, 0",
			"fillColor": this.colors.primary,
			"fillOpacity": 0.15
		},
		"highlight": {
			"color": this.colors.primary,
			"weight": 4,
			"dashArray": "0, 0",
			"fillColor": this.colors.primary,
			"fillOpacity": 0.3
		},
		"search": {
			"color": this.colors.accent,
			"weight": 4,
			"dashArray": "0, 0",
			"fillColor": this.colors.accent,
			"fillOpacity": 0.3
		}
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
		timeout = setTimeout(() => { callback.apply(this, args); }, wait);
	};
}