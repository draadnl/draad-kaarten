<?php

/**
 * Plugin Name: Draad Kaarten
 * text-domain: draad
 */
	
function draad_maps_allow_json_upload($mimes) {
	$mimes['json'] = 'text/plain';
	return $mimes;
}
add_filter('upload_mimes', 'draad_maps_allow_json_upload');

add_filter("should_load_separate_core_block_assets", "__return_true");

function draad_acf_set_save_path ($path) {
	return plugin_dir_path( __FILE__ ) . '/acf-json';
}
add_filter('acf/settings/save_json/key=group_651d4c3b5e5b4', 'draad_acf_set_save_path', 99);
add_filter('acf/settings/save_json/key=group_65080689915de', 'draad_acf_set_save_path', 99);

add_filter('acf/settings/load_json', function( $paths ) {
	
	$paths[] = plugin_dir_path( __FILE__ ) . 'acf-json';

	return $paths;

}, 99);

// register blocks location
add_action( 'init', function () {
	register_block_type( __DIR__ . '/acf-blocks/maps' );
});

// register crop for marker
if ( ! function_exists( 'draad_maps_register_crops' ) ) {
	/**
	 * Register crops.
	 */
	function draad_maps_register_crops () {
		add_image_size( 'draad-marker', 0, 52, false );
		add_image_size( 'draad-card', 360, 180, true );
	}
}
add_action( 'after_setup_theme', 'draad_maps_register_crops' );

if ( ! function_exists( 'draad_maps_register_post_type' ) ) {
	/**
	 * Register a custom post type called "Kaarten".
	 */
	function draad_maps_register_post_type () {

		$labels = array(
			'name'				  => _x( 'Kaarten', 'Post Type General Name', 'draad' ),
			'singular_name'		 => _x( 'Kaart', 'Post Type Singular Name', 'draad' ),
			'menu_name'			 => __( 'Kaarten', 'draad' ),
			'name_admin_bar'		=> __( 'Kaart', 'draad' ),
			'archives'			  => __( 'Kaart Archief', 'draad' ),
			'attributes'			=> __( 'Kaart attributen', 'draad' ),
			'parent_item_colon'	 => __( 'Bovenliggende Kaart', 'draad' ),
			'all_items'			 => __( 'Alle Kaarten', 'draad' ),
			'add_new_item'		  => __( 'Nieuwe Kaart Toevoegen', 'draad' ),
			'add_new'			   => __( 'Nieuwe Toevoegen', 'draad' ),
			'new_item'			  => __( 'Nieuwe Kaart', 'draad' ),
			'edit_item'			 => __( 'Kaart Bewerken', 'draad' ),
			'update_item'		   => __( 'Kaart Bijwerken', 'draad' ),
			'view_item'			 => __( 'Bekijk Kaart', 'draad' ),
			'view_items'			=> __( 'Bekijk Kaarten', 'draad' ),
			'search_items'		  => __( 'Zoek Kaarten', 'draad' ),
			'not_found'			 => __( 'Geen gevonden', 'draad' ),
			'not_found_in_trash'	=> __( 'Niet gevonden in prullenbak', 'draad' ),
			'featured_image'		=> __( 'Uitgelichte Afbeelding', 'draad' ),
			'set_featured_image'	=> __( 'Uitgelichte afbeelding toevoegen', 'draad' ),
			'remove_featured_image' => __( 'Uitgelichte afbeelding verwijderen', 'draad' ),
			'use_featured_image'	=> __( 'Gebuiken als uitgelichte afbeelding', 'draad' ),
			'insert_into_item'	  => __( 'Invoegen in Kaart', 'draad' ),
			'uploaded_to_this_item' => __( 'Upload naar deze kaart', 'draad' ),
			'items_list'			=> __( 'Kaarten lijst', 'draad' ),
			'items_list_navigation' => __( 'Kaarten lijst navigatie', 'draad' ),
			'filter_items_list'	 => __( 'Filter kaarten lijst', 'draad' ),
		);
		$args = array(
			'label'				 => __( 'Kaart', 'draad' ),
			'labels'				=> $labels,
			'supports'			  => array( 'title', 'thumbnail', 'revisions', 'custom-fields' ),
			'taxonomies'			=> array( 'category', 'post_tag' ),
			'hierarchical'		  => false,
			'public'				=> true,
			'show_ui'			   => true,
			'show_in_menu'		  => true,
			'menu_position'		 => 20,
			'menu_icon'			 => 'dashicons-location-alt',
			'show_in_admin_bar'	 => false,
			'show_in_nav_menus'	 => true,
			'can_export'			=> true,
			'has_archive'		   => false,
			'exclude_from_search'   => true,
			'publicly_queryable'	=> true,
			'capability_type'	   => 'page',
			'show_in_rest'		  => true,
		);
		register_post_type( 'draad_maps', $args );

	}
}
add_action( 'init', 'draad_maps_register_post_type' );

if ( ! function_exists( 'draad_maps_register_assets' ) ) {
	/**
	 * Register assets.
	 */
	function draad_maps_register_assets () {

		wp_register_style( 'leaflet-style', plugin_dir_url( __FILE__ ) . 'dist/css/leaflet.css', [], '1.0.0');
		wp_register_style( 'leaflet-markercluster-style', plugin_dir_url( __FILE__ ) . 'dist/css/MarkerCluster.css', [], '1.0.0' );
		wp_register_script( 'leaflet-script', plugin_dir_url( __FILE__ ) . 'dist/js/leaflet.js', [], '1.0.0', true);
		wp_register_script( 'leaflet-markercluster-script', plugin_dir_url( __FILE__ ) . 'dist/js/leaflet.markercluster.js', ['leaflet-script'], '1.0.0', true);
		wp_register_script( 'leaflet-markercluster-src-script', plugin_dir_url( __FILE__ ) . 'dist/js/leaflet.markercluster-src.js', ['leaflet-script'], '1.0.0', true);
		wp_register_script( 'draad-tabs-script', plugin_dir_url( __FILE__ ) . 'dist/js/draad-tabs.js', [], '1.0.0', true);
		wp_register_script( 'draad-focus-trap-script', plugin_dir_url( __FILE__ ) . 'dist/js/focusTrap.js', [], '1.0.0', true);
		wp_register_script( 'draad-maps-module', plugin_dir_url( __FILE__ ) . 'dist/js/draad-maps.js', ['leaflet-script', 'draad-focus-trap-script'], '1.0.0', true);
		wp_register_style( 'draad-maps-style', plugin_dir_url( __FILE__ ) . 'dist/css/style.css', [], '1.0.0' );
		wp_register_style( 'draad-tabs-style', plugin_dir_url( __FILE__ ) . 'dist/css/style.css', [], '1.0.0' );

	}
}
add_action( 'wp_enqueue_scripts', 'draad_maps_register_assets' );

if ( ! function_exists( 'draad_maps_renderer' ) ) {
	/**
	 * Render the map.
	 */
	function draad_maps_renderer ( $output, $args ) {

		$post_id = $args['map'];
		$post = get_post( $post_id );
		
		$tabsId = wp_unique_id();
		$firstTabId = wp_unique_id();
		$secondTabId = wp_unique_id();
		$mapId = wp_unique_id();

		$center = get_field( 'center', $post_id );
		$args['center'] = $center['zoom'] .'/'. $center['coordinates']['lat'] .'/'. $center['coordinates']['lng'];
		$args['aria-label'] = $post->post_title;
		$attributes = '';
		if ( is_iterable( $args ) ) {
			foreach ( $args as $key => $value ) {
				$attributes .= ' data-draad-' . $key . '="' . $value . '"';
			}
		}

		$output = '<div class="draad-maps__wrapper">

					<search class="draad-maps__search draad-search" id="draad-maps-'. $mapId .'-search">
						<form class="draad-search__form">

							<div class="draad-search__field">
								<label class="draad-search__label" for="draad-maps-'. $mapId .'-search-input">'. __('Zoek op straat, wijk of stadsdeel', 'draad') .'</label>
								<input class="draad-search__input" id="draad-maps-'. $mapId .'-search-input" type="search" placeholder="'. __('Zoeken...', 'draad') .'" list="draad-maps-'. $mapId .'-autocomplete" />
								<datalist class="draad-search__autocomplete" id="draad-maps-'. $mapId .'-autocomplete"></datalist>
							</div>

							<button class="draad-search__submit button button--primary button--icon-only" id="draad-maps-'. $mapId .'-search-submit" role="button">
								<span class="button__title sr-only">'. __('Zoeken', 'draad') .'</span>
								'. draad_maps_icon( 'search' ) .'
							</button>

						</form>
					</search>

					<div class="draad-tabs" id="tabs-'. $tabsId .'">

						<div class="draad-tabs__list" role="tablist" aria-labelledby="tablist-'. $tabsId .'-label">

							<button class="draad-tabs__tab button button--secondary" id="tab-'. $firstTabId .'" type="button" role="tab" aria-selected="true" aria-controls="tabpanel-'. $firstTabId .'">
								'. draad_maps_icon( 'map' ) .'
								<span class="button__title">
									<span>'. __('Kaart', 'draad') .'</span>
									<span>'. __('bekijken', 'draad') .'</span>
								</span>
							</button>

							<button class="draad-tabs__tab button button--secondary" id="tab-'. $secondTabId .'" type="button" role="tab" aria-selected="true" aria-controls="tabpanel-'. $secondTabId .'">
								'. draad_maps_icon( 'list' ) .'
								<span class="button__title">
									<span>'. __('Lijst', 'draad') .'</span>
									<span>'. __('bekijken', 'draad') .'</span>
								</span>
							</button>

						</div>
				
						<div class="draad-tabs__panel" id="tabpanel-'. $firstTabId .'" role="tabpanel" aria-labelledby="tab-'. $firstTabId .'">
							<div class="draad-maps" id="draad-maps-'. $mapId .'" '. $attributes .'>

								<div class="draad-maps__map" id="draad-maps-'. $mapId .'-map"></div>
								
								<div class="draad-maps__instructions"> 
									<p>'. __('Sleep met twee vingers om de kaart te bewegen.', 'draad') .'</p>
								</div>

								<div class="draad-maps__list" id="draad-maps-'. $mapId .'-list">';
						
								if ( have_rows( 'locations', $post_id ) ) {
									$values = get_field( 'locations', $post_id );
									while ( have_rows( 'locations', $post_id ) ) {
										the_row();

										$button = get_sub_field( 'button' );
										$title = get_sub_field( 'title' );
										$content = get_sub_field( 'content' );
										$coordinates = get_sub_field( 'coordinates' );
										
										$card = '<div class="draad-maps__item draad-card draad-card--infowindow" data-draad-center="'. $coordinates['lat'] .'/'. $coordinates['lng'] .'" aria-hidden="true" hidden>';
										$card .= ( $button ) ? '<a class="draad-card__link" href="'. $button['url'] .'" target="'. $button['target'] .'">' : '<div class="draad-card__wrapper">';

										$card .= '<div class="draad-card__content">';

										$card .= ( $title ) ? '<h3 class="draad-card__title">'. $title .'</h3>' : '';
										$card .= ( $content ) ? '<div class="draad-card__description">'. $content .'</div>' : '';

										$card .= ( $button ) ? '<span class="draad-card__button button button--primary">'. draad_maps_icon( 'arrow-right' ) .' '. $button['title'] .'</span>' : '';

										$card .= '</div>';

										$card .= wp_get_attachment_image( get_sub_field( 'thumbnail' ), 'draad-card', false, ['class' => 'draad-card__image'] );

										$card .= ( $button ) ? '</a>' : '</div>';
										$card .= '<button class="draad-card__close button button--secondary button--icon-only" aria-label="'. __('Popup sluiten', 'draad') .'">
													'. draad_maps_icon( 'close' ) .'
												</button>';
										$card .= '</div>';

										$output .= apply_filters( 'draad_maps_infowindow', $card, $values[ get_row_index() - 1 ] );
									}
								}
						
		$output .= '			</div>';

								// Start GeoJSON
								$borders = get_field( 'borders', $post_id );
								switch ( $borders ) {
									case 'wijken':
										$bordersSrc = plugin_dir_url( __FILE__ ) . 'dist/geojson/wijken.json';
										break;
									case 'buurten':
										$bordersSrc = plugin_dir_url( __FILE__ ) . 'dist/geojson/buurten.json';
										break;
									case 'stadsdelen':
										$bordersSrc = plugin_dir_url( __FILE__ ) . 'dist/geojson/stadsdelen.json';
										break;
									default:
										$bordersSrc = '';
										break;
								}

								if ( $bordersSrc ) {
									$output .= '<div class="draad-maps__layer" id="draad-maps-'. $mapId . '-borders" data-draad-geojson="'. $bordersSrc .'"></div>';
								}

								$geoJson = get_field( 'geojson', $post_id );
								$geoJsonPath = get_attached_file( $geoJson );
								$geoJsonSrc = wp_get_attachment_url( $geoJson );
								if ( file_exists( $geoJsonPath ) ) {
									$marker = get_field( 'marker', $post_id );
									$markerSrc = ( $marker ) ? wp_get_attachment_image_url( $marker, 'draad-marker', true ) : '';
									$markerActive = get_field( 'marker_hover', $post_id );
									$markerActiveSrc = ( $markerActive ) ? wp_get_attachment_image_url( $markerActive, 'draad-marker', true ) : '';
									
									$output .= '<div class="draad-maps__layer" id="draad-maps-'. $mapId . '-geojson" data-draad-geojson="'. $geoJsonSrc .'" data-draad-marker="'. $markerSrc .'" data-draad-marker-active="'. $markerActiveSrc .'"></div>';
								}
								// End GeoJSON

		$output .= '		</div>
						</div>
						<div class="draad-tabs__panel" id="tabpanel-'. $secondTabId .'" role="tabpanel" aria-labelledby="tab-'. $secondTabId .'">
							<div class="draad-grid">';
						
							if ( have_rows( 'locations', $post_id ) ) {
								$values = get_field( 'locations', $post_id );
								while ( have_rows( 'locations', $post_id ) ) {
									the_row();

									$button = get_sub_field( 'button' );
									$title = get_sub_field( 'title' );
									$content = get_sub_field( 'content' );
									$coordinates = get_sub_field( 'coordinates' );

									$card = '<div class="draad-grid__item draad-card" data-draad-center="'. $coordinates['lat'] .'/'. $coordinates['lng'] .'">';
									$card .= ( $button ) ? '<a class="draad-card__link" href="'. $button['url'] .'" target="'. $button['target'] .'">' : '<div class="draad-card__wrapper">';

									$card .= '<div class="draad-card__content">';

									$card .= ( $title ) ? '<h3 class="draad-card__title">'. get_sub_field( 'title' ) .'</h3>' : '';
									$card .= ( $content ) ? '<div class="draad-card__description">'. $content .'</div>' : '';

									$card .= ( $button ) ? '<span class="draad-card__button button button--primary">'. draad_maps_icon( 'arrow-right' ) .' '. $button['title'] .'</span>' : '';

									$card .= '</div>';

									$card .= wp_get_attachment_image( get_sub_field( 'thumbnail' ), 'draad-card', false, ['class' => 'draad-card__image'] );

									$card .= ( $button ) ? '</a>' : '</div>';
									$card .= '</div>';

									$output .= apply_filters( 'draad_maps_card', $card, $values[ get_row_index() - 1 ] );
								}
							}

		$output .= '		</div>
						</div>
					
					</div>

				</div>';

		return $output;

	}
}
add_action( 'draad_maps_renderer', 'draad_maps_renderer', 2, 10 );

if ( ! function_exists( 'draad_maps_shortcode' ) ) {
	/**
	 * Render the map.
	 */
	function draad_maps_shortcode ( $args ) {

		$output = draad_maps_renderer( '', $args );
		wp_enqueue_style( 'leaflet-style' );
		wp_enqueue_style( 'leaflet-markercluster-style' );
		wp_enqueue_script( 'leaflet-script' );
		wp_enqueue_script( 'leaflet-markercluster-script' );
		wp_enqueue_script( 'leaflet-markercluster-src-script' );
		wp_enqueue_script( 'draad-tabs-script' );
		wp_enqueue_script( 'draad-focus-trap-script' );
		wp_enqueue_script( 'draad-maps-module' );
		wp_enqueue_style( 'draad-maps-style' );

		return $output;

	}
}
add_shortcode( 'draad_maps', 'draad_maps_shortcode' );

if ( ! function_exists( 'draad_maps_icon' ) ) {
	/**
	 * Returns an SVG icon from the icons folder
	 * 
	 * @since 1.0.0
	 */
	function draad_maps_icon( $icon ) {
		
		$iconPath = plugin_dir_path( __FILE__ ) .'template-parts/icons/'. $icon .'.svg';

		if ( ! file_exists( $iconPath ) ) {
			return '';
		}

		return file_get_contents( $iconPath );

	}
}