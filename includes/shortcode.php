<?php

if ( ! function_exists( 'draad_maps_shortcode' ) ) {
    /**
     * Render the map.
     */
    function draad_maps_shortcode( $args )
    {
        $args = shortcode_atts( [
            'map' => 0,
        ], $args, 'draad_maps' );

        $output = draad_maps_renderer( '', $args );
        wp_enqueue_style( 'leaflet-style' );
        wp_enqueue_style( 'leaflet-markercluster-style' );
        wp_enqueue_script( 'leaflet-script' );
        wp_enqueue_script( 'leaflet-markercluster-script' );
        wp_enqueue_script( 'leaflet-markercluster-src-script' );
        wp_enqueue_script( 'draad-maps-tabs-script' );
        wp_enqueue_script( 'draad-maps-focus-trap-script' );
        wp_enqueue_script( 'draad-maps-maps-module' );
        wp_enqueue_style( 'draad-maps-maps-style' );

        return $output;
    }
}
add_shortcode( 'draad_maps', 'draad_maps_shortcode' );