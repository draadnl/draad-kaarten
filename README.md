=== Draad Kaarten ===
Tested up to: 6.8
Requires PHP: 8.0
Plugin voor het maken van kaarten met OpenStreetMaps

## Description

Draad Kaarten laat je makkelijk kaarten toevoegen aan je website doormiddel van een shortcode of gutenberg blok.
Voeg vervolgens locaties met vrij invulbare tegels toe aan de kaart.
Of voeg een dataset toe met grenzen of markers.

## Changelog

### 1.3.0

- Added support for WMS & WFS datasets.

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
