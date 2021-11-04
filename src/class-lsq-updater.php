<?php

namespace lemonsqueezy;

class LSQ_Updater {

	/**
	 * @param string $license_key
	 * @return array
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
	 * @return array
	 */
	public function get_license_key( $license_id ) {
		$api_key = get_option( 'lsq_api_key' );

		$response = wp_remote_get(
			LSQ_API_URL . "/v1/license-keys/{$license_id}/",
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
}
