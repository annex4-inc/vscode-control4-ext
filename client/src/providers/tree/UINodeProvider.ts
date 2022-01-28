import * as vscode from 'vscode';
import * as path from 'path';
import { TreeNodeProvider } from './TreeNodeProvider';
import { C4UI } from '../../control4';
import { TypedJSON } from 'typedjson';
import UINode from './UINode';
import FolderNode from "./FolderNode"
import TextNode from './TextNode';
import C4InterfaceIcons from '../../control4/interface/C4InterfaceIcons';
import C4InterfaceScreen from '../../control4/interface/C4InterfaceScreen';
import C4InterfaceTab from '../../control4/interface/C4InterfaceTab';
import C4InterfaceCommand from '../../control4/interface/C4InterfaceCommand';

export class UINodeProvider extends TreeNodeProvider<UINode> {
    private _componentPath: string

    constructor(workspaceRoot: string) {
        super(workspaceRoot);

        this._componentPath = path.join(workspaceRoot, 'components', 'ui.c4c');

        this.watchFile('ui.c4c');
    }

    getChildren(element?: FolderNode): Thenable<FolderNode[]> {
      if (!this.workspaceRoot) {
        vscode.window.showInformationMessage('No dependency in empty workspace');
        return Promise.resolve([]);
      }

      try {
          console.log(element)

          if (element) {
              var nodes = [];
              
              if (!element.data) {
                return;
              }

              if (element.data.deviceIcon) {
                nodes.push(new FolderNode("Icons", "",  {
                  type: "Icons",
                  items: element.data.icons
                }));
                nodes.push(new FolderNode("Screens", "", {
                  type: "Screens",
                  items: element.data.screens
                }));
                nodes.push(new FolderNode("Tabs", "", {
                  type: "Tabs",
                  items: element.data.tabs,
                  command: element.data.tabCommand
                }));            
              }

              switch(element.data.type) {
                case 'Icons':
                  for (var i = 0; i < element.data.items.length; i++) {
                    let e = element.data.items[i] as C4InterfaceIcons;

                    nodes.push(new TextNode(e.id, e.template, "file-media", {}));
                  }
                  break;
                case 'Screens':
                  for (var i = 0; i < element.data.items.length; i++) {
                    let e = element.data.items[i] as C4InterfaceScreen;

                    nodes.push(new FolderNode(e.id, e.type, {
                      type: "Screen",
                      item: e
                    }));
                  }
                  break;
                case 'Screen':
                  let e = element.data.item as C4InterfaceScreen;

                  nodes.push(new TextNode(e.dataCommand.name, e.dataCommand.type, "file-media", {
                    item: e
                  }));
                  break;
                case 'Tabs':
                  if (element.data.command) {
                      let e = element.data.command as C4InterfaceCommand
                      nodes.push(new TextNode(e.name, e.type, "code", {
                          type: 'TabCommand',
                          item: element.data.command,
                      }))
                  } else {
                    for (var i = 0; i < element.data.items.length; i++) {
                        let e = element.data.items[i] as C4InterfaceTab;
    
                        nodes.push(new TextNode(e.name, `Screen [${e.screenId}] - Icon [${e.iconId}]`, "list-filter", {
                          type: "Tab",
                          item: e
                        }));
                      }
                  }
                  break;


                  
              }

              return Promise.resolve(nodes);
          } else {
              return this.getNodes(this._componentPath);
          }
      } catch (err) {
          console.log(err)
      }
  }

    getComponent(ui: C4UI): UINode {
        try {
            return new UINode(ui.proxy.toString(), ui);
        } catch (err) {
            console.log(err)
        }
    }

    resolveTypes(components) {
        return TypedJSON.parseAsArray<C4UI>(components, C4UI);
    }

    override async getNodes(component) {
      try {
        let td: vscode.TextDocument = await vscode.workspace.openTextDocument(component);
        let components: C4UI[];
  
        try {
          components = JSON.parse(td.getText());
        } catch (err) {
          vscode.window.showErrorMessage(`Bad JSON in component ${this.file}`, "Show", "Ok").then(value => {
            if (value == "Show") {
              vscode.window.showTextDocument(td);
            }
          });
  
          return [];
        }
  
        if (this.resolveTypes) {
          components = this.resolveTypes(components);
        }

        var ret = [];

        components.forEach((c) => {
          ret.push(this.getComponent(c));
        })

        return ret;
      } catch (err) {
        vscode.window.showErrorMessage(err.message);
      }
    }
}