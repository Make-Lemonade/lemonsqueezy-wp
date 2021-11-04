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
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'validate_key' ),
				'args'                => array(),
				'permission_callback' => function( \WP_REST_Request $request ) {
					return true;
				},
			)
		);

		register_rest_route(
			$namespace,
			'/products/',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_products' ),
				'args'                => array(),
				'permission_callback' => function( \WP_REST_Request $request ) {
					return true;
				},
			)
		);

		register_rest_route(
			$namespace,
			'/update/',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_update' ),
				'args'                => array(),
				'permission_callback' => function( \WP_REST_Request $request ) {
					return true;
				},
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
		$user          = null;
		$error_message = '';

		if ( ! isset( $api_key ) || empty( $api_key ) ) {
			return new \WP_REST_Response(
				array(
					'success' => $is_valid,
					'user' => $user,
					'error'   => __( 'Unauthorized request', 'lemon-squeezy' ),
				),
				401
			);
		}

		$response = wp_remote_get(
			LSQ_API_URL . '/v1/users/me',
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

				$body = json_decode( $response['body'] );
				$user = $body->data;
			} else {
				$error_message = wp_remote_retrieve_response_message( $response );
			}
		} else {
			$error_message = $response->get_error_message();
		}

		return new \WP_REST_Response(
			array(
				'success' => $is_valid,
				'user' => $user,
				'error'   => $error_message,
			),
			$is_valid ? 200 : 400
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

		if ( ! isset( $api_key ) || empty( $api_key ) ) {
			return new \WP_REST_Response(
				array(
					'success' => false,
					'error'   => __( 'Unauthorized request', 'lemon-squeezy' ),
				),
				401
			);
		}

		$response = wp_remote_get(
			LSQ_API_URL . '/v1/products/',
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
			400
		);
	}

	/**
	 * Validate and return a software update from the Lemon Squeezy API.
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return WP_Error|WP_REST_Request
	 */
	public function get_update( $request ) {
		$api_key       = get_option( 'lsq_api_key' );
		if ( empty( $api_key ) ) {
			return new \WP_REST_Response(
				array(
					'success' => false,
					'error'   => __( 'Unauthorized request', 'lemon-squeezy' ),
				),
				401
			);
		}

		$license_key = filter_var( $request->get_param( 'license_key' ), FILTER_SANITIZE_STRING );
		if ( empty( $license_key ) ) {
			return new \WP_REST_Response(
				array(
					'success' => false,
					'error'   => __( 'Missing license_key', 'lemon-squeezy' ),
				),
				401
			);
		}

		$lsq_updater = new LSQ_Updater();

		$license = $lsq_updater->get_license( $license_key );
		if ( empty( $license->valid ) || empty( $license->license_key->id ) ) {
			return new \WP_REST_Response(
				array(
					'success' => false,
					'error'   => __( 'Invalid license_key', 'lemon-squeezy' ),
				),
				401
			);
		}

		$license_key_obj = $lsq_updater->get_license_key( $license->license_key->id );
		if ( empty( $license_key_obj ) ) {
			return new \WP_REST_Response(
				array(
					'success' => false,
					'error'   => __( 'Error fetching license_key', 'lemon-squeezy' ),
				),
				401
			);
		}

		return new \WP_REST_Response(
			array(
				'success' => false,
				'error'   => $error_message,
			),
			400
		);
	}
}
