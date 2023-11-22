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
			'/delete_test_key/',
			array(
				'methods'             => \WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete_test' ),
				'args'                => array(),
				'permission_callback' => function( \WP_REST_Request $request ) {
					return current_user_can('manage_options');
				},
			)
		);

		register_rest_route(
			$namespace,
			'/save_test_key/',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'save_test' ),
				'args'                => array(
					'test_key' => [
						'description' => 'Test API key.',
						'type'        => 'string',
						'required'    => true,
						'sanitize_callback' => 'sanitize_text_field',
					],
				),
				'permission_callback' => function( \WP_REST_Request $request ) {
					return current_user_can('manage_options');
				},
			)
		);

		register_rest_route(
			$namespace,
			'/activate/',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'activate_key' ),
				'args'                => array(
					'license_key' => [
						'description' => 'License key.',
						'type'        => 'string',
						'required'    => true,
						'sanitize_callback' => 'sanitize_text_field',
					],
					'instance_name' => [
						'description' => 'Instance name for the activation.',
						'type'        => 'string',
						'required'    => true,
						'sanitize_callback' => 'sanitize_text_field',
					],
				),
				'permission_callback' => function( \WP_REST_Request $request ) {
					return true;
				},
			)
		);

		register_rest_route(
			$namespace,
			'/deactivate/',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'deactivate_key' ),
				'args'                => array(
					'license_key' => [
						'description' => 'License key.',
						'type'        => 'string',
						'required'    => true,
						'sanitize_callback' => 'sanitize_text_field',
					],
					'instance_id' => [
						'description' => 'Instance ID of the existing activation.',
						'type'        => 'string',
						'required'    => true,
						'sanitize_callback' => 'sanitize_text_field',
					],
				),
				'permission_callback' => function( \WP_REST_Request $request ) {
					return true;
				},
			)
		);

		register_rest_route(
			$namespace,
			'/stores/',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_stores' ),
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
	 * Delete Test API key.
	 *
	 * @param \WP_REST_Request $request Full data about the request.
	 * @return \WP_Error|\WP_REST_Request
	 */
	public function delete_test( $request ) {

		$deleted = delete_option( 'lsq_api_key_test' );

		return new \WP_REST_Response(
			array(
				'success' => $deleted,
			),
			$deleted ? 200 : 400
		);
	}

	/**
	 * Save Test API key with Lemon Squeezy API.
	 *
	 * @param \WP_REST_Request $request Full data about the request.
	 * @return \WP_Error|\WP_REST_Request
	 */
	public function save_test( $request ) {
		$test_key = $request->get_param('test_key');

		$response = wp_remote_get(
			LSQ_API_URL . '/v1/users/me',
			array(
				'headers' => array(
					'Authorization' => 'Bearer ' . $test_key,
					'Accept'        => 'application/vnd.api+json',
					'Content-Type'  => 'application/vnd.api+json',
					'Cache-Control' => 'no-cache',
				),
			)
		);

		$is_valid = false;

		if ( ! is_wp_error( $response ) ) {
			if ( 200 === wp_remote_retrieve_response_code( $response ) ) {
				$is_valid = true;

				$body = json_decode( $response['body'] );
				$user = $body->data;
				update_option( 'lsq_api_key_test', $test_key );
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
	 * Activate license key through Lemon Squeezy API.
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function activate_key( $request ) {
		$license_key   = $request->get_param( 'license_key' );
		$instance_name = $request->get_param( 'instance_name' );
		$is_valid      = false;
		$error_message = '';
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

		$response = wp_remote_post(
			LSQ_API_URL . "/v1/licenses/activate?license_key=${license_key}&instance_name={$instance_name}",
			array(
				'headers' => array(
					'Authorization' => 'Bearer ' . $api_key,
					'Accept'        => 'application/vnd.api+json',
					'Content-Type'  => 'application/vnd.api+json',
					'Cache-Control' => 'no-cache',
				),
			)
		);

		$body = json_decode( $response['body'], true);

		if ( ! is_wp_error( $response ) ) {
			if ( 200 === wp_remote_retrieve_response_code( $response ) ) {
				$is_valid = true;
			} else {
				$error_message = isset($body['error']) ? $body['error'] : wp_remote_retrieve_response_message( $response );
			}
		} else {
			$error_message = $response->get_error_message();
		}

		return new \WP_REST_Response(
			array(
				'success' => $is_valid,
				'error'   => $error_message,
				'data'    => $body,
			),
			$is_valid ? 200 : 400
		);
	}

	/**
	 * Deactivate license key through Lemon Squeezy API.
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function deactivate_key( $request ) {
		$license_key   = $request->get_param( 'license_key' );
		$instance_name = $request->get_param( 'instance_id' );
		$is_valid      = false;
		$error_message = null;
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

		$response = wp_remote_post(
			LSQ_API_URL . "/v1/licenses/deactivate?license_key=${license_key}&instance_id={$instance_name}",
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
			$body = json_decode( $response['body'], true);
			if ( 200 === wp_remote_retrieve_response_code( $response ) ) {
				$is_valid = $body['deactivated'];
			} else {
				$error_message = isset($body['error']) ? $body['error'] : wp_remote_retrieve_response_message( $response );
			}
		} else {
			$error_message = $response->get_error_message();
		}

		return new \WP_REST_Response(
			array(
				'success' => $is_valid,
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
	public function get_stores( $request ) {
		// Check LS API connection.
		$api_key       = get_option( 'lsq_api_key' );
		$error_message = '';

		if ( ! isset( $api_key ) || empty( $api_key ) ) {
			return new \WP_REST_Response(
				array(
					'success'    => false,
					'error'      => __( 'Unauthorized request', 'lemon-squeezy' ),
					'error_code' => 'unauthorized',
				),
				401
			);
		}

		// Get stores.
		$response = wp_remote_get(
			LSQ_API_URL . '/v1/stores/',
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
				$store_data = json_decode( $response['body'] );

				// Build product list.
				if ( isset( $store_data ) && ! empty( $store_data ) ) {
					foreach ( $store_data->data as $store ) {
						$stores[] = array(
							'label' => $store->attributes->name,
							'value' => $store->id,
						);
					}
				}

				return new \WP_REST_Response(
					array(
						'success' => true,
						'stores'  => $stores,
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
				'success'    => false,
				'error'      => $error_message,
				'error_code' => 'api_error',
			),
			400
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
					'success'    => false,
					'error'      => __( 'Unauthorized request', 'lemon-squeezy' ),
					'error_code' => 'unauthorized',
				),
				401
			);
		}

		$store_id  = filter_var( $request->get_param( 'store_id' ), FILTER_SANITIZE_STRING );
		$page_size = rawurlencode( 'page[size]' );

		$response = wp_remote_get(
			LSQ_API_URL . "/v1/stores/{$store_id}/products?" . $page_size . "=100",
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

				foreach ( $product_data->data as $product ) {
					if ( $product->attributes->status !== 'published' ) {
						continue;
					}

					$products[] = array(
						'label' => $product->attributes->name,
						'value' => $product->attributes->buy_now_url,
					);
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
				'success'    => false,
				'error'      => $error_message,
				'error_code' => 'api_error',
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
		$api_key = get_option( 'lsq_api_key' );

		if ( empty( $api_key ) ) {
			return new \WP_REST_Response(
				array(
					'success'    => false,
					'error'      => __( 'Unauthorized request', 'lemon-squeezy' ),
					'error_code' => 'unauthorized',
				),
				401
			);
		}

		$license_key = filter_var( $request->get_param( 'license_key' ), FILTER_SANITIZE_STRING );
		if ( empty( $license_key ) ) {
			return new \WP_REST_Response(
				array(
					'success'    => false,
					'error'      => __( 'Missing license_key', 'lemon-squeezy' ),
					'error_code' => 'missing_license_key',
				),
				401
			);
		}

		$lsq_updater = new LSQ_Updater();

		$license = $lsq_updater->get_license( $license_key );
		if ( empty( $license->valid ) || empty( $license->license_key->id ) ) {
			return new \WP_REST_Response(
				array(
					'success'    => false,
					'error'      => __( 'Invalid license_key', 'lemon-squeezy' ),
					'error_code' => 'invalid_license_key',
				),
				401
			);
		}

		$license_key_obj = $lsq_updater->get_license_key( $license->license_key->id );
		if ( empty( $license_key_obj ) || empty( $license_key_obj->data->relationships->{'order-item'}->data ) ) {
			return new \WP_REST_Response(
				array(
					'success'    => false,
					'error'      => __( 'Error fetching license_key', 'lemon-squeezy' ),
					'error_code' => 'error_fetching_license_key',
				),
				400
			);
		}

		$order_item = $lsq_updater->relation_from_license_key( $license_key_obj, 'order-item' );
		if ( ! $order_item ) {
			return new \WP_REST_Response(
				array(
					'success'    => false,
					'error'      => __( 'Invalid order item', 'lemon-squeezy' ),
					'error_code' => 'invalid_order_item',
				),
				400
			);
		}

		$files = $lsq_updater->get_files( $order_item->attributes->variant_id );
		if ( empty( $files->data ) ) {
			return new \WP_REST_Response(
				array(
					'success'    => false,
					'error'      => __( 'Missing files', 'lemon-squeezy' ),
					'error_code' => 'missing_files',
				),
				400
			);
		}

		$sorted_files = $lsq_updater->sort_files_by_version( $files->data );
		$latest_file = array_pop( $sorted_files );
		if ( empty( $latest_file->attributes->version ) ) {
			return new \WP_REST_Response(
				array(
					'success'    => false,
					'error'      => __( 'Missing file version', 'lemon-squeezy' ),
					'error_code' => 'missing_file_version',
				),
				400
			);
		}

		$store = $lsq_updater->relation_from_license_key( $license_key_obj, 'store' );
		$product = $lsq_updater->relation_from_license_key( $license_key_obj, 'product' );

		return new \WP_REST_Response(
			array(
				'success' => true,
				'error'   => '',
				'error_code' => '',
				'update' => array(
					'version'        => $latest_file->attributes->version,
					'tested'         => null,
					'requires'       => null,
					'author'         => $store ? $store->attributes->name : null,
					'author_profile' => $store ? $store->attributes->url : null,
					'download_link'  => $latest_file->attributes->download_url,
					'trunk'          => $latest_file->attributes->download_url,
					'requires_php'   => null,
					'last_updated'   => null,
					'sections' => array(
						'description' => $product ? $product->attributes->description : null,
						'changelog'   => $latest_file->attributes->version,
					),
				),
			),
			200
		);
	}
}
