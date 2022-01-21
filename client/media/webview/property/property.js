// @ts-check

// Script run within the webview itself.
(function () {

	// Get a reference to the VS Code webview api.
	// We use this API to post messages back to our extension.

	// @ts-ignore
	const vscode = acquireVsCodeApi();


	const propertiesContainer = /** @type {HTMLElement} */ (document.querySelector('.properties'));

	/*
	const addButtonContainer = document.querySelector('.add-button');
	addButtonContainer.querySelector('button').addEventListener('click', () => {
		vscode.postMessage({
			type: 'test'
		});
	})
	*/

	const errorContainer = document.createElement('div');
	document.body.appendChild(errorContainer);
	errorContainer.className = 'error'
	errorContainer.style.display = 'none'

	/**
	 * Render the document in the webview.
	 */
	function updateContent(/** @type {string} */ text) {
		let properties;
		try {
			properties = JSON.parse(text);
		} catch {
			propertiesContainer.style.display = 'none';
			errorContainer.innerText = 'Error: Document is not valid json';
			errorContainer.style.display = '';
			return;
		}
		propertiesContainer.style.display = '';
		errorContainer.style.display = 'none';

		// Render the scratches
		propertiesContainer.innerHTML = '';
		for (const property of properties || []) {
			const element = document.createElement('div');
			element.className = 'property';
			propertiesContainer.appendChild(element);

			const text = document.createElement('h1');
			text.className = 'text';
			const textContent = document.createElement('span');
			textContent.innerText = property.name;
			text.appendChild(textContent);
			element.appendChild(text);

			const deleteButton = document.createElement('button');
			deleteButton.className = 'delete-button';
			deleteButton.addEventListener('click', () => {
				vscode.postMessage({ type: 'delete', id: property.name, });
			});
			element.appendChild(deleteButton);
		}

		//propertiesContainer.appendChild(addButtonContainer);
	}

	// Handle messages sent from the extension to the webview
	window.addEventListener('message', event => {
		const message = event.data; // The json data that the extension sent
		switch (message.type) {
			case 'update':
				const text = message.text;

				// Update our webview's content
				updateContent(text);

				// Then persist state information.
				// This state is returned in the call to `vscode.getState` below when a webview is reloaded.
				vscode.setState({ text });

				return;
		}
	});

	// Webviews are normally torn down when not visible and re-created when they become visible again.
	// State lets us save information across these re-loads
	const state = vscode.getState();
	if (state) {
		updateContent(state.text);
	}
}());