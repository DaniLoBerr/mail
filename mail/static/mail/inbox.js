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

function display_email(email_id) {

	// Clear out previous email view
	document.querySelector('#email-view').innerHTML = '';

	// Show email view and hide other views
	document.querySelector('#mailbox-view').style.display = 'none';
	document.querySelector('#compose-view').style.display = 'none';
	document.querySelector('#email-view').style.display = 'block';

	// Retrieve email data via id
	fetch(`/emails/${email_id}`)
		.then(response => response.json())
		.then(email => {

			// Mark email as read
			fetch(`/emails/${email_id}`, {
				method: 'PUT',
				body: JSON.stringify({
					read: true
				})
			})

			// Retrieve the container used to display the email
			const email_view = document.querySelector('#email-view');

			// Create email elements
			const email_container = document.createElement('div');
			const email_info = document.createElement('ul');
			const reply_button = document.createElement('button');
			const hr = document.createElement('hr');
			const body = document.createElement('p');

			// Remove bullet points from the list
			email_info.className = "list-unstyled";

			// Create email information items
			const sender = document.createElement('li');
			const recipients = document.createElement('li');
			const subject = document.createElement('li');
			const timestamp = document.createElement('li');

			// Populate and style the items
			const sender_title = document.createElement('span');
			const recipients_title = document.createElement('span');
			const subject_title = document.createElement('span');
			const timestamp_title = document.createElement('span');

			sender_title.className = "fw-bold";
			recipients_title.className = "fw-bold";
			subject_title.className = "fw-bold";
			timestamp_title.className = "fw-bold";
			reply_button.className = "btn btn-sm btn-outline-primary";

			sender_title.textContent = "From: ";
			recipients_title.textContent = "To: ";
			subject_title.textContent = "Subject: ";
			timestamp_title.textContent = "Timestamp: ";

			const sender_body = document.createTextNode(email.sender);
			const recipients_body = document.createTextNode(email.recipients);
			let subject_body;
			if (email.subject) subject_body = document.createTextNode(email.subject);
			else subject_body = document.createTextNode('(No subject)');
			const timestamp_body = document.createTextNode(email.timestamp);
			reply_button.textContent = "Reply";
			body.textContent = email.body;

			// Add elements to their containers
			sender.appendChild(sender_title);
			sender.appendChild(sender_body);
			recipients.appendChild(recipients_title);
			recipients.appendChild(recipients_body);
			subject.appendChild(subject_title);
			subject.appendChild(subject_body);
			timestamp.appendChild(timestamp_title);
			timestamp.appendChild(timestamp_body);

			email_info.appendChild(sender);
			email_info.appendChild(recipients);
			email_info.appendChild(subject);
			email_info.appendChild(timestamp);

			email_container.appendChild(email_info);
			email_container.appendChild(reply_button);
			email_container.appendChild(hr);
			email_container.appendChild(body);

			email_view.appendChild(email_container);
		});
}

function compose_email() {

	// Show compose view and hide other views
	document.querySelector('#mailbox-view').style.display = 'none';
	document.querySelector('#compose-view').style.display = 'block';
	document.querySelector('#email-view').style.display = 'none';

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
	document.querySelector('#mailbox-view').style.display = 'block';
	document.querySelector('#compose-view').style.display = 'none';
	document.querySelector('#email-view').style.display = 'none';

	// Show the mailbox name
	document.querySelector('#mailbox-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

	// Get emails from API
	fetch(`/emails/${mailbox}`)
		.then(response => response.json())
		.then(emails => {

			// Retrieve the container used to display the mailbox
			const mailbox_view = document.querySelector('#mailbox-view');

			// Sort emails from most recent to least recent
			emails.sort((a, b) => b.timestamp - a.timestamp);

			// Display emails
			emails.forEach(email => {

				// Separate each email in its own link box
				email_link = document.createElement('a');
				email_link.className = "text-decoration-none";
				email_link.setAttribute('onClick', `display_email(${email.id})`);

				email_container = document.createElement('div');
				email_container.className = "email list-group list-group-horizontal";

				// Divide each email in three sections
				sender = document.createElement('div');
				subject = document.createElement('div');
				date = document.createElement('div');

				// Change email's background-color is it is read or unread
				if (email.read && mailbox == 'inbox') {
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

				email_link.appendChild(email_container);

				mailbox_view.appendChild(email_link);
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