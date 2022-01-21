import * as vscode from 'vscode';

export class ComponentPanel {
  public _viewType: string;

  public readonly _svelteScript: string;
  public readonly _panel: vscode.WebviewPanel;
  public readonly _extensionUri: vscode.Uri;

  public _disposables: vscode.Disposable[] = [];

  public dispose() {
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  public _getHtmlForWebview(webview: vscode.Webview) {
    // Local path to main script run in the webview
    const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'client', 'out', 'compiled', this._svelteScript);
    const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'client', 'media', 'reset.css');
    const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'client', 'media', 'page.css');
    const stylesVSCodePath = vscode.Uri.joinPath(this._extensionUri, 'client', 'media', 'vscode.css');

    // And the uri we use to load this script in the webview
    const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

    // Uri to load styles into webview
    const styleResetUri = webview.asWebviewUri(styleResetPath);
    const styleMainUri = webview.asWebviewUri(stylesPathMainPath);
    const styleVSCodeUri = webview.asWebviewUri(stylesVSCodePath);

    // Use a nonce to only allow specific scripts to be run
    const nonce = this.getNonce();

    return /* html */`
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<!--
			Use a content security policy to only allow loading images from https or from our extension directory,
			and only allow scripts that have a specific nonce.
			-->
			<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<link href="${styleResetUri}" rel="stylesheet" />
			<link href="${styleVSCodeUri}" rel="stylesheet" />
			<link href="${styleMainUri}" rel="stylesheet" />
			<title>Property</title>
		</head>
        <body>
            <div id="page"></div>
			<script nonce="${nonce}" src="${scriptUri}"></script>
		</body>
		</html>`;
  }

  private getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  public async show(entity) {
    console.log(entity)
    try {
      this._panel.webview.postMessage({ command: "update", value: entity })
    } catch (err) {
      console.log(err)
    }
  }

  public async _update() {
    const webview = this._panel.webview;

    this._panel.webview.html = this._getHtmlForWebview(webview);
  }

  public subscribe() {
    console.log("SUBSCRIBE ROOT")
  }

  public constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, svelteScript: string) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._svelteScript = svelteScript;

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Update the content based on view changes
    this._panel.onDidChangeViewState(
      e => {
        if (this._panel.visible) {
          this._update();
        }
      },
      null,
      this._disposables
    );

    this.subscribe();
  }
}