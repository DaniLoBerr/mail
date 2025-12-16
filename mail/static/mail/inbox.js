document.addEventListener('DOMContentLoaded', function() {

	// Use buttons to toggle between views
	document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
	document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
	document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
	document.querySelector('#compose').addEventListener('click', compose_email);

	// By default, load the inbox
	load_mailbox('inbox');

	// Add event listener for email submissions
	document.querySelector('#compose-form').addEventListener('submit', (e) => {
		
		// Prevent redirection when the email is submitted
		e.preventDefault();

		// Send email data to API
		send_email(
			document.querySelector('#compose-recipients').value,
			document.querySelector('#compose-subject').value,
			document.querySelector('#compose-body').value,
		);
	});
});

function compose_email() {

	// Show compose view and hide other views
	document.querySelector('#emails-view').style.display = 'none';
	document.querySelector('#compose-view').style.display = 'block';

	// Clear out composition fields
	document.querySelector('#compose-recipients').value = '';
	document.querySelector('#compose-subject').value = '';
	document.querySelector('#compose-body').value = '';
}

function display_message(message) {

	// Display the result of an action
	document.querySelector('#messages-view').textContent = message;
}

function load_mailbox(mailbox) {

	// Show the mailbox and hide other views
	document.querySelector('#emails-view').style.display = 'block';
	document.querySelector('#compose-view').style.display = 'none';

	// Show the mailbox name
	document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

function send_email(recipients, subject, body) {
	
	// Send data to API
	fetch('/emails', {
		method: 'POST',
		body: JSON.stringify({
			recipients: recipients,
			subject: subject,
			body: body,
		})
	})
	.then(response => response.json())
	.then(result => {
		if (result.error) {
			// Display error message for 5 seconds if any
			display_message(result.error);
			setTimeout(() => display_message(""), 5000);
		} else {
			// Load the sent inbox
			load_mailbox('sent');
		}
	});
}