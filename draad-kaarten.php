<?php

/**
 * Plugin Name: Draad Kaarten
 * Description: Draad Kaarten laat je makkelijk kaarten toevoegen aan je website doormiddel van een shortcode of gutenberg blok.
 * text-domain: draad
 * Version: 1.1.2
 */

include_once 'includes/helper.php';
include_once 'includes/post-type.php';
include_once 'includes/image-sizes.php';
include_once 'includes/assets.php';
include_once 'includes/renderer.php';
include_once 'includes/shortcode.php';

if ( !defined( 'DRAAD_MAPS_URI' ) ) {
    define( 'DRAAD_MAPS_URI', plugin_dir_url( __FILE__ ) );
}

if ( !defined( 'DRAAD_MAPS_PATH' ) ) {
    define( 'DRAAD_MAPS_PATH', plugin_dir_path( __FILE__ ) );
}

/**
 * Allow users to upload json files
 */
function draad_maps_allow_json_upload( $mimes )
{
    $mimes['json'] = 'text/plain';

    return $mimes;
}
add_filter( 'upload_mimes', 'draad_maps_allow_json_upload' );

add_filter( 'should_load_separate_core_block_assets', '__return_true' );

/**
 * Save field groups related to this plugin in the plugin
 */
function draad_acf_set_save_path( $path )
{
    return DRAAD_MAPS_PATH . '/acf-json';
}
add_filter( 'acf/settings/save_json/key=group_651d4c3b5e5b4', 'draad_acf_set_save_path', 99 );
add_filter( 'acf/settings/save_json/key=group_65080689915de', 'draad_acf_set_save_path', 99 );

/**
 * Load acf-json from plugin
 */
add_filter( 'acf/settings/load_json', function ( $paths ) {
    $paths[] = DRAAD_MAPS_PATH . 'acf-json';

    return $paths;
}, 99 );

/**
 * Register acf block
 */
add_action( 'init', function () {
    register_block_type( __DIR__ . '/acf-blocks/maps' );
} );

/**
 * Populate dataset content repeater with keys from feature properties
 */
add_action( 'save_post', 'draad_maps_populate_infowindow' );