<?php

if ( ! function_exists( 'draad_maps_renderer' ) ) {
    /**
     * Render the map.
     */
    function draad_maps_renderer( $output, $args )
    {
        $post_id = $args['map'];
        $post = get_post( $post_id );


        $dataLayersOutput = '';
        $infowindowOutput = '';
        $cardOutput = '';

        $empty = true;

        /**
         * Manually Added Locations
         */
        if ( have_rows( 'locations', $post_id ) ) {

            $values = get_field( 'locations', $post_id );
            while ( have_rows( 'locations', $post_id ) ) {
                the_row();

                $button      = get_sub_field( 'button' );
                $title       = get_sub_field( 'title' );
                $content     = get_sub_field( 'content' );
                $coordinates = get_sub_field( 'coordinates' );

                $marker       = get_sub_field( 'marker' );
                $markerHover  = get_sub_field( 'marker_hover' );
                $markerActive = get_sub_field( 'marker_active' );

                if ( empty( $coordinates['markers'] ) || ( empty( $button ) && empty( $title ) && empty( $content ) ) ) {
                    // skip locations without markers
                    continue;
                }

                $feature = [
                   'type' => 'Feature',
                   'properties' => $values[ get_row_index() - 1 ],
                   'geometry' => [
                        'type'  => 'Point',
                        'crs'   => [
                            'type' => 'name',
                            'properties' => [
                                'name' => 'WGS84'
                            ]
                        ],
                        'coordinates' => [
                            $coordinates['markers'][0]['lng'],
                            $coordinates['markers'][0]['lat']
                        ]
                    ]
                ];

                $infowindow = '
                    <div 
                        class="draad-maps__item draad-card draad-card--infowindow" 
                        id="'. wp_unique_id( 'draad-maps-feature-' ) .'"
                        data-draad-feature="' . esc_attr( json_encode( $feature ) ) . '"
                        data-marker="' . ( $marker ? wp_get_attachment_image_url( $marker, 'full-size', true ) : '' ) . '" 
                        data-marker-hover="' . ( $markerHover ? wp_get_attachment_image_url( $markerHover, 'full-size', true ) : '' ) . '" 
                        data-marker-active="' . ( $markerActive ? wp_get_attachment_image_url( $markerActive, 'full-size', true ) : '' ) . '" 
                        data-dataset-type="point"
                        data-dataset-name="draad-maps-location"
                        aria-hidden="true" 
                        hidden>';
                $infowindow .= ( $button ) ? '<a class="draad-card__link" href="' . $button['url'] . '" target="' . $button['target'] . '">' : '<div class="draad-card__wrapper">';
                $infowindow .= '<div class="draad-card__content">';
                $infowindow .= ( $title ) ? '<h3 class="draad-card__title">' . $title . '</h3>' : '';
                $infowindow .= ( $content ) ? '<div class="draad-card__description">' . $content . '</div>' : '';
                $infowindow .= ( $button ) ? '<span class="draad-card__button button button--primary">' . draad_maps_icon( 'arrow-right' ) . ' ' . $button['title'] . '</span>' : '';
                $infowindow .= '</div>';
                $infowindow .= wp_get_attachment_image( get_sub_field( 'thumbnail' ), 'draad-card', false, ['class' => 'draad-card__image'] );
                $infowindow .= ( $button ) ? '</a>' : '</div>';
                $infowindow .= '<button class="draad-card__close button button--secondary button--icon-only" aria-label="' . __( 'Popup sluiten', 'draad' ) . '">' . draad_maps_icon( 'close' ) . '</button>';
                $infowindow .= '</div>';

                $infowindowOutput .= apply_filters( 'draad_maps_infowindow', $infowindow, $values[ get_row_index() - 1 ] );

                $card = '<div 
                        class="draad-grid__item draad-card"
                        data-draad-center="' . $coordinates['markers'][0]['lat'] . '/' . $coordinates['markers'][0]['lng'] . '">';
                $card .= ( $button ) ? '<a class="draad-card__link" href="' . $button['url'] . '" target="' . $button['target'] . '">' : '<div class="draad-card__wrapper">';
                $card .= '<div class="draad-card__content">';
                $card .= ( $title ) ? '<h3 class="draad-card__title">' . get_sub_field( 'title' ) . '</h3>' : '';
                $card .= ( $content ) ? '<div class="draad-card__description">' . $content . '</div>' : '';
                $card .= ( $button ) ? '<span class="draad-card__button button button--primary">' . draad_maps_icon( 'arrow-right' ) . ' ' . $button['title'] . '</span>' : '';
                $card .= '</div>';
                $card .= wp_get_attachment_image( get_sub_field( 'thumbnail' ), 'draad-card', false, ['class' => 'draad-card__image'] );
                $card .= ( $button ) ? '</a>' : '</div>';
                $card .= '</div>';

                $cardOutput .= apply_filters( 'draad_maps_card', $card, $values[ get_row_index() - 1 ] );
            }

            $empty = ( !empty( $cardOutput ) ) ? false : true;
        }

        /**
         * Border Dataset
         */
        $borders      = get_field( 'borders', $post_id );
        $bordersValue = $borders['value'];
        $bordersLabel = $borders['label'];
        switch ( $bordersValue ) {
            case 'wijken':
                $bordersEndpoint = DRAAD_MAPS_URI . 'dist/geojson/wijken.json';
                break;

            case 'stadsdelen':
                $bordersEndpoint = DRAAD_MAPS_URI . 'dist/geojson/stadsdelen.json';
                break;

            case 'buurten':
                $bordersEndpoint = DRAAD_MAPS_URI . 'dist/geojson/buurten.json';
                break;

            default:
                $bordersEndpoint = false;
                break;
        }

        if ( isset( $bordersEndpoint ) && !empty( $bordersEndpoint ) ) {

            $response = draad_maps_get_data( $bordersEndpoint );
            $geoJson = $response ? json_decode( ckanToGeoJson( $response ), true ) : [];
            $infowindowContentRows = get_sub_field( 'infowindow_content' );

            if ( is_iterable( $geoJson['features'] ) && !empty( $geoJson['features'] ) ) {

                $dataLayersOutput .= '
                    <div 
                        class="draad-maps__dataset" 
                        data-draad-geojson="' . esc_attr( $bordersEndpoint ) . '"
                        data-draad-geojson-target="draad-map-data-' . $bordersValue . '"
                        data-shape-color="#248641" 
                        data-shape-width="3" 
                        data-shape-style="solid"
                        data-dataset-name="draad-maps-borders">
                        <label>
                            <input type="checkbox" name="draad-maps-datalayers[]" id="draad-maps-datalayer-' . $bordersValue . '" checked>
                            <span class="label">
                            <span class="label-text">' . wp_get_attachment_image( get_sub_field( 'icon' ) ) . $bordersLabel . '</span>
                        </label>
                    </div>';

                foreach ( $geoJson['features'] as $feature ) {

                    $title = $feature['properties']['titel'];
                    
                    $infowindow = '<div 
                        class="draad-maps__item draad-card draad-card--infowindow" 
                        id="'. wp_unique_id( 'draad-maps-feature-' ) .'"
                        data-draad-feature="' . esc_attr( json_encode( $feature ) ) . '"
                        data-marker="" 
                        data-marker-hover="" 
                        data-marker-active="" 
                        data-shape-color="#248641" 
                        data-shape-width="3" 
                        data-shape-style="solid"
                        aria-hidden="true"
                        data-dataset-type="polygon"
                        data-dataset-name="draad-maps-borders"
                        hidden>
                            <div class="draad-card__wrapper">
                                <div class="draad-card__content">';
                        $infowindow .= ( $title ) ? '<h3 class="draad-card__title">' . $title . '</h3>' : '';
                        $infowindow .= '
                                        </div>
                                    </div>
                                <button class="draad-card__close button button--secondary button--icon-only" aria-label="' . __( 'Popup sluiten', 'draad' ) . '">' . draad_maps_icon( 'close' ) . '</button>
                            </div>';

                    $infowindowOutput .= apply_filters( 'draad_maps_infowindow', $infowindow );

                }
            }
        }

        /**
         * Custom Datasets
         */
        if ( have_rows( 'datasets', $post_id ) ) {
            while ( have_rows( 'datasets', $post_id ) ) {
                the_row();

                $endpoint = ( get_sub_field( 'type_dataset' ) === 'api' ) ? get_sub_field( 'api_endpoint' ) : ( ( get_sub_field( 'type_dataset' ) === 'file' ) ? wp_get_attachment_url( get_sub_field( 'file' ) ) : false );
                $response = draad_maps_get_data( $endpoint );
                $geoJson = $response ? json_decode( ckanToGeoJson( $response ), true ) : [];
                $infowindowContentRows = get_sub_field( 'infowindow_content' );

                if ( is_iterable( $geoJson['features'] ) && !empty( $geoJson['features'] ) ) {    
                    $marker       = get_sub_field( 'marker' );
                    $markerHover  = get_sub_field( 'marker_hover' );
                    $markerActive = get_sub_field( 'marker_active' );
                    $shapeColor   = get_sub_field( 'shape_color' );
                    $shapeWidth   = get_sub_field( 'shape_width' );
                    $shapeStyle   = get_sub_field( 'shape_style' );

                    $dataLayersOutput .= '
                        <div 
                            class="draad-maps__dataset" 
                            data-draad-geojson="' . esc_attr( $endpoint ) . '"
                            data-draad-geojson-target="draad-map-data-' . sanitize_title( get_sub_field( 'name' ) ) . '" 
                            data-marker="' . ( $marker ? wp_get_attachment_image_url( $marker, 'full-size', true ) : '' ) . '" 
                            data-marker-hover="' . ( $markerHover ? wp_get_attachment_image_url( $markerHover, 'full-size', true ) : '' ) . '" 
                            data-marker-active="' . ( $markerActive ? wp_get_attachment_image_url( $markerActive, 'full-size', true ) : '' ) . '" 
                            data-shape-color="' . $shapeColor . '" 
                            data-shape-width="' . $shapeWidth . '" 
                            data-shape-style="' . $shapeStyle . '"
                            data-dataset-name="' . sanitize_title( get_sub_field( 'name' ) ) . '">
                            <label>
                                <input type="checkbox" name="draad-maps-datalayers[]" id="draad-maps-datalayer-' . sanitize_title( get_sub_field( 'name' ) ) . '" checked>
                                <span class="label">';

                                if ( get_sub_field( 'description' ) ) {
                                    $dataLayersOutput .= '
                                        <details>
                                            <summary>
                                                <span class="label-text">
                                                    ' . wp_get_attachment_image( get_sub_field( 'icon' ) ) . '
                                                    <svg width="24" height="24" class="summary-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z" fill="black"/>
                                                    </svg>
                                                    ' . get_sub_field( 'name' ) . '
                                                </span>
                                            </summary>
                                            <div><p>' . get_sub_field( 'description' ) . '</p></div>
                                        </details>';
                                } else {
                                    $dataLayersOutput .= '<span class="label-text">' . wp_get_attachment_image( get_sub_field( 'icon' ) ) . get_sub_field( 'name' ) . '</span>';
                                }

                    $dataLayersOutput .= '
                                </span>
                            </label>
                        </div>';

                    foreach ( $geoJson['features'] as $feature ) {

                        if ( isset( $feature['properties'][ $infowindowContentRows[0]['key'] ] ) ) {
                            $title = $feature['properties'][ $infowindowContentRows[0]['key'] ];
                        } else {
                            $title = 'undefined';
                        }
                        
                        $infowindowContent = '<table>';
                        foreach ( $infowindowContentRows as $i => $row ) {
                            
                            if ( $i === 0 ) {
                                continue;
                            }

                            if ( !isset( $feature['properties'][ $row['key'] ] ) || empty( $feature['properties'][ $row['key'] ] ) ) {
                                continue;
                            }
                            
                            $infowindowContent .= '<tr><th>'. $row['label'] .'</th><td>'. $feature['properties'][ $row['key'] ] .'</td></tr>';
                        }
                        $infowindowContent .= '</table>';

                        $featureType = $feature['geometry']['type'];
                        
                        $infowindow = '<div 
                            class="draad-maps__item draad-card draad-card--infowindow" 
                            id="'. wp_unique_id( 'draad-maps-feature-' ) .'"
                            data-draad-feature="' . esc_attr( json_encode( $feature ) ) . '"
                            data-marker="' . ( $marker ? wp_get_attachment_image_url( $marker, 'full-size', true ) : '' ) . '" 
                            data-marker-hover="' . ( $markerHover ? wp_get_attachment_image_url( $markerHover, 'full-size', true ) : '' ) . '" 
                            data-marker-active="' . ( $markerActive ? wp_get_attachment_image_url( $markerActive, 'full-size', true ) : '' ) . '" 
                            data-shape-color="' . $shapeColor . '" 
                            data-shape-width="' . $shapeWidth . '" 
                            data-shape-style="' . $shapeStyle . '"
                            data-dataset-type="' . $featureType . '"
                            data-dataset-name="' . sanitize_title( get_sub_field( 'name' ) ) . '"
                            aria-hidden="true"
                            hidden>';
                        if ( is_iterable( $infowindowContentRows ) && !empty( $infowindowContentRows ) ) {
                            $infowindow .= '<div class="draad-card__wrapper">
                                            <div class="draad-card__content">';
                            $infowindow .= ( $title ) ? '<h3 class="draad-card__title">' . $title . '</h3>' : '';
                            $infowindow .= ( $infowindowContent ) ? '<div class="draad-card__description">' . $infowindowContent . '</div>' : '';
                            $infowindow .= '</div>
                                            </div>
                                            <button class="draad-card__close button button--secondary button--icon-only" aria-label="' . __( 'Popup sluiten', 'draad' ) . '">' . draad_maps_icon( 'close' ) . '</button>';
                        }
                        $infowindow .= '</div>';

                        $infowindowOutput .= apply_filters( 'draad_maps_infowindow', $infowindow );

                    }

                }

            }
        }

        /**
         * Current Location
         */
        $gps = get_field( 'show_location', $post_id );

        /**
         * Element Markup
         */
        $tabsId      = wp_unique_id();
        $firstTabId  = wp_unique_id();
        $secondTabId = wp_unique_id();
        $mapId       = wp_unique_id();

        $center             = get_field( 'center', $post_id );
        $args['center']     = $center['zoom'] . '/' . $center['coordinates']['lat'] . '/' . $center['coordinates']['lng'];
        $args['aria-label'] = $post->post_title;
        $attributes         = '';

        if ( is_iterable( $args ) ) {
            foreach ( $args as $key => $value ) {
                $attributes .= ' data-draad-' . $key . '="' . $value . '"';
            }
        }

        $output = '
            <div class="draad-maps__wrapper">
                <search class="draad-maps__search draad-search" id="draad-maps-' . $mapId . '-search">
                    <form class="draad-search__form">

                        <div class="draad-search__field">
                            <label class="draad-search__label" for="draad-maps-' . $mapId . '-search-input">' . __( 'Zoek op straat, wijk of stadsdeel', 'draad' ) . '</label>
                            <input class="draad-search__input" id="draad-maps-' . $mapId . '-search-input" type="search" placeholder="' . __( 'Zoeken...', 'draad' ) . '" list="draad-maps-' . $mapId . '-autocomplete" />
                            <datalist class="draad-search__autocomplete" id="draad-maps-' . $mapId . '-autocomplete"></datalist>
                        </div>

                        <button class="draad-search__submit button button--primary button--icon-only" id="draad-maps-' . $mapId . '-search-submit" role="button">
                            <span class="button__title sr-only">' . __( 'Zoeken', 'draad' ) . '</span>
                            ' . draad_maps_icon( 'search' ) . '
                        </button>

                        <output id="draad-search-notice" for="draad-maps-' . $mapId . '-search" aria-live="polite"></output>
                    </form>
                </search>

                <div class="draad-tabs" id="tabs-' . $tabsId . '">';

                $output .= ($cardOutput && !$empty) ? '
                    <div class="draad-tabs__list" role="tablist" aria-labelledby="tablist-' . $tabsId . '-label">

                        <button class="draad-tabs__tab button button--secondary" id="tab-' . $firstTabId . '" type="button" role="tab" aria-selected="true" aria-controls="tabpanel-' . $firstTabId . '">
                            ' . draad_maps_icon( 'map' ) . '
                            <span class="button__title">
                                <span>' . __( 'Kaart', 'draad' ) . '</span>
                                <span>' . __( 'bekijken', 'draad' ) . '</span>
                            </span>
                        </button>

                        <button class="draad-tabs__tab button button--secondary ' . ( $empty ? '--empty' : '' ) . '" id="tab-' . $secondTabId . '" type="button" role="tab" aria-selected="true" aria-controls="tabpanel-' . $secondTabId . '">
                            ' . draad_maps_icon( 'list' ) . '
                            <span class="button__title">
                                <span>' . __( 'Lijst', 'draad' ) . '</span>
                                <span>' . __( 'bekijken', 'draad' ) . '</span>
                            </span>
                        </button>

                    </div>' : '';

                $output .= '
                    <div class="draad-tabs__panel" id="tabpanel-' . $firstTabId . '" role="tabpanel" aria-labelledby="tab-' . $firstTabId . '">
                        <div class="draad-maps" id="draad-maps-' . $mapId . '" ' . $attributes . '>

                            <div class="draad-maps__map" id="draad-maps-' . $mapId . '-map"></div>

                            <div class="draad-maps__instructions">
                                <p>' . __( 'Sleep met twee vingers om de kaart te bewegen.', 'draad' ) . '</p>
                            </div>';

                            $output .= $infowindowOutput ? '<div class="draad-maps__list" id="draad-maps-' . $mapId . '-list">'. $infowindowOutput .'</div>' : '';
                            $output .= $dataLayersOutput ? '<details class="draad-maps__legend"><summary>'. __( 'Legenda', 'draad' ) .'</summary>'. $dataLayersOutput . '</details>' : '';
                            $output .= $gps ? '<div class="draad-maps__layer" id="draad-maps-' . $mapId . '-gps"></div>' : '';
                            
                            $output .= '
                        </div>

                    </div>';

                    $output .= (isset($cardOutput) && !$empty) ? '
                        <div class="draad-tabs__panel" id="tabpanel-' . $secondTabId . '" role="tabpanel" aria-labelledby="tab-' . $secondTabId . '">
                            <div class="draad-grid ' . ( $empty ? '--empty' : '' ) . '">' . $cardOutput . '</div>
                        </div>' : '';

                    $output .= '
                </div>
            </div>
        ';

        return $output;
    }
}