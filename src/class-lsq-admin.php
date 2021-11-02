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
			session_start(
				array(
					'read_and_close' => true,
				)
			);
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
		$redirect_uri = admin_url( 'admin.php?page=lemonsqueezy&oauth_callback=1' );
		$lsq_oauth = new LSQ_OAuth( LSQ_OAUTH_CLIENT_ID, $redirect_uri );
		$lsq_oauth->handle_authorize();
		$lsq_oauth->handle_callback();
	}
}
