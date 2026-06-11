=== Draad Kaarten ===
Tested up to: 6.8
Stable tag: 1.4.2
Requires PHP: 8.0
Plugin voor het maken van kaarten met OpenStreetMaps

## Description

Draad Kaarten laat je makkelijk kaarten toevoegen aan je website doormiddel van een shortcode of gutenberg blok.
Voeg vervolgens locaties met vrij invulbare tegels toe aan de kaart.
Of voeg een dataset toe met grenzen of markers.

## Changelog

### 1.4.2

- Fixed location search crashing on maps with a single dataset and no list view
- Fixed location search returning no results for plain street names and autocomplete selections
- Versioned plugin assets via the `DRAAD_KAARTEN_VERSIE` constant so updates bust the browser cache

### 1.4.1

- Fixed admin submenu parent so the Kaarten tools page appears under the correct post type menu
- Widened composer/installers constraint to `^1.0 || ^2.0` for broader compatibility

### 1.4.0

- Added admin tools page with cache flush functionality
- Updated border dataset endpoints from CKAN to OpenDataSoft
- Validate HTTP status code before caching remote responses
- Added null guards in renderer and ACF block
- Fixed XSS: escape GeoJSON property values in infowindow output

### 1.3.1

- Added coordinates conversion for GeoJson datasets
- Improved draad_maps_convert_coordinates()

### 1.3.0

- Added support for WMS & WFS datasets.
- Added transients for datasets
- Improved compliance with Wordpress best practices

### 1.2.4

- Added "Basisregistratie Topografie (BRT)" tile layer from PDOK.

### 1.2.3

- Added ability to choose fill opacity for datasets, borders always show the full color.
- Renamed default marker icon to align with Leaflet styles.
- Added marker-shadow.png to prevent 404 errors from Leaflet styles.
- Added support for MultiPoint, MultiLine and MultiPolygon.
- Decreased max zoom to prevent 404 errors for Leaflet map tiles.
- Fixed interactive states for markers and polygons.

### 1.2.2

-   Replaced static border data with API endpoints.

### 1.2.1

-   Added option to remove hide legend.
-   Fixed overflowing title in infowindow.

### 1.2.0

-   Moved CKAN to GeoJSON and RDnew to WGS84 conversions into php from js
-   Added infowindows to all types of data.
-   Added properties field to datasets.
-   Added table styles to infowindows.

### 1.1.2

-   Fixed local datasets not showing.

### 1.1.1

-   Added compatibility with the RDnew format for coordinates.
-   Added legend styles.
-   Increased max zoom level.

### 1.1.0

-   Added the option to add multiple datasets and style them.
-   Removed old dataset fields.
-   Added a legend with the map to toggle datasets.

### 1.0.3

-   Added new functionality to choose custom icons for each marker.

### 1.0.2

-   Added new functionality to show user location on the map.

### 1.0.0

-   Initial release of the plugin.
