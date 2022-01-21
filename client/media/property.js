// @ts-check

// Script run within the webview itself.
(function () {

	// Get a reference to the VS Code webview api.
	// We use this API to post messages back to our extension.

	// @ts-ignore
	const vscode = acquireVsCodeApi();

	const PropertyTypes = [
		"STRING",
		"LIST",
		"RANGED_INTEGER",
		"PASSWORD",
		"LABEL",
		"SCROLL",
		"TRACK",
		"DEVICE_SELECTOR",
		"COLOR_SELECTOR",
		"DYNAMIC_LIST",
		"LINK",
		"CUSTOM_SELECT"
	]

	const propertyContainer = /** @type {HTMLElement} */ (document.querySelector('.property'));

	const errorContainer = document.createElement('div');
	document.body.appendChild(errorContainer);
	errorContainer.className = 'error'
	errorContainer.style.display = 'none'

	/**
	 * Render the document in the webview.
	 */
	function updateProperty(property) {
		propertyContainer.style.display = '';
		errorContainer.style.display = 'none';

		// Render the property
		propertyContainer.innerHTML = '';

		const element = document.createElement('form')
		element.className = 'property';

		propertyContainer.appendChild(element);

		const name = document.createElement('input');
		name.type = "text";
		name.className = 'name';
		name.value = property.name;

		element.appendChild(name);

		const type = document.createElement('select');
		type.className = 'type'

		for (var i = 0; i < PropertyTypes.length; i++) {
			const t = document.createElement('option');
			t.value = PropertyTypes[i];
			t.innerText = PropertyTypes[i];

			if (property.type == PropertyTypes[i]) {
				t.selected = true
			}

			type.appendChild(t);
		}

		element.appendChild(type);

		/*const deleteButton = document.createElement('button');
		deleteButton.className = 'delete-button';
		deleteButton.addEventListener('click', () => {
			vscode.postMessage({ type: 'delete', id: property.name, });
		});
		element.appendChild(deleteButton);
		*/
	}

	// Handle messages sent from the extension to the webview
	window.addEventListener('message', event => {
		const message = event.data;
		switch (message.command) {
			case 'update':
				const property = message.property;

				// Update our webview's content
				updateProperty(property);

				// Then persist state information.
				// This state is returned in the call to `vscode.getState` below when a webview is reloaded.
				vscode.setState({ property });

				return;
		}
	});

	// Webviews are normally torn down when not visible and re-created when they become visible again.
	// State lets us save information across these re-loads
	const state = vscode.getState();

	if (state) {
		updateProperty(state.property);
	}
}());