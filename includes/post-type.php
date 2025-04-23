<?php

if ( ! function_exists( 'draad_maps_register_post_type' ) ) {
    /**
     * Register a custom post type called "Kaarten".
     */
    function draad_maps_register_post_type()
    {
        $labels = [
            'name'                  => _x( 'Kaarten', 'Post Type General Name', 'draad' ),
            'singular_name'         => _x( 'Kaart', 'Post Type Singular Name', 'draad' ),
            'menu_name'             => __( 'Kaarten', 'draad' ),
            'name_admin_bar'        => __( 'Kaart', 'draad' ),
            'archives'              => __( 'Kaart Archief', 'draad' ),
            'attributes'            => __( 'Kaart attributen', 'draad' ),
            'parent_item_colon'     => __( 'Bovenliggende Kaart', 'draad' ),
            'all_items'             => __( 'Alle Kaarten', 'draad' ),
            'add_new_item'          => __( 'Nieuwe Kaart Toevoegen', 'draad' ),
            'add_new'               => __( 'Nieuwe Toevoegen', 'draad' ),
            'new_item'              => __( 'Nieuwe Kaart', 'draad' ),
            'edit_item'             => __( 'Kaart Bewerken', 'draad' ),
            'update_item'           => __( 'Kaart Bijwerken', 'draad' ),
            'view_item'             => __( 'Bekijk Kaart', 'draad' ),
            'view_items'            => __( 'Bekijk Kaarten', 'draad' ),
            'search_items'          => __( 'Zoek Kaarten', 'draad' ),
            'not_found'             => __( 'Geen gevonden', 'draad' ),
            'not_found_in_trash'    => __( 'Niet gevonden in prullenbak', 'draad' ),
            'featured_image'        => __( 'Uitgelichte Afbeelding', 'draad' ),
            'set_featured_image'    => __( 'Uitgelichte afbeelding toevoegen', 'draad' ),
            'remove_featured_image' => __( 'Uitgelichte afbeelding verwijderen', 'draad' ),
            'use_featured_image'    => __( 'Gebuiken als uitgelichte afbeelding', 'draad' ),
            'insert_into_item'      => __( 'Invoegen in Kaart', 'draad' ),
            'uploaded_to_this_item' => __( 'Upload naar deze kaart', 'draad' ),
            'items_list'            => __( 'Kaarten lijst', 'draad' ),
            'items_list_navigation' => __( 'Kaarten lijst navigatie', 'draad' ),
            'filter_items_list'     => __( 'Filter kaarten lijst', 'draad' ),
        ];
        $args = [
            'label'               => __( 'Kaart', 'draad' ),
            'labels'              => $labels,
            'supports'            => [ 'title', 'thumbnail', 'revisions', 'custom-fields' ],
            'taxonomies'          => [ 'category', 'post_tag' ],
            'hierarchical'        => false,
            'public'              => true,
            'show_ui'             => true,
            'show_in_menu'        => true,
            'menu_position'       => 20,
            'menu_icon'           => 'dashicons-location-alt',
            'show_in_admin_bar'   => false,
            'show_in_nav_menus'   => true,
            'can_export'          => true,
            'has_archive'         => false,
            'exclude_from_search' => true,
            'publicly_queryable'  => true,
            'capability_type'     => 'page',
            'show_in_rest'        => true,
        ];
        register_post_type( 'draad_maps', $args );
    }
}
add_action( 'init', 'draad_maps_register_post_type' );