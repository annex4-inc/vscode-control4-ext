import * as vscode from 'vscode';
import { Component } from "../components/component"
import { ComponentPanel } from './ComponentPanel';

export class PanelManager {
  private currentPanel: ComponentPanel;
  private currentEntity: any;
  private script: string;

  public type : string;
  public resource: Component;
  public extensionUri : vscode.Uri;
  
  constructor(extensionUri: vscode.Uri, script: string, type: string, resource: Component) {
    this.extensionUri = extensionUri;
    this.script = script;
    this.type = type;
    this.resource = resource;
  }

  public static createPanel(extensionUri: vscode.Uri, viewType: string) : vscode.WebviewPanel {
    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

    const panel = vscode.window.createWebviewPanel(viewType, "Vue", column || vscode.ViewColumn.One, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [
        vscode.Uri.joinPath(extensionUri, "client", "out"),
        vscode.Uri.joinPath(extensionUri, "client", "media")
      ]
    })

    return panel
  }

  protected subscribe() {
    this.currentPanel._panel.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case 'update':
          let updated = await this.resource.Update(this.currentEntity, message.value);

          if (!updated) {
            vscode.window.showErrorMessage("Failed to update entity");
          } else {
            this.currentEntity = message.value;

            vscode.window.showInformationMessage("Entity updated");
          }

          break;
        case 'create':
          let created = await this.resource.Create(message.value);

          if (!created) {
            vscode.window.showErrorMessage(`The entity already exists`);
          }

          break;
      }
    }, null, this.currentPanel._disposables);

    this.currentPanel._panel.onDidDispose(async (e) => {
      this.currentPanel = null;
    }, null, this.currentPanel._disposables);
  }

  public revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this.currentPanel = new ComponentPanel(panel, extensionUri, this.script);

    this.subscribe();
  }

  public createOrShow(extensionUri: vscode.Uri, entity: any) {
    if (!this.currentPanel) {
      let panel = PanelManager.createPanel(extensionUri, `control4.${this.type.toLocaleLowerCase()}`)

      this.currentPanel = new ComponentPanel(panel, extensionUri, this.script);

      this.subscribe();
    }

    try {
      if (this.currentPanel) {
        // Always reveal the panel in column one
        this.currentPanel._panel.reveal(vscode.ViewColumn.One);
        
        if (entity == null) {
          this.currentPanel._panel.title = `Create ${this.type}`;
          this.currentPanel._panel.webview.postMessage({ command: "create" })
        } else {
          this.currentEntity = entity;

          this.currentPanel._panel.title = `Update ${this.type}`;
          this.currentPanel._panel.webview.postMessage({ command: "update", value: entity })
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
}