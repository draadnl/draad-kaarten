import Draad_Focus_Trap from './focusTrap.js';

`use strict`;

const draad = {};
const mapEvent = new Event( 'draadMapsLoaded' );

function draadMapsInit() {

	draad.maps = [];
	const nodes = document.querySelectorAll( '.draad-maps' );
	nodes.forEach( function ( node ) {
		
		// initialize map
		const map = new Draad_Map( node );

		// save map to draad.maps
		draad.maps.push( map );
		
	} );

}

document.addEventListener( 'DOMContentLoaded', draadMapsInit );

class Draad_Map {

	constructor( node ) {

		this._node = node;
		this._outerWrapper = node.closest( '.draad-maps__wrapper' );

		this._map = this._createMap();

		// Add clusters
		const cluster = L.markerClusterGroup(
			{
				showCoverageOnHover: false,
				iconCreateFunction: cluster => {
	
					var childCount = cluster.getChildCount();	
					var c = ' marker-cluster-';
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
		const locations = this._outerWrapper.querySelectorAll( '.draad-infowindow' );
		const locationsLayer = L.layerGroup();
		let minHeight = 0;
		for ( const location of locations ) {
			
			const height = location.offsetHeight;
			if ( height > minHeight ) {
				minHeight = height;
			}

			const marker = this.addMarker( location );
			marker.addTo( locationsLayer );

		}
		this._layers['locations'] = locationsLayer;
		this._layers['locations'].addTo( cluster );

		const baseFontSize = parseInt(getComputedStyle(document.documentElement).fontSize);
		node.style.minHeight = minHeight / baseFontSize + 3 + 'rem';

		// Borders
		if ( document.getElementById( node.id + '-borders') ) {
			const borders = document.getElementById( node.id + '-borders').dataset.draadGeojson;
			fetch( borders )
				.then(response => response.json())
				.then(data => {

					const geojsonLayer = this._addData( data );
					this._layers['borders'] = geojsonLayer;
					this._layers['borders'].addTo( cluster );
				});
		}

		// GeoJSON
		if ( document.getElementById( node.id + '-geojson') ) {
			const geojson = document.getElementById( node.id + '-geojson').dataset.draadGeojson;
			fetch( geojson )
				.then(response => response.json())
				.then(data => {

					const markerSrc = document.getElementById( node.id + '-geojson').dataset.draadMarker;
					const markerActiveSrc = document.getElementById( node.id + '-geojson').dataset.draadMarkerActive;
					const geojsonLayer = this._addData( data, markerSrc, markerActiveSrc );
					this._layers['geojson'] = geojsonLayer;
					this._layers['geojson'].addTo( cluster );

				});
		}

		// Add support to open infowindows with enter key
		this._outerWrapper.addEventListener( 'keypress', ( e ) => {

			if ( e.key === 'Enter' ) {

				var simulateClick = function (elem) {
					// Create our event (with options)
					var evt = new MouseEvent('click', {
						bubbles: true,
						cancelable: true,
						view: window
					});
					// If cancelled, don't dispatch our event
					var canceled = !elem.dispatchEvent(evt);
				};

				simulateClick( e.target );
			}

		} );

		// Add clusters to map
		this._map.addLayer( cluster );

		const search = this._outerWrapper.querySelector('.draad-search');
		if (search) {

			this._searchInput = search.querySelector('.draad-search__input');
			this._searchSubmit = search.querySelector('.draad-search__submit');
			this._searchHandler();

		}

		const instructions = this._outerWrapper.querySelector('.draad-maps__instructions');
		if ( instructions ) {
			instructions.addEventListener( 'click', () => {
				instructions.remove();
			} );
			instructions.addEventListener( 'touchstart', () => {
				instructions.remove();
			} );
		}

	}

	_createMap = () => {

		const center = this._node.dataset.draadCenter.split( '/' );

		this._center = [ parseFloat( center[1] ), parseFloat( center[2] ) ];
		this._zoom = parseInt( center[0] );

		const map = L.map( this._node.id, {
			dragging: !L.Browser.mobile, 
			tap: !L.Browser.mobile,
			scrollWheelZoom: false
		} ).setView( this._center, this._zoom );

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

	addMarker = ( location ) => {

		const center = location.dataset.draadCenter.split( '/' ).map( parseFloat );
		const marker = L.marker( 
			center, 
			{ 
				icon: this._markerStyles.primary,
				riseOnHover: true,
				alt: location.querySelector( '.draad-infowindow__title' ).textContent,
			} 
		);

		// set aria-selected
		marker.selected = false;

		marker.locationTrap = new Draad_Focus_Trap(location);

		this._markerHandler( marker, location );

		return marker;

	}

	_markerHandler = ( marker, location = null, markerSrc = null, markerActiveSrc = null ) => {

		const draad = this;

		const close = location ? location.querySelector( '.draad-infowindow__close' ) : null;
		if ( close ) {
			close.addEventListener( 'click', ( e ) => {

				marker.locationTrap.active = false;

				draad._markerSetState( marker, 'default', markerSrc, markerActiveSrc );
				marker.selected = false;

				if ( marker._icon ) {
					marker._icon.focus();
				}
				
				location.classList.remove( 'draad-infowindow--active' );
				location.setAttribute( 'aria-hidden', 'true' );
				location.setAttribute( 'hidden', '' );

			} );
		}

		marker.on( 'click', ( e ) => {

			if ( location ) {

				// close other infowindows
				const locations = location.closest( '.draad-maps__wrapper' ).querySelectorAll( '.draad-infowindow' );
				for ( const location of locations ) {
					location.classList.remove( 'draad-infowindow--active' );
					location.setAttribute( 'aria-hidden', 'true' );
					location.setAttribute( 'hidden', '' );
				}

				// update marker of other infowindows
				this._layers['locations'].eachLayer( ( layer ) => {
					if ( layer.selected === true ) {
						draad._markerSetState( layer, 'default' );
						layer.selected = false;
					}
				} );


				if ( marker.selected === true ) {

					marker.locationTrap.active = false;

					location.classList.remove( 'draad-infowindow--active' );
					location.setAttribute( 'aria-hidden', 'true' );
					location.setAttribute( 'hidden', '' );

					if ( marker._icon ) {
						marker._icon.focus();
					}

				} else {
					
					location.classList.add( 'draad-infowindow--active' );
					location.setAttribute( 'aria-hidden', 'false' );
					location.removeAttribute( 'hidden' );

					marker.locationTrap.active = true;

					const close = location.querySelector( '.draad-infowindow__close' );
					close.focus();

				}

			} else {
				marker.openPopup();
			}

			draad._markerSetState( marker, (marker.selected ? 'default' : 'active'), markerSrc, markerActiveSrc );
            marker.selected = !marker.selected;

		} );

		marker.on( 'popupclose', ( e ) => {

			draad._markerSetState( marker, 'default', markerSrc, markerActiveSrc );
			marker.selected = false;

			if ( location ) {

				marker.locationTrap.active = false;
				

				location.classList.remove( 'draad-infowindow--active' );
				location.setAttribute( 'aria-hidden', 'true' );
				location.setAttribute( 'hidden', '' );

				if ( marker._icon ) {
					marker._icon.focus();
				}

			}

		} );
	}

	_markerSetState = ( marker, state, markerSrc = null, markerActiveSrc = null ) => {

		let src = null;
		switch ( state ) {

			case 'default' :
				if ( markerSrc ) {
					marker.setIcon( this._getLeafletIcon({
						iconUrl: markerSrc,
					}) );
				} else {
					marker.setIcon( this._markerStyles.primary );
				}
				break;

			case 'active' :
				if ( markerActiveSrc ) {
					marker.setIcon( this._getLeafletIcon({
						iconUrl: markerActiveSrc,
					}) );
				} else {
					marker.setIcon( this._markerStyles.active );
				}
				break;

			case 'hover' :
				if ( markerActiveSrc ) {
					marker.setIcon( this._getLeafletIcon({
						iconUrl: markerActiveSrc,
					}) );
				} else {
					marker.setIcon( this._markerStyles.hover );
				}
				break;

			case 'focus' :
				if ( markerActiveSrc ) {
					marker.setIcon( this._getLeafletIcon({
						iconUrl: markerActiveSrc,
					}) );
				} else {
					marker.setIcon( this._markerStyles.focus );
				}
				break;

		}
				
	}

	_addData = ( data, markerSrc = null, markerActiveSrc = null ) => {

		const layer = L.geoJSON( data );
		for ( const feature of layer.getLayers() ) {
				
			// set popup
			feature.bindPopup( feature.feature.properties.name );

			// set border
			if ( typeof feature.setStyle === 'function' ) {
				feature.setStyle( this._borderStyles.default );
				feature.options.alt = feature.feature.properties.name;
				feature.selected = false;
				this._dataHandler( feature );
			}

			// set icon
			if ( typeof feature.setIcon === 'function' ) {

				if ( markerSrc ) {
					feature.setIcon( this._getLeafletIcon({
						iconUrl: markerSrc,
					}) );
				} else {
					feature.setIcon( this._markerStyles.primary );
				}

				feature.options.alt = feature.feature.properties.name;
				feature.selected = false;
				this._markerHandler( feature, null, markerSrc, markerActiveSrc );


			}

		}

		return layer;

	}

	_dataHandler = ( feature ) => {
		
		const draad = this;
		feature.on( 'click', ( e ) => {
			
			draad._dataSetState( feature, 'active' );
			draad._map.flyToBounds(feature.getBounds(), {padding: [0, 0]});

		} );
		
		feature.on( 'popupclose', ( e ) => {

			draad._dataSetState( feature, 'default' );

		} );

	}

	_dataSetState = ( feature, state ) => {

		switch ( state ) {
			case 'default':
				feature.setStyle( this._borderStyles.default );
				break;
			case 'active':
				feature.setStyle( this._borderStyles.highlight );
				break;
			case 'hover':
				feature.setStyle( this._borderStyles.hover );
				break;
			case 'focus':
				feature.setStyle( this._borderStyles.focus );
				break;
		}

	}

	_searchHandler = () => {

		const autocomplete = document.getElementById( this._searchInput.getAttribute('list') );

		this._searchInput.addEventListener( 'keyup', debounce(() => {

			// get posible locations from nominatim api
			fetch(`https://nominatim.openstreetmap.org/search?&q=Den+Haag+${this._searchInput.value}&layer=address,manmade,poi&polygon_geojson=1&countrycodes=nl&format=json&addressdetails=1&limit=10`)
				.then(response => response.json())
				.then(data => {

					autocomplete.innerHTML = '';
					data.forEach((location) => {
						const option = document.createElement('option');
						option.value = location.display_name;
						autocomplete.appendChild(option);
					});
				});

		}, 750) );

		this._searchSubmit.addEventListener( 'click', (e) => {
			e.preventDefault();

			this._removeSearchMarker();

			// get posible locations from nominatim api
			fetch(`https://nominatim.openstreetmap.org/search?&q=Den+Haag+${this._searchInput.value}&layer=address,manmade,poi&polygon_geojson=1&countrycodes=nl&format=geojson&addressdetails=1&limit=1`)
				.then(response => response.json())
				.then(data => {

					if ( data.features.length === 0 ) {
						return;
					}

					this._addSearchMarker( data );
				}).then(() => {
					this._sortLocations();
				});

		} );

	}

	_addSearchMarker = ( geojson ) => {

		// add new layer group top map with search marker
		const searchLayer = L.layerGroup();

		// add geojson layer to layer group
		searchLayer.addLayer( L.geoJson(geojson, {
			style: {
				color: "#1261A3",
				weight: 3,
				fillColor: "#1261A3",
				fillOpacity: .3,
			},
			onEachFeature: (feature, layer) => {

				if ( typeof layer.setIcon === 'function' ) {
					layer.setIcon( this._markerStyles.search );
				} else if ( typeof layer.setStyle === 'function' ) {
					layer.setStyle( this._borderStyles.search );
				}
			}
		}) );
		// zoom to search marker
		this._map.flyToBounds(L.geoJson(geojson).getBounds(), {padding: [50, 50]});

		searchLayer.addTo(this._map);
		this._layers['search'] = searchLayer;

	}

	_removeSearchMarker = () => {

		if ( !this._layers['search'] ) {
			return;
		}

		this._map.removeLayer(this._layers['search']);

		// remove search marker from layers
		delete this._layers['search'];

	}

	_sortLocations = () => {

		const wrapper = this._node.closest('.draad-maps__wrapper');
		const list = wrapper.querySelector('.draad-grid');
		const locations = wrapper.querySelectorAll('.draad-card');

		if ( !this._layers['search'] ) {
			return;
		}
		
		const center = this._layers['search'].getLayers()[0].getBounds().getCenter();

		// sort locations by distance to search marker
		const sortedLocations = [...locations].sort((a, b) => {

			const aCenter = a.getAttribute('data-draad-center').split('/').map(Number);
			const bCenter = b.getAttribute('data-draad-center').split('/').map(Number);

			const aDistance = this._map.distance(center, aCenter);
			const bDistance = this._map.distance(center, bCenter);

			return aDistance - bDistance;

		});

		// remove all locations from dom
		list.innerHTML = '';

		// add sorted locations to dom
		sortedLocations.forEach((location) => {
			list.appendChild(location);
		});

	}

	_node = null;

	_map = null;

	_center = null;

	_zoom = null;

	_outerWrapper = null;

	_layers = [];

	_getLeafletIcon = (config) => L.icon({
		iconUrl: '',
		iconSize:	 [39.2, 51.2],
		iconAnchor: [19.6, 51.2],
		popupAnchor:  [-3, -76]
	, ...config});

	_markerStyles = {
		"primary": this._getLeafletIcon({iconUrl: '/wp-content/plugins/draad-kaarten/dist/images/marker.png'}),
		"hover": this._getLeafletIcon({iconUrl: '/wp-content/plugins/draad-kaarten/dist/images/marker-hover.png'}),
		"active": this._getLeafletIcon({iconUrl: '/wp-content/plugins/draad-kaarten/dist/images/marker-active.png'}),
		"search": this._getLeafletIcon({iconUrl: '/wp-content/plugins/draad-kaarten/dist/images/marker-search.png'}),
	};

	_borderStyles = {
		"default": {
			"color": "#248641",
			"weight": 4,
			"dashArray": "8, 8",
			"fillColor": "#248641",
			"fillOpacity": 0
		},
		"focus": {
			"color": "#7D6200",
			"weight": 4,
			"dashArray": "0, 0",
			"fillColor": "#248641",
			"fillOpacity": 0.15
		},
		"hover": {
			"color": "#248641",
			"weight": 4,
			"dashArray": "0, 0",
			"fillColor": "#248641",
			"fillOpacity": 0.15
		},
		"highlight": {
			"color": "#248641",
			"weight": 4,
			"dashArray": "0, 0",
			"fillColor": "#248641",
			"fillOpacity": 0.3
		},
		"search": {
			"color": "#1261A3",
			"weight": 4,
			"dashArray": "0, 0",
			"fillColor": "#1261A3",
			"fillOpacity": 0.3
		}
	};


}

function debounce( callback, wait ) {
	let timeout;
	return (...args) => {
		clearTimeout(timeout);
		timeout = setTimeout(function () { callback.apply(this, args); }, wait);
	};
}