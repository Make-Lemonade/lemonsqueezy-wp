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
        add_filter( 'option_lsq_api_key', array( $this, 'maybe_return_test_key' ) );
	}

	/**
     * Maybe return Test API key.
     *
	 * @param string $api_key API Key.
	 *
	 * @return mixed
	 */
    public function maybe_return_test_key( $api_key ) {
        $test_key = get_option( 'lsq_api_key_test' );

        if ( ! $test_key ) {
            return $api_key;
        }

        return $test_key;
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

		wp_enqueue_script( 'lemonsqueezy-admin-script' );
		wp_enqueue_style( 'lemonsqueezy-admin-style' );

		wp_localize_script( 'lemonsqueezy-admin-script', 'Lemonsqueezy', array(
			'oauth_url' => admin_url( 'admin.php?page=lemonsqueezy&oauth_authorize=1' ),
            'nonce'     => wp_create_nonce('wp_rest')
		) );
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

		wp_register_script( 'lemonsqueezy-admin-script', LSQ_URL . '/build/admin.js', array( 'wp-api', 'wp-i18n', 'wp-components', 'wp-element' ), '1.0', true );
		wp_register_style( 'lemonsqueezy-admin-style', LSQ_URL . '/build/admin.css', array( 'wp-edit-blocks' ), '1.0' );

		add_action( 'load-' . $hook_suffix, array( $this, 'load_page_hook' ) );
	}

	/**
	 * Register settings fpr the otions page.
	 *
	 * @return void
	 */
	public function register_settings() {
		register_setting(
			'lsq_admin_settings',
			'lsq_api_key',
			array(
				'type'         => 'string',
				'show_in_rest' => true,
			)
		);

		register_setting(
			'lsq_admin_settings',
			'lsq_api_key_test',
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
		if ( ! session_id() ) {
			session_start();
		}

		$redirect_uri = admin_url( 'admin.php?page=lemonsqueezy&oauth_callback=1' );
		$lsq_oauth = new LSQ_OAuth( LSQ_OAUTH_CLIENT_ID, $redirect_uri );
		$lsq_oauth->handle_authorize();
		$lsq_oauth->handle_callback();

		session_write_close();
	}
}
