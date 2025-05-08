<?php

if ( ! function_exists( 'draad_maps_register_crops' ) ) {
    /**
     * Register crops.
     */
    function draad_maps_register_crops()
    {
        add_image_size( 'draad-marker', 0, 52, false );
        add_image_size( 'draad-card', 360, 180, true );
    }
}
add_action( 'after_setup_theme', 'draad_maps_register_crops' );