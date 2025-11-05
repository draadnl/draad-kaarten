<?php

if ( ! function_exists( 'draad_maps_register_post_type' ) ) {
    /**
     * Register a custom post type called "Kaarten".
     */
    function draad_maps_register_post_type()
    {
        $labels = [
            'name'                  => _x( 'Kaarten', 'Post Type General Name', 'draad-kaarten' ),
            'singular_name'         => _x( 'Kaart', 'Post Type Singular Name', 'draad-kaarten' ),
            'menu_name'             => __( 'Kaarten', 'draad-kaarten' ),
            'name_admin_bar'        => __( 'Kaart', 'draad-kaarten' ),
            'archives'              => __( 'Kaart Archief', 'draad-kaarten' ),
            'attributes'            => __( 'Kaart attributen', 'draad-kaarten' ),
            'parent_item_colon'     => __( 'Bovenliggende Kaart', 'draad-kaarten' ),
            'all_items'             => __( 'Alle Kaarten', 'draad-kaarten' ),
            'add_new_item'          => __( 'Nieuwe Kaart Toevoegen', 'draad-kaarten' ),
            'add_new'               => __( 'Nieuwe Toevoegen', 'draad-kaarten' ),
            'new_item'              => __( 'Nieuwe Kaart', 'draad-kaarten' ),
            'edit_item'             => __( 'Kaart Bewerken', 'draad-kaarten' ),
            'update_item'           => __( 'Kaart Bijwerken', 'draad-kaarten' ),
            'view_item'             => __( 'Bekijk Kaart', 'draad-kaarten' ),
            'view_items'            => __( 'Bekijk Kaarten', 'draad-kaarten' ),
            'search_items'          => __( 'Zoek Kaarten', 'draad-kaarten' ),
            'not_found'             => __( 'Geen gevonden', 'draad-kaarten' ),
            'not_found_in_trash'    => __( 'Niet gevonden in prullenbak', 'draad-kaarten' ),
            'featured_image'        => __( 'Uitgelichte Afbeelding', 'draad-kaarten' ),
            'set_featured_image'    => __( 'Uitgelichte afbeelding toevoegen', 'draad-kaarten' ),
            'remove_featured_image' => __( 'Uitgelichte afbeelding verwijderen', 'draad-kaarten' ),
            'use_featured_image'    => __( 'Gebuiken als uitgelichte afbeelding', 'draad-kaarten' ),
            'insert_into_item'      => __( 'Invoegen in Kaart', 'draad-kaarten' ),
            'uploaded_to_this_item' => __( 'Upload naar deze kaart', 'draad-kaarten' ),
            'items_list'            => __( 'Kaarten lijst', 'draad-kaarten' ),
            'items_list_navigation' => __( 'Kaarten lijst navigatie', 'draad-kaarten' ),
            'filter_items_list'     => __( 'Filter kaarten lijst', 'draad-kaarten' ),
        ];
        $args = [
            'label'               => __( 'Kaart', 'draad-kaarten' ),
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