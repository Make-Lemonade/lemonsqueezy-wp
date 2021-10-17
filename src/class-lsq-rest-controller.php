<?php

namespace lemonsqueezy;

/**
 * Class to handle the rest api requests of the lemon squeezy plugin.
 */
class LSQ_Rest_Controller {
	/**
	 * Contains instance or null
	 *
	 * @var object|null
	 */
	private static $instance = null;

	/**
	 * Returns instance of LSQ_Rest_Controller.
	 *
	 * @return object
	 */
	public static function get_instance() {

		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Constructor for LSQ_Rest_Controller.
	 */
	public function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register the routes for the objects of the controller.
	 */
	public function register_routes() {
		$namespace = 'lsq/v1';

		register_rest_route(
			$namespace,
			'/validate/',
			array(
				array(
					'methods'  => \WP_REST_Server::READABLE,
					'callback' => array( $this, 'validate_key' ),
					'args'     => array(),
				),
			)
		);

		register_rest_route(
			$namespace,
			'/products/',
			array(
				array(
					'methods'  => \WP_REST_Server::READABLE,
					'callback' => array( $this, 'get_products' ),
					'args'     => array(),
				),
			)
		);
	}

	/**
	 * Validate API key with Lemon Squeezy API.
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return WP_Error|WP_REST_Request
	 */
	public function validate_key( $request ) {
		// Check LS API connection.
		$api_key       = get_option( 'lsq_api_key' );
		$is_valid      = false;
		$error_message = '';

		$response = wp_remote_get(
			'https://api.lemonsqueezy.com/v1/stores/',
			array(
				'headers' => array(
					'Authorization' => 'Bearer ' . $api_key,
					'Accept'        => 'application/vnd.api+json',
					'Content-Type'  => 'application/vnd.api+json',
					'Cache-Control' => 'no-cache',
				),
			)
		);

		if ( ! is_wp_error( $response ) ) {
			if ( 200 === wp_remote_retrieve_response_code( $response ) ) {
				$is_valid = true;
			} else {
				$error_message = wp_remote_retrieve_response_message( $response );
			}
		} else {
			$error_message = $response->get_error_message();
		}

		// Now return the result to our endpoint.
		if ( $is_valid ) {
			return new \WP_REST_Response( array( 'success' => true ), 200 );
		}
		return new \WP_REST_Response(
			array(
				'success' => false,
				'error'   => $error_message,
			),
			200
		);
	}

	/**
	 * Get products from the Lemon Squeezy API.
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return WP_Error|WP_REST_Request
	 */
	public function get_products( $request ) {
		// Check LS API connection.
		$api_key       = get_option( 'lsq_api_key' );
		$error_message = '';

		$response = wp_remote_get(
			'https://api.lemonsqueezy.com/v1/products/',
			array(
				'headers' => array(
					'Authorization' => 'Bearer ' . $api_key,
					'Accept'        => 'application/vnd.api+json',
					'Content-Type'  => 'application/vnd.api+json',
					'Cache-Control' => 'no-cache',
				),
			)
		);

		if ( ! is_wp_error( $response ) ) {
			if ( 200 === wp_remote_retrieve_response_code( $response ) ) {
				$product_data = json_decode( $response['body'] );
				$products     = array();

				// TODO: handle pagination.

				// Todo handle variations.

				// Build product list.
				if ( isset( $product_data ) && ! empty( $product_data ) ) {
					foreach ( $product_data->data as $product ) {
						$products[] = array(
							'label' => $product->attributes->name,
							'value' => $product->attributes->buy_now_url,
						);
					}
				}

				return new \WP_REST_Response(
					array(
						'success'  => true,
						'products' => $products,
					),
					200
				);
			} else {
				$error_message = wp_remote_retrieve_response_message( $response );
			}
		} else {
			$error_message = $response->get_error_message();
		}

		return new \WP_REST_Response(
			array(
				'success' => false,
				'error'   => $error_message,
			),
			200
		);
	}
}
