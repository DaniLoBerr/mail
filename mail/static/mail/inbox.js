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
	const emails_view = document.querySelector('#emails-view');
	emails_view.style.display = 'block';
	document.querySelector('#compose-view').style.display = 'none';

	// Show the mailbox name
	document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

	// Get emails from API
	fetch(`/emails/${mailbox}`)
		.then(response => response.json())
		.then(emails => {

			// Sort emails from most recent to least recent
			emails.sort((a, b) => b.timestamp - a.timestamp);

			// Display emails
			emails.forEach(email => {

				// Separate each email in its own box
				email_container = document.createElement('div');
				email_container.className = "list-group list-group-horizontal";

				// Divide each email in three sections
				sender = document.createElement('div');
				subject = document.createElement('div');
				date = document.createElement('div');

				// Change email's background-color is it is read or unread
				if (email.read) {
					sender.className = "list-group-item col-3 fw-bold list-group-item-dark";
					subject.className = "list-group-item col-6 text-truncate list-group-item-dark";
					date.className = "list-group-item col-3 fw-light list-group-item-dark";
					
				} else {
					sender.className = "list-group-item col-3 fw-bold";
					subject.className = "list-group-item col-6 text-truncate";
					date.className = "list-group-item col-3 fw-light";
				}

				// Populate each section
				sender.textContent = email.sender;
				subject.textContent = email.subject;
				date.textContent = email.timestamp;

				// Display email
				email_container.appendChild(sender);
				email_container.appendChild(subject);
				email_container.appendChild(date);

				emails_view.appendChild(email_container);
			});
		});
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