import React from 'react';
import './ForgotEmailPassword.css';

const ForgotEmailPassword = (props) => (
	<main>
		<header>
			<p className="forgot-title">Forgot your password?</p>
			<p className="forgot-description">
				Don't worry! Just fill in your email and we'll send
			</p>
			<p className="forgot-description">you a link to reset your password</p>
		</header>
		<section>
			<div className="fogot-email-label">EMAIL ADDRESS</div>
			<input
				type="text"
				className="forgot-email-input browser-default"
				name="username"
			></input>
		</section>
		<button className="forgot-reset-btn browser-default">Reset password</button>
	</main>
);

export default ForgotEmailPassword;
