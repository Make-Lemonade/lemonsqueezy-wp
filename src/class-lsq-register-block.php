<?php

namespace lemonsqueezy;

/**
 * Class to handle rest api connections of the lemon squeezy plugin.
 */
class LSQ_Register_Block {
	/**
	 * Contains instance or null
	 *
	 * @var object|null
	 */
	private static $instance = null;

	/**
	 * Returns instance of LSQ_Rest.
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
	 * Constructor for LSQ_Register_Block.
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'register_blocks' ) );
		add_filter( 'render_block', array( $this, 'filter_button_block_markup' ), 10, 2 );
		add_filter( 'block_categories_all', array( $this, 'add_block_categories' ), 10, 2 );
	}

	/**
	 * Register block category.
	 *
	 * @param array  $categories given categories.
	 * @param object $post current post.
	 * @return array
	 */
	public function add_block_categories( $categories, $post ) {
		return array_merge(
			$categories,
			array(
				array(
					'slug'  => 'lemonsqueezy',
					'title' => __( 'Lemon Squeezy', 'lemonsqueezy' ),
					'icon'  => 'wordpress',
				),
			)
		);
	}

	/**
	 * Register block types.
	 *
	 * @param string $block current block.
	 * @param array  $options list of options.
	 * @return void
	 */
	public function register_block_type( $block, $options = array() ) {
		register_block_type(
			'lemonsqueezy/' . $block,
			array_merge(
				array(
					'editor_script' => 'lemonsqueezy-editor-script',
					'editor_style'  => 'lemonsqueezy-editor-style',
					'script'        => 'lemonsqueezy-script',
					'style'         => 'lemonsqueezy-style',
				),
				$options
			)
		);
	}

	/**
	 * Register lemon squeezy blocks and enqueue assets.
	 *
	 * @return void
	 */
	public function register_blocks() {
		wp_register_script( 'lemonsqueezy-editor-script', LSQ_URL . '/build/editor.js', array( 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor', 'wp-components', 'lodash', 'wp-blob', 'wp-data', 'wp-html-entities', 'wp-compose', 'wp-block-editor' ), '1.0.0', true );
		wp_add_inline_script( 'lemonsqueezy-editor-script', 'var lsData = ' . wp_json_encode( array( 'settings_url' => admin_url( 'admin.php?page=lemonsqueezy' ) ) ), 'before' );
		wp_register_script( 'lemonsqueezy-script', LSQ_URL . '/build/script.js', array(), '1.0.0', true );
		wp_register_style( 'lemonsqueezy-style', LSQ_URL . '/build/style-script.css', array(), '1.0.0' );
		wp_register_style( 'lemonsqueezy-editor-style', LSQ_URL . '/build/editor.css', array( 'wp-edit-blocks' ), '1.0.0' );

		$this->register_block_type( 'button' );
		$this->register_block_type( 'ls-button' );

	}

	/**
	 * Add button size class.
	 *
	 * @param  string $block_content Block content to be rendered.
	 * @param  array  $block         Block attributes.
	 * @return string
	 */
	public function filter_button_block_markup( $block_content = '', $block = array() ) {

		if ( isset( $block['blockName'] ) && 'core/button' === $block['blockName'] ) {
			$args = wp_parse_args( $block['attrs'] );

			if ( empty( $args['product'] ) ) {
				return $block_content;
			}

			// If overlay is activated we have to include the script and add parameter to URL.
			if ( ! empty( $args['overlay'] ) ) {
				wp_enqueue_script( 'lemonsqueezy-checkout', 'https://app.lemonsqueezy.com/js/checkout.js', array(), null, true );
			}

			$purchase_link = $this->get_purchase_link( $args, $block );

			$existing_href = $this->get_link_from_button( $block_content );

			if ( $existing_href ) {
				$block_content = str_replace( 'href="' . $existing_href . '"', 'href="' . $purchase_link . '"', $block_content );
			} else {
				// No href in sight.
				$block_content = str_replace( 'class="wp-block-button__link', ' href="' . $purchase_link . '" class="wp-block-button__link', $block_content );
			}

			if ( ! empty( $args['overlay'] ) ) {
				$block_content = str_replace( 'class="wp-block-button__link', 'class="wp-block-button__link lemonsqueezy-button ', $block_content );
			}
		}

		if ( isset( $block['blockName'] ) && 'lemonsqueezy/ls-button' === $block['blockName'] ) {
			$args = wp_parse_args( $block['attrs'] );

			if ( ! empty( $args['overlay'] ) ) {
				wp_enqueue_script( 'lemonsqueezy-checkout', 'https://app.lemonsqueezy.com/js/checkout.js', array(), null, true );
			}

			$existing_href = $this->get_link_from_button( $block_content );
			$purchase_link = $this->get_purchase_link( $args, $block );

			if ( $existing_href ) {
				$block_content = str_replace( 'href="' . $existing_href . '"', 'href="' . $purchase_link . '"', $block_content );
			} else {
				// No href in sight.
				$block_content = str_replace( 'class="wp-block-button__link', ' href="' . $purchase_link . '" class="wp-block-button__link', $block_content );
			}
		}

		return $block_content;
	}

	protected function get_purchase_link( $args, $block ) {
		if ( empty( $args['product'] ) ) {
			return false;
		}

		$link = $args['product'];

		if ( ! empty( $args['overlay'] ) && $args['overlay'] ) {
			$link = add_query_arg( 'embed', '1', $link );
		}

		$args = apply_filters( 'lemonsqueezy_purchase_link_args', $args, $block );

		if ( ! empty( $args['prefillUserData'] ) && $args['prefillUserData'] && is_user_logged_in() ) {
			$user = wp_get_current_user();

			$user_full_name = trim( $user->first_name . ' ' . $user->last_name );

			$link = add_query_arg( 'checkout[email]', $user->user_email, $link );

			if ( $user_full_name ) {
				$link = add_query_arg( 'checkout[name]', $user_full_name, $link );
			}
		}

		if ( ! empty( $args['customData'] ) && $args['customData'] ) {
			foreach ( $args['customData'] as $custom_data ) {
				$link = add_query_arg( 'checkout[custom][' . sanitize_text_field( $custom_data['key'] ) . ']', sanitize_text_field( $custom_data['value'] ), $link );
			}
		}

		if ( ! empty( $args['prefillFromURL'] ) && $args['prefillFromURL']
		     && isset( $_GET['checkout'] ) && is_array( $_GET['checkout'] ) ) {

			foreach ( $_GET['checkout'] as $checkout_name => $checkout_value ) {
				if ( ! is_array( $checkout_value ) ) {
					$link = add_query_arg( 'checkout[' . sanitize_text_field( $checkout_name ) . ']', sanitize_text_field( wp_unslash( $checkout_value ) ), $link );
				} else {
					foreach ( $checkout_value as $sub_checkout_name => $sub_checkout_value ) {
						$link = add_query_arg( 'checkout[' . sanitize_text_field( $checkout_name ) . '][' . sanitize_text_field( $sub_checkout_name ) . ']', sanitize_text_field( wp_unslash( $sub_checkout_value ) ), $link );
					}
				}
			}
		}

		return apply_filters( 'lemonsqueezy_purchase_link', $link, $args, $block );
	}

	protected function get_link_from_button( $block_content ) {
		$pattern = '/href=["\']([^"\']+)["\']/';

		if ( preg_match( $pattern, $block_content, $matches ) ) {
			// The extracted href value will be in $matches[1]
			return $matches[1];
		}

		return false;
	}

}
