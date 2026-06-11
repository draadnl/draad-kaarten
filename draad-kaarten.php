<?php

/**
 * Plugin Name: Draad Kaarten
 * Description: Draad Kaarten laat je makkelijk kaarten toevoegen aan je website doormiddel van een shortcode of gutenberg blok.
 * text-domain: draad-kaarten
 * Version: 1.4.1
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

if ( !defined( 'DRAAD_KAARTEN_VERSIE' ) ) {
    define( 'DRAAD_KAARTEN_VERSIE', '1.4.1' );
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

/**
 * Admin tools page: flush map cache
 */
add_action( 'admin_menu', function () {
    add_submenu_page(
        'edit.php?post_type=draad_maps',
        __( 'Kaarten tools', 'draad-kaarten' ),
        __( 'Tools', 'draad-kaarten' ),
        'edit_posts',
        'draad-maps-tools',
        'draad_maps_tools_page'
    );
} );

function draad_maps_tools_page() {
    if (
        isset( $_POST['draad_maps_flush_cache'], $_POST['draad_maps_flush_nonce'] )
        && wp_verify_nonce( sanitize_key( $_POST['draad_maps_flush_nonce'] ), 'draad_maps_flush_cache' )
        && current_user_can( 'edit_posts' )
    ) {
        draad_maps_flush_all_cache();
        echo '<div class="notice notice-success"><p>' . esc_html__( 'Kaartencache geleegd.', 'draad-kaarten' ) . '</p></div>';
    }

    ?>
    <div class="wrap">
        <h1><?php esc_html_e( 'Draad Kaarten tools', 'draad-kaarten' ); ?></h1>
        <form method="post">
            <?php wp_nonce_field( 'draad_maps_flush_cache', 'draad_maps_flush_nonce' ); ?>
            <?php submit_button( __( 'Kaartencache leegmaken', 'draad-kaarten' ), 'secondary', 'draad_maps_flush_cache' ); ?>
        </form>
    </div>
    <?php
}