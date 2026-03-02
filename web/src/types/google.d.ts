declare namespace google.accounts.id {
	interface CredentialResponse {
		credential: string
		select_by:
			| 'auto'
			| 'user'
			| 'user_1tap'
			| 'user_2tap'
			| 'btn'
			| 'btn_confirm'
			| 'btn_add_session'
			| 'btn_confirm_add_session'
		clientId?: string
	}

	interface PromptMomentNotification {
		isDisplayMoment(): boolean
		isDisplayed(): boolean
		isNotDisplayed(): boolean
		getNotDisplayedReason():
			| 'browser_not_supported'
			| 'invalid_client'
			| 'missing_client_id'
			| 'opt_out_or_no_session'
			| 'secure_http_required'
			| 'suppressed_by_user'
			| 'unregistered_origin'
			| 'unknown_reason'
		isSkippedMoment(): boolean
		getSkippedReason():
			| 'auto_cancel'
			| 'user_cancel'
			| 'tap_outside'
			| 'issuing_failed'
		isDismissedMoment(): boolean
		getDismissedReason(): 'credential_returned' | 'cancel_called'
	}

	interface IdConfiguration {
		client_id: string
		callback?: (response: CredentialResponse) => void
		auto_select?: boolean
		login_uri?: string
		native_callback?: (response: CredentialResponse) => void
		cancel_on_tap_outside?: boolean
		prompt_parent_id?: string
		nonce?: string
		context?: 'signin' | 'signup' | 'use'
		state_cookie_domain?: string
		ux_mode?: 'popup' | 'redirect'
		itp_support?: boolean
	}

	function initialize(config: IdConfiguration): void
	function prompt(
		momentListener?: (notification: PromptMomentNotification) => void,
	): void
	function disableAutoSelect(): void
	function revoke(
		hint: string,
		callback?: (response: { successful: boolean; error?: string }) => void,
	): void
}
