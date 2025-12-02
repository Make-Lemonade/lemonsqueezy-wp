<?php

namespace lemonsqueezy;

class LSQ_OAuth {

	/**
	 * @var string
	 */
	protected $client_id;

	/**
	 * @var string
	 */
	protected $redirect_uri;

	/**
	 * @param string $client_id
	 * @param string $redirect_uri
	 */
	public function __construct( $client_id ) {
		$this->client_id    = $client_id;
		$this->redirect_uri = LSQ_APP_URL . '/oauth/callback/wordpress';
	}

	/**
	 * Handle OAuth authorization
	 *
	 * @return void
	 */
	public function handle_authorize() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Nonce verification is handled below.
		if ( empty( $_GET['oauth_authorize'] ) ) {
			return;
		}

		if ( ! isset( $_GET['_wpnonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_GET['_wpnonce'] ) ), 'lsq_oauth_authorize' ) ) {
			return;
		}

		if ( empty( $_SESSION['lsq_oauth_code'] ) ) {
			$_SESSION['lsq_oauth_code'] = wp_generate_password( 40, false );
		}
		if ( empty( $_SESSION['lsq_oauth_code_verifier'] ) ) {
			$_SESSION['lsq_oauth_code_verifier'] = wp_generate_password( 128, false );
		}

		$code_verifier = isset( $_SESSION['lsq_oauth_code_verifier'] ) ? sanitize_text_field( wp_unslash( $_SESSION['lsq_oauth_code_verifier'] ) ) : '';
		$oauth_code    = isset( $_SESSION['lsq_oauth_code'] ) ? sanitize_text_field( wp_unslash( $_SESSION['lsq_oauth_code'] ) ) : '';

		$code_challenge = strtr(
			rtrim(
				base64_encode( hash( 'sha256', $code_verifier, true ) ),
				'='
			),
			'+/',
			'-_'
		);

		$query = http_build_query(
			array(
				'client_id'             => $this->client_id,
				'redirect_uri'          => $this->redirect_uri,
				'response_type'         => 'code',
				'scope'                 => '',
				'state'                 => $oauth_code,
				'code_challenge'        => $code_challenge,
				'code_challenge_method' => 'S256',
				'prompt'                => 'consent',
				'return_to'             => admin_url( 'admin.php?page=lemonsqueezy&oauth_callback=1' ),
			)
		);

		wp_safe_redirect( LSQ_APP_URL . '/oauth/authorize?' . $query );
		exit;
	}

	/**
	 * Handle OAuth token exchange
	 *
	 * @return void
	 */
	public function handle_callback() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- OAuth callback from external provider, state parameter provides CSRF protection.
		if ( empty( $_GET['oauth_callback'] ) ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- OAuth callback from external provider, state parameter provides CSRF protection.
		if ( ! empty( $_GET['error'] ) ) {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- OAuth callback from external provider.
			$error = isset( $_GET['error'] ) ? sanitize_text_field( wp_unslash( $_GET['error'] ) ) : '';
			wp_add_inline_script(
				'lemonsqueezy-admin-script',
				'window.lsq_oauth = ' . wp_json_encode(
					array(
						'error' => $error,
					)
				),
				'before'
			);
			return;
		}

		if ( empty( $_SESSION['lsq_oauth_code'] ) || empty( $_SESSION['lsq_oauth_code_verifier'] ) ) {
			return;
		}

		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- OAuth callback from external provider, state parameter provides CSRF protection.
		$code  = isset( $_GET['code'] ) ? sanitize_text_field( wp_unslash( $_GET['code'] ) ) : null;
		$state = isset( $_GET['state'] ) ? sanitize_text_field( wp_unslash( $_GET['state'] ) ) : null;
		// phpcs:enable WordPress.Security.NonceVerification.Recommended

		$oauth_code = isset( $_SESSION['lsq_oauth_code'] ) ? sanitize_text_field( wp_unslash( $_SESSION['lsq_oauth_code'] ) ) : '';

		if ( $oauth_code !== $state || ! $code ) {
			wp_add_inline_script(
				'lemonsqueezy-admin-script',
				'window.lsq_oauth = ' . wp_json_encode(
					array(
						'error' => __( 'Invalid oauth state/code', 'lemon-squeezy' ),
					)
				),
				'before'
			);
			return;
		}

		$code_verifier = isset( $_SESSION['lsq_oauth_code_verifier'] ) ? sanitize_text_field( wp_unslash( $_SESSION['lsq_oauth_code_verifier'] ) ) : '';

		$response = wp_remote_post(
			LSQ_APP_URL . '/oauth/token',
			array(
				'body' => array(
					'grant_type'    => 'authorization_code',
					'client_id'     => $this->client_id,
					'redirect_uri'  => $this->redirect_uri,
					'code_verifier' => $code_verifier,
					'code'          => $code,
				),
			)
		);

		if ( is_wp_error( $response ) ) {
			wp_add_inline_script(
				'lemonsqueezy-admin-script',
				'window.lsq_oauth = ' . wp_json_encode(
					array(
						'error' => $response->get_error_message(),
					)
				),
				'before'
			);
			return;
		}

		$data = json_decode( $response['body'] );

		if ( ! empty( $data->access_token ) ) {
			update_option( 'lsq_api_key', $data->access_token );
		}
		if ( ! empty( $data->expires_in ) ) {
			update_option( 'lsq_api_key_expires', time() + $data->expires_in );
		}
	}
}
