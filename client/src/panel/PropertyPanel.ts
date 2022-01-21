import * as vscode from 'vscode';
import * as path from 'path';
import { SveltePanel } from './SveltePanel'
import PropertiesResource from "../components/properties";

export class PropertyPanel extends SveltePanel {
  public static currentPanel: PropertyPanel | undefined;

  private _currentProperty: any;

  public static viewType: "control4.property";

  public static createOrShow(extensionUri: vscode.Uri, property) {
    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

    try {
      if (PropertyPanel.currentPanel) {
        // Always reveal the panel in column one
        PropertyPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);

        /*
        if (column > vscode.ViewColumn.One) {
            PropertyPanel.currentPanel._panel.reveal(column);
        } else {
            PropertyPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
        }
        */

        if (property == null) {
          PropertyPanel.currentPanel._panel.title = `Create Property`;
          PropertyPanel.currentPanel._panel.webview.postMessage({ command: "create" })
        } else {
          console.log(property)
          PropertyPanel.currentPanel._panel.title = `Property: ${property.name}`;
          PropertyPanel.currentPanel._currentProperty = property;
          PropertyPanel.currentPanel._panel.webview.postMessage({ command: "update", property: property })
        }

        return;
      }

      //const panel = vscode.window.createWebviewPanel(PropertyPanel.viewType, "Vue", column || vscode.ViewColumn.One, {
      const panel = vscode.window.createWebviewPanel(PropertyPanel.viewType, property ? `Property: ${property.name}` : 'Create Property', vscode.ViewColumn.One, {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, "client", "out"),
          vscode.Uri.joinPath(extensionUri, "client", "media")
      ]
      })

      PropertyPanel.currentPanel = new PropertyPanel(panel, extensionUri);

      if (property == null) {
        PropertyPanel.currentPanel._panel.webview.postMessage({ command: "create" })
      } else {
        PropertyPanel.currentPanel._panel.webview.postMessage({ command: "update", property: property })
      }
    } catch (err) {
      console.log(err);
    }
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    PropertyPanel.currentPanel = new PropertyPanel(panel, extensionUri);
  }

  public dispose() {
    PropertyPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  protected subscribe() {
    this._panel.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case 'update':
          let updated = await PropertiesResource.Update(this._currentProperty, message.property);

          if (!updated) {

          } else {
            this._currentProperty = message.property;
          }

          break;
        case 'create':
          let created = await PropertiesResource.Create(message.property);

          if (!created) {
            vscode.window.showErrorMessage(`The property with name ${message.property.name} already exists`);
          }

          break;
      }
    },
      null,
      this._disposables
    );
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    super(panel, extensionUri, "property.js");
  }
}