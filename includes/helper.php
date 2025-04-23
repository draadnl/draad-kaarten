<?php

if ( ! function_exists( 'draad_maps_icon' ) ) {
    /**
     * Returns an SVG icon from the icons folder
     *
     * @since 1.0.0
     */
    function draad_maps_icon( $icon )
    {
        $iconPath = DRAAD_MAPS_PATH . 'template-parts/icons/' . $icon . '.svg';

        if ( ! file_exists( $iconPath ) ) {
            return '';
        }

        return file_get_contents( $iconPath );
    }
}

if ( !function_exists( 'draad_maps_get_properties' ) ) {
    /**
     * 
     */
    function draad_maps_get_properties( $data ) {

        $type = '';
        $breadcrumb = '';
        $properties = [];
        if ( isset( $data->features ) ) {
    
            if ( !isset( $data->features[0]->properties ) ) {
                error_log( 'Draad Kaarten | Error: "Invalid geojson"' );
                return false;
            }
    
            $type = 'geojson';
            $breadcrumb = 'features.*.properties';
            $properties = array_keys( (array) $data->features[0]->properties );
    
        } elseif ( isset( $data->result->fields ) ) {
            
            $type = 'api';
            $breadcrumb = 'result.records.*';
            $properties = array_column( (array) $data->result->fields, 'id' );
    
        } else {
            $type = 'custom';
        }
    
        return [ 'type' => $type, 'breadcrumb' => $breadcrumb, 'properties' => $properties ];
    }
}

if ( !function_exists( 'draad_maps_get_data' ) ) {
    /**
     * Retrieves json from given $endpoint
     *
     * @param string $endpoint
     * @param int $timeout
     * @return string
     */
    function draad_maps_get_data($endpoint, $timeout = 10) {

        if ( !$endpoint ) {
            error_log('Draad Kaarten | Error: "No enpoint provided."');
        }

        // If $endpoint is contains the current url use file_get_contents()
        if ( strpos( $endpoint, site_url() ) !== false ) {
            $file_path = $_SERVER['DOCUMENT_ROOT'] . str_replace(site_url(), '', $endpoint);

            if ( !file_exists($file_path) ) {
                error_log('Draad Kaarten | Error: "File not found: ' . $file_path . '"');
                return false;
            }

            return file_get_contents( $file_path );
        }

        $response = wp_remote_get($endpoint, [
            'timeout' => $timeout,
            'sslverify' => false,
        ]);

        if ( is_wp_error($response) ) {
            error_log('Draad Kaarten | Error: "Error retrieving remote data: ' . $response->get_error_message() . '"');
            return false;
        }

        return wp_remote_retrieve_body($response);
    }
}

if ( !function_exists( 'draad_maps_is_rd_coordinates' ) ) {
    /**
     * Checks if coordinates are RDnew
     * 
     * @param float $x
     * @param float $y
     * @return bool
     */
    function draad_maps_is_rd_coordinates( $x, $y ) : bool {

        if (!is_numeric($x) || !is_numeric($y)) {
            error_log( 'Draad Kaarten | Error: "draad_maps_is_rd_coordinates() retrieved unvalid coordinates."' );
        }

        return $x > 0 && $x < 300000 && $y > 300000 && $y < 620000;

    }
}

if ( !function_exists( 'draad_maps_rd_to_wgs' ) ) {
    /**
     * Convert RDnew Coordinates to WGS84
     * 
     * @param float $x
     * @param float $y
     * @return array
     */
    function draad_maps_rd_to_wgs( $x, $y ) : array {

        if (!is_numeric($x) || !is_numeric($y)) {
            error_log("rdToWgs84(): coordinates not valid");
            return false;
        }
    
        if ($x < 1000) {
            $x *= 1000;
        }
        if ($y < 1000) {
            $y *= 1000;
        }
    
        $x0 = 155000.0;
        $y0 = 463000.0;
    
        $f0 = 52.156160556;
        $l0 = 5.387638889;
    
        $a01 = 3236.0331637;
        $b10 = 5261.3028966;
        $a20 = -32.5915821;
        $b11 = 105.9780241;
        $a02 = -0.2472814;
        $b12 = 2.4576469;
        $a21 = -0.8501341;
        $b30 = -0.8192156;
        $a03 = -0.0655238;
        $b31 = -0.0560092;
        $a22 = -0.0171137;
        $b13 = 0.0560089;
        $a40 = 0.0052771;
        $b32 = -0.0025614;
        $a23 = -0.0003859;
        $b14 = 0.001277;
        $a41 = 0.0003314;
        $b50 = 0.0002574;
        $a04 = 0.0000371;
        $b33 = -0.0000973;
        $a42 = 0.0000143;
        $b51 = 0.0000293;
        $a24 = -0.000009;
        $b15 = 0.0000291;
    
        $dx = ($x - $x0) * pow(10, -5);
        $dy = ($y - $y0) * pow(10, -5);
    
        $df = $a01 * $dy +
              $a20 * pow($dx, 2) +
              $a02 * pow($dy, 2) +
              $a21 * pow($dx, 2) * $dy +
              $a03 * pow($dy, 3);
        $df += $a40 * pow($dx, 4) +
               $a22 * pow($dx, 2) * pow($dy, 2) +
               $a04 * pow($dy, 4) +
               $a41 * pow($dx, 4) * $dy;
        $df += $a23 * pow($dx, 2) * pow($dy, 3) +
               $a42 * pow($dx, 4) * pow($dy, 2) +
               $a24 * pow($dx, 2) * pow($dy, 4);
    
        $f = $f0 + $df / 3600;
    
        $dl = $b10 * $dx +
              $b11 * $dx * $dy +
              $b30 * pow($dx, 3) +
              $b12 * $dx * pow($dy, 2) +
              $b31 * pow($dx, 3) * $dy;
        $dl += $b13 * $dx * pow($dy, 3) +
               $b50 * pow($dx, 5) +
               $b32 * pow($dx, 3) * pow($dy, 2) +
               $b14 * $dx * pow($dy, 4);
        $dl += $b51 * pow($dx, 5) * $dy +
               $b33 * pow($dx, 3) * pow($dy, 3) +
               $b15 * $dx * pow($dy, 5);
    
        $l = $l0 + $dl / 3600;
    
        $fWgs = $f + (-96.862 - 11.714 * ($f - 52) - 0.125 * ($l - 5)) / 100000;
        $lWgs = $l + (-37.902 + 0.329 * ($f - 52) - 14.667 * ($l - 5)) / 100000;
    
        return [
            'lat' => $fWgs,
            'lon' => $lWgs
        ];

    }
}

if ( !function_exists( 'draad_maps_convert_coordinates' ) ) {
    /**
     * Convert RDnew coordinates to WGS84
     * 
     * @param array $data
     * @return array
     */
    function draad_maps_convert_coordinates( array $data) : array {

        if ( is_numeric( $data ) ) {
            return $data;
        }

        if ( is_array( $data[0] ) ) {
            $data = array_map( 'draad_maps_convert_coordinates', $data );
            return $data;
        }

        if ( is_numeric( $data[0] ) && is_numeric( $data[1] ) ) {
            if ( draad_maps_is_rd_coordinates( $data[0], $data[1] ) ) {
                $coords = draad_maps_rd_to_wgs( $data[0], $data[1] );
                return [ $coords['lon'], $coords['lat'] ];
            }
        }

        return $data;

    }
}

if ( !function_exists( 'ckanToGeoJson' ) ) {
    /**
     * Convert CKAN data to GeoJSON
     * 
     * @param string $json
     * @return string
     */
    function ckanToGeoJson ( string $json ) :string {

        $data = json_decode( $json, true );

        // Check if JSON is valid
        if ( json_last_error() !== JSON_ERROR_NONE ) {
            throw new \InvalidArgumentException( 'Invalid JSON: '. json_last_error_msg() );
        }

        // Check if JSON is already valid GeoJSON, if so return as is.
        if (isset($data['type'])) {
            switch ($data['type']) {
                case 'FeatureCollection':
                    if (isset($data['features']) && is_array($data['features'])) {
                        return $json;
                    }
                    break;
                case 'GeometryCollection':
                    if (isset($data['geometries']) && is_array($data['geometries'])) {
                        return $json;
                    }
                    break;
                case 'Feature':
                    if (array_key_exists('geometry', $data) && array_key_exists('properties', $data)) {
                        return $json;
                    }
                    break;
            }
        }

        // Check if JSON contains a "result" key and an array of records
        if (!isset($data['result']['records']) || !is_array($data['result']['records'])) {
            throw new \InvalidArgumentException('Expected top‐level result.records array.');
        }

        // Construct the GeoJSON FeatureCollection
        $geoJson = [
            'type'     => 'FeatureCollection',
            'features' => [],
        ];

        foreach ($data['result']['records'] as $record) {

            // Skip record if it has no 'wkb_geometry'
            if ( !isset( $record['wkb_geometry'] ) ) {
                continue;
            }

            $geometry = $record['wkb_geometry'];
            $geometry['coordinates'] = draad_maps_convert_coordinates( $geometry['coordinates'] );

            // Remove any coordinate reference system info that isn't needed.
            if (isset($geometry['crs'])) {
                unset($geometry['crs']);
            }

            $properties = $record;
            if ( isset( $properties['wkb_geometry'] ) ) {
                unset( $properties['wkb_geometry'] );
            }

            // Check and convert Multi geometries to single geometries.
            if (isset($geometry['type']) && isset($geometry['coordinates'])) {
                switch ($geometry['type']) {
                    case 'MultiPoint':
                        // Convert MultiPoint to Point by taking the first coordinate
                        if (isset($geometry['coordinates'][0])) {
                            $geometry['coordinates'] = $geometry['coordinates'][0];
                            $geometry['type'] = 'Point';
                        }
                        break;
                    case 'MultiLineString':
                        // Convert MultiLineString to LineString by taking the first set of coordinates
                        if (isset($geometry['coordinates'][0])) {
                            $geometry['coordinates'] = $geometry['coordinates'][0];
                            $geometry['type'] = 'LineString';
                        }
                        break;
                    case 'MultiPolygon':
                        // Convert MultiPolygon to Polygon by taking the first polygon's coordinates
                        if (isset($geometry['coordinates'][0])) {
                            $geometry['coordinates'] = $geometry['coordinates'][0];
                            $geometry['type'] = 'Polygon';
                        }
                        break;
                }
            }

            // Construct GeoJSON Feature
            $feature = [
                'type' => 'Feature',
                'geometry' => $geometry,
                'properties' => $properties,
            ];

            $geoJson['features'][] = $feature;

        }

        // Pretty‐print & unescape slashes/unicode for readability
        return json_encode(
            $geoJson ,
            JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
        );

    }
}

if ( !function_exists( 'draad_maps_populate_infowindow' ) ) {
    /**
     * Populate dataset content repeater with keys from feature properties
     */
    function draad_maps_populate_infowindow( $post_id ) {

        $post = get_post( $post_id );

        if ( !$post ) {
            error_log( 'Draad Kaarten | draad_maps_populate_infowindow() - no post found' );
            return;
        }

        setup_postdata( $post );

        $datasets = get_field( 'datasets' );
        if ( !is_iterable( $datasets ) || empty( $datasets ) ) {
            error_log( 'Draad Kaarten | draad_maps_populate_infowindow() - no datasets found' );
            return;
        }

        $newFieldValue = [];
        foreach ( $datasets as $index => $dataset ) {
            
            $newFieldValue[] = $dataset;

            $endpoint = $dataset['type_dataset'] === 'api' ? $dataset['api_endpoint'] : ( $dataset['type_dataset'] === 'file' ? wp_get_attachment_url( $dataset['file'] ) : '' );
            $data = draad_maps_get_data( $endpoint );

            if ( !$data ) {
                continue;
            }

            $data = json_decode( $data );

            $properties = draad_maps_get_properties( $data );

            /* When the infowindow content is not empty leave it as is. */
            if ( is_iterable( $dataset['infowindow_content'] ) && !empty( $dataset['infowindow_content'] ) ) {
                continue;
            }

            $newFieldValue[$index]['infowindow_breadcrumbs'] = $properties['type'];
            $newFieldValue[$index]['infowindow_custom_breadcrumbs'] = $properties['breadcrumb'];
            $newFieldValue[$index]['infowindow_content'] = [];

            foreach ( $properties['properties'] as $key ) {
            
                $newFieldValue[$index]['infowindow_content'][] = [
                    'label' => '',
                    'key' => $key
                ];

            }
            
        }

        update_field( 'field_66e289800b7ab', $newFieldValue, $post->ID );

        return;

    }
}
