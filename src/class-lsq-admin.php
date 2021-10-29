<?php

namespace lemonsqueezy;

/**
 * Class to handle the admin area of the lemon squeezy plugin.
 */
class LSQ_Admin {
	/**
	 * Contains instance or null
	 *
	 * @var object|null
	 */
	private static $instance = null;

	/**
	 * Returns instance of LSQ_Admin.
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
	 * Constructor for LSQ_Admin.
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'add_option_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'add_admin_assets' ) );
		add_action( 'init', array( $this, 'register_settings' ) );
	}

	/**
	 * Is this a LSQ admin page?
	 *
	 * @return bool
	 */
	public static function is_admin() {
		global $current_screen;

		if ( ! $current_screen ) {
			return false;
		}

		return 'toplevel_page_lemonsqueezy' === $current_screen->id;
	}

	/**
	 * Enqueue admin assets.
	 *
	 * @return void
	 */
	public function add_admin_assets() {
		if ( ! self::is_admin() ) {
			return;
		}

		wp_enqueue_script( 'lemonsqueezy-admin-script', LSQ_URL . '/dist/admin.js', array( 'wp-api', 'wp-i18n', 'wp-components', 'wp-element' ), '1.0', true );
		wp_enqueue_style( 'lemonsqueezy-admin-style', LSQ_URL . '/dist/admin.css', array( 'wp-edit-blocks' ), '1.0' );
	}

	/**
	 * Callback for outputting lemon squeezy options page.
	 *
	 * @return void
	 */
	public function menu_callback() {
		?>
		<div id="lsq-plugin"></div>
		<style>
			.lsq-logo { background-image: url("<?php echo esc_url( LSQ_URL . '/images/ls-logo.svg' ); ?>"); }
		</style>
		<?php
	}

	/**
	 * Register options page.
	 *
	 * @return void
	 */
	public function add_option_menu() {
		$hook_suffix = add_menu_page(
			'Lemon Squeezy',
			'Lemon Squeezy',
			'manage_options',
			'lemonsqueezy',
			array( $this, 'menu_callback' ),
			LSQ_URL . '/images/ls-icon.svg',
			60
		);

		add_action( 'load-' . $hook_suffix, array( $this, 'load_page_hook' ) );
	}

	/**
	 * Register settings fpr the otions page.
	 *
	 * @return void
	 */
	public function register_settings() {
		if ( ! session_id() ) {
			session_start();
		}

		register_setting(
			'lsq_admin_settings',
			'lsq_api_key',
			array(
				'type'         => 'string',
				'show_in_rest' => true,
			)
		);
	}

	/**
	 * Processing the settings page.
	 *
	 * @return void
	 */
	public function load_page_hook() {
		if ( ! empty( $_GET['oauth_authorize'] ) ) {
			if ( empty( $_SESSION['lsq_oauth_code'] ) ) {
				$_SESSION['lsq_oauth_code'] = wp_generate_password( 40, false );
			}
			if ( empty( $_SESSION['lsq_oauth_code_verifier'] ) ) {
				$_SESSION['lsq_oauth_code_verifier'] = wp_generate_password( 128, false );
			}

			$code_challenge = strtr(
				rtrim(
					base64_encode( hash( 'sha256', $_SESSION['lsq_oauth_code_verifier'], true ) ),
					'='
				),
				'+/',
				'-_'
			);

			$query = http_build_query(
				array(
					'client_id' => LSQ_OAUTH_CLIENT_ID,
					'redirect_uri' => admin_url( 'admin.php?page=lemonsqueezy&oauth_callback=1' ),
					'response_type' => 'code',
					'scope' => '',
					'state' => $_SESSION['lsq_oauth_code'],
					'code_challenge' => $code_challenge,
					'code_challenge_method' => 'S256',
				)
			);

			wp_redirect( LSQ_APP_URL . '/oauth/authorize?' . $query );
			exit;
		}

		if ( ! empty( $_GET['oauth_callback'] ) ) {
			if ( ! empty( $_SESSION['lsq_oauth_code'] ) && ! empty( $_SESSION['lsq_oauth_code_verifier'] ) ) {
				$code = isset( $_GET['code'] ) ? filter_var( $_GET['code'], FILTER_SANITIZE_STRING ) : null;
				$state = isset( $_GET['state'] ) ? filter_var( $_GET['state'], FILTER_SANITIZE_STRING ) : null;

				if ( $_SESSION['lsq_oauth_code'] !== $state || ! $code ) {
					return new \WP_Error( 'error', __( 'Invalid state/code', 'lemon-squeezy' ) );
				}

				$response = wp_remote_post(
					LSQ_APP_URL . '/oauth/token',
					array(
						'body' => array(
							'grant_type' => 'authorization_code',
							'client_id' => LSQ_OAUTH_CLIENT_ID,
							'redirect_uri' => admin_url( 'admin.php?page=lemonsqueezy&oauth_callback=1' ),
							'code_verifier' => $_SESSION['lsq_oauth_code_verifier'],
							'code' => $code,
						),
					)
				);

				if ( is_wp_error( $response ) ) {
					return $response;
				} else {
					echo 'Response:<pre>';
					print_r( json_decode( $response['body'] ) );
					echo '</pre>';
				}
			}
		}
	}
}
