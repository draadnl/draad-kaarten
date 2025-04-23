<?php

if ( ! function_exists( 'draad_maps_register_assets' ) ) {
    /**
     * Register assets.
     */
    function draad_maps_register_assets()
    {
        wp_register_style( 'leaflet-style', DRAAD_MAPS_URI . 'dist/css/leaflet.css', [], '1.0.1' );
        wp_register_style( 'leaflet-markercluster-style', DRAAD_MAPS_URI . 'dist/css/MarkerCluster.css', [], '1.0.1' );
        wp_register_script( 'leaflet-script', DRAAD_MAPS_URI . 'dist/js/leaflet.js', [], '1.0.1', true );
        wp_register_script( 'leaflet-markercluster-script', DRAAD_MAPS_URI . 'dist/js/leaflet.markercluster.js', ['leaflet-script'], '1.0.1', true );
        wp_register_script( 'leaflet-markercluster-src-script', DRAAD_MAPS_URI . 'dist/js/leaflet.markercluster-src.js', ['leaflet-script'], '1.0.1', true );
        wp_register_script( 'draad-maps-tabs-script', DRAAD_MAPS_URI . 'dist/js/draad-tabs.js', [], '1.0.1', true );
        wp_register_script( 'draad-maps-focus-trap-script', DRAAD_MAPS_URI . 'dist/js/focusTrap.js', [], '1.0.1', true );
        wp_register_script( 'draad-maps-maps-module', DRAAD_MAPS_URI . 'dist/js/draad-maps.js', ['leaflet-script', 'draad-maps-focus-trap-script'], '1.0.1', true );
        wp_localize_script( 'draad-maps-maps-module', 'draadMapsConfig', ['pluginDir' => DRAAD_MAPS_URI] );
        wp_register_style( 'draad-maps-maps-style', DRAAD_MAPS_URI . 'dist/css/style.css', [], '1.0.1' );
        wp_register_style( 'draad-maps-tabs-style', DRAAD_MAPS_URI . 'dist/css/style.css', [], '1.0.1' );
    }
}
add_action( 'wp_enqueue_scripts', 'draad_maps_register_assets' );