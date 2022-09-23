<?php

namespace lemonsqueezy;

class LSQ_Updater {

	/**
	 * @param string $license_key
	 * @return object
	 */
	public function get_license( $license_key ) {
		$api_key = get_option( 'lsq_api_key' );

		$response = wp_remote_post(
			LSQ_API_URL . '/v1/licenses/validate/',
			array(
				'headers' => array(
					'Authorization' => 'Bearer ' . $api_key,
					'Accept'        => 'application/json',
					'Cache-Control' => 'no-cache',
				),
				'body' => array(
					'license_key' => $license_key,
				),
			)
		);

		if ( is_wp_error( $response ) ||
			200 !== wp_remote_retrieve_response_code( $response ) ) {
			return array();
		}

		return json_decode( wp_remote_retrieve_body( $response ) );
	}

	/**
	 * @param string $license_key
	 * @return object
	 */
	public function get_license_key( $license_id ) {
		$api_key = get_option( 'lsq_api_key' );

		$response = wp_remote_get(
			LSQ_API_URL . "/v1/license-keys/{$license_id}/?include=store,product,order-item",
			array(
				'headers' => array(
					'Authorization' => 'Bearer ' . $api_key,
					'Accept'        => 'application/vnd.api+json',
					'Content-Type'  => 'application/vnd.api+json',
					'Cache-Control' => 'no-cache',
				),
			)
		);

		if ( is_wp_error( $response ) ||
			200 !== wp_remote_retrieve_response_code( $response ) ) {
			return array();
		}

		return json_decode( wp_remote_retrieve_body( $response ) );
	}

	/**
	 * @param object $license_key
	 * @return object
	 */
	public function relation_from_license_key( $license_key, $relation_key ) {
		$relation_type = $license_key->data->relationships->{$relation_key}->data->type;
		$relation_id = $license_key->data->relationships->{$relation_key}->data->id;

		foreach ( $license_key->included as $relation ) {
			if ( $relation->type === $relation_type && $relation->id === $relation_id ) {
				return $relation;
			}
		}

		return null;
	}

	/**
	 * @param string $variant_id
	 * @return object
	 */
	public function get_files( $variant_id ) {
		$api_key = get_option( 'lsq_api_key' );

		$response = wp_remote_get(
			LSQ_API_URL . "/v1/variants/{$variant_id}/files/?sort=-id&page[size]=100",
			array(
				'headers' => array(
					'Authorization' => 'Bearer ' . $api_key,
					'Accept'        => 'application/vnd.api+json',
					'Content-Type'  => 'application/vnd.api+json',
					'Cache-Control' => 'no-cache',
				),
			)
		);

		if ( is_wp_error( $response ) ||
			200 !== wp_remote_retrieve_response_code( $response ) ) {
			return array();
		}

		return json_decode( wp_remote_retrieve_body( $response ) );
	}

	/**
	 * @param array $files
	 * @return array
	 */
	public function sort_files_by_version( $files ) {
		usort(
			$files,
			function( $a, $b ) {
				return version_compare( $a->attributes->version, $b->attributes->version );
			}
		);

		return $files;
	}
}
