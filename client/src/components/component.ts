import * as vscode from 'vscode';
import { WriteIfNotExists } from '../utility';
import isMatch from 'lodash.ismatch';

export class Component {
  protected _textDocument: vscode.TextDocument;
  protected _resourceUri: vscode.Uri;
  public data: any;

  constructor(resource) {
    if (vscode.workspace.workspaceFolders !== undefined) {
        this._resourceUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'components', resource);
    }
    
    //this._resourceUri = vscode.Uri.joinPath(vscode.workspace.name, 'components', resource);

    let watcher = vscode.workspace.createFileSystemWatcher(`**/${resource}`);

    watcher.onDidChange(() => {
      this.load();
    })
  }

  async initialize() {
    await WriteIfNotExists(this._resourceUri.fsPath, "[]");
  }

  async load() {
    try {
      this._textDocument = await vscode.workspace.openTextDocument(this._resourceUri);

      var text = this._textDocument.getText();

      this.data = JSON.parse(text);

      return this.data;
    } catch (exception) {
      //WriteIfNotExists(this._resourceUri.fsPath, "[]");

      return [];
    }
  }

  async save(data) {
    if (!this._textDocument || this._textDocument.isClosed) {
        try {
            await vscode.workspace.fs.stat(this._resourceUri);
        } catch (err) {
            await WriteIfNotExists(this._resourceUri.fsPath, "[]");
        }
    }

    this._textDocument = await vscode.workspace.openTextDocument(this._resourceUri);

    let edit = new vscode.WorkspaceEdit();
    edit.replace(this._textDocument.uri,
      new vscode.Range(0, 0, this._textDocument.lineCount, 0),
      JSON.stringify(data, null, 2));

    await vscode.workspace.applyEdit(edit);

    return await this._textDocument.save();
  }

  async Create(item): Promise<boolean> {
    if (!this.data) {
      await this.load();
    }

    let items = this.data;

    for (let i = 0; i < items.length; i++) {
      if ((isMatch(items[i], item)) || (isMatch(items[i].iconstate, item.iconstate))) {
        return false;
      }
    }

    items.push(item);

    await this.save(items);

    return true;
  }

  async Update(initial, change): Promise<boolean> {
    if (!this.data) {
      await this.load();
    }

    let items = this.data;
    let changed = false;

    for (let i = 0; i < items.length; i++) {
      if (isMatch(items[i], initial)) {
        items[i] = change;
        changed = true;
        break;
      }
    }

    if (changed) {
      await this.save(items);
    }

    return changed;
  }

  async Delete(item): Promise<boolean> {
    if (!this.data) {
      await this.load();
    }

    let items = this.data;

    for (let i = 0; i < items.length; i++) {
      if (isMatch(items[i], item)) {
        items.splice(i, 1);
        break;
      }
    }

    await this.save(items);

    return true;
  }

  async MoveUp(item): Promise<boolean> {
    if (!this.data) {
      await this.load();
    }

    let items = this.data;
    let changed = false;

    for (let i = items.length - 1; i > 0; i--) {
      if (isMatch(items[i], item)) {
        let p = items[i];

        if (i <= 0) {
          break;
        }

        items.splice(i, 1);
        items.splice(i - 1, 0, p);

        changed = true;

        break;
      }
    }

    if (changed) {
      await this.save(items);
    }

    return true;
  }

  async MoveDown(item): Promise<boolean> {
    if (!this.data) {
      await this.load();
    }

    let items = this.data;
    let changed = false;

    for (let i = items.length - 1; i >= 0; i--) {
      if (isMatch(items[i], item)) {
        let p = items[i];

        if (i >= items.length) {
          break;
        }

        items.splice(i, 1);
        items.splice(i + 1, 0, p);

        changed = true;

        break;
      }
    }

    if (changed) {
      await this.save(items);
    }

    return true;
  }

  async Write(json): Promise<boolean> {
    return await this.save(json);
  }
}




