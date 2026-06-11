<?php

$map_id = function_exists( 'get_field' ) ? (int) get_field( 'map' ) : 0;

if ( ! $map_id ) {
    return;
}

echo draad_maps_renderer( '', [ 'map' => $map_id ] );
