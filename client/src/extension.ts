'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { PropertyNodeProvider } from './providers/tree/PropertyNodeProvider';
import { EventNodeProvider } from './providers/tree/EventNodeProvider';
import { CommandNodeProvider } from './providers/tree/CommandNodeProvider';
import { ActionNodeProvider } from './providers/tree/ActionNodeProvider';
import { ConnectionNodeProvider } from './providers/tree/ConnectionNodeProvider';
import { UINodeProvider } from './providers/tree/UINodeProvider';
import { NavDisplayOptionNodeProvider } from './providers/tree/NavDisplayOptionNodeProvider';


import * as path from 'path';
import { workspace } from 'vscode';
import { control4Create, control4Import, rebuildTestDependencies } from './commands';

import {
  ActionsResource, 
  CommandsResource,
  ConnectionsResource,
  EventsResource,
  PropertiesResource,
  NavDisplayOptionsResource
} from './components'

import './autocomplete/actions'
import './autocomplete/properties'
import './autocomplete/commands'

import { Views, Commands } from './constants/tree';

import { Control4BuildTaskProvider } from './build/control4BuildTaskProvider'

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient/node';
import { PanelManager } from './panel/PanelManager';


function Register(context: vscode.ExtensionContext, disposables: vscode.Disposable[]) {
  disposables.forEach(function (d) {
    context.subscriptions.push(d);
  });
}

let client: LanguageClient;

/**
 * Entry into the extension when activated
 */
export function activate(context: vscode.ExtensionContext) {
  const workspacePath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0 ? vscode.workspace.workspaceFolders[0].uri.path : '';

  // Tree node providers
  const propertiesProvider = new PropertyNodeProvider(workspacePath);
  const eventsProvider = new EventNodeProvider(workspacePath);
  const commandsProvider = new CommandNodeProvider(workspacePath);
  const actionsProvider = new ActionNodeProvider(workspacePath);
  const connectionsProvider = new ConnectionNodeProvider(workspacePath);
  const uiProvider = new UINodeProvider(workspacePath);
  const navdisplayoptionsProvider = new NavDisplayOptionNodeProvider(workspacePath);

  // Register the disposables of the tree node providers
  Register(context, propertiesProvider.register(Views.Properties, Commands.Properties.Select, Commands.Properties.Remove));
  Register(context, eventsProvider.register(Views.Events, Commands.Events.Select, Commands.Events.Remove));
  Register(context, commandsProvider.register(Views.Commands, Commands.Commands.Select, Commands.Commands.Remove));
  Register(context, actionsProvider.register(Views.Actions, Commands.Actions.Select, Commands.Actions.Remove));
  Register(context, connectionsProvider.register(Views.Connections, Commands.Connections.Select, Commands.Connections.Remove));
  Register(context, uiProvider.register(Views.UI, Commands.UI.Select, Commands.UI.Remove));
  Register(context, navdisplayoptionsProvider.register(Views.NavDisplayOptions, Commands.NavDisplayOptions.Select, Commands.NavDisplayOptions.Remove));
  //Register(context, parametersProvider.register(Views.Parameters, Commands.Parameters.Select, Commands.Parameters.Rmeove))

  // Register the global commands for the extension
  context.subscriptions.push(vscode.commands.registerCommand('control4.activate', () => { }))
  context.subscriptions.push(vscode.commands.registerCommand('control4.rebuildTestDependencies', rebuildTestDependencies, context));
  context.subscriptions.push(vscode.commands.registerCommand('control4.create', async () => {
    const input = await vscode.window.showInputBox();

    await control4Create.apply(context, [vscode.workspace.workspaceFolders[0].uri.fsPath, input])
  }, context));
  context.subscriptions.push(vscode.commands.registerCommand('control4.import', async () => {
    let paths = await vscode.window.showOpenDialog({
      openLabel: 'Select Driver',
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      filters: {
        'C4Z': ["c4z", "c4i"]
      }
    });

    if (!paths || paths.length === 0) {
      return;
    }

    let destinationPath : vscode.Uri; 

    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length >= 1) {
      destinationPath = vscode.workspace.workspaceFolders[0].uri;
    } else {
      const destinationPaths = await vscode.window.showOpenDialog({
        openLabel: 'Select Destination',
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false
      })

      if (!destinationPaths || destinationPaths.length === 0) {
        return;
      }

      destinationPath = destinationPaths[0];
    }

    if (paths && paths.length > 0) {
      await control4Import.apply(context, [paths[0], destinationPath.fsPath])

      vscode.window.showInformationMessage(`Imported ${paths[0].fsPath}`);

      if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
        await vscode.commands.executeCommand('vscode.openFolder', destinationPath);
        await vscode.workspace.openTextDocument('./src/driver.lua');
      }
    }
  }, context));

  context.subscriptions.push(vscode.tasks.registerTaskProvider(Control4BuildTaskProvider.BuildType, new Control4BuildTaskProvider(workspacePath, context)));

  let serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));
  let serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: { execArgv: ['--nolazy', '--inspect=6009'] }
    }
  };

  // Options to control the language client
  let clientOptions: LanguageClientOptions = {
    markdown: { isTrusted: true },
    documentSelector: [{ scheme: 'file', language: 'lua' }],
    synchronize: {
      // Notify the server about file changes to '.c4c' files contained in the workspace
      fileEvents: workspace.createFileSystemWatcher('**/**.c4c')
    }
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    'vscode-control4-server',
    'Control4 Language Server',
    serverOptions,
    clientOptions
  );

  // Start the client. This will also launch the server
  client.start();

  let types = [
    { name: "Property", plural: "Properties", resource: PropertiesResource, provider: propertiesProvider, panel: undefined },
    { name: "Action", plural: "Actions", resource: ActionsResource, provider: actionsProvider, panel: undefined },
    { name: "Command", plural: "Commands", resource: CommandsResource, provider: commandsProvider, panel: undefined },
    { name: "Event", plural: "Events", resource: EventsResource, provider: eventsProvider, panel: undefined},
    { name: "Connection", plural: "Connections", resource: ConnectionsResource, provider: connectionsProvider, panel: undefined },
    { name: "NavDisplayOption", plural: "NavDisplayOptions", resource: NavDisplayOptionsResource, provider: navdisplayoptionsProvider, panel: undefined }

  ]

  types.forEach(t => {
    t.panel = new PanelManager(context.extensionUri, `${t.name.toLowerCase()}.js`, t.name, t.resource)

    //@ts-ignore
    t.provider.onSelectNode((e) => { vscode.commands.executeCommand(`control4.view${t.name}`, e); })
    t.provider.onRemoveNode((e) => { vscode.commands.executeCommand(`control4.remove${t.name}`, e); })

    context.subscriptions.push(vscode.commands.registerCommand(`control4.add${t.name}`, () => {
      t.panel.createOrShow(context.extensionUri, null);
    }))

    context.subscriptions.push(
      vscode.commands.registerCommand(`control4.view${t.name}`, (e) => {
        t.panel.createOrShow(context.extensionUri, e);
      })
    );

    vscode.window.registerWebviewPanelSerializer(`control4.${t.name.toLowerCase()}`, {
      async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
        t.panel.revive(webviewPanel, context.extensionUri);
      }
    })

    context.subscriptions.push(vscode.commands.registerCommand(`control4.move${t.name}Up`, (n) => {
      t.resource.MoveUp(n.data);
      t.provider.refresh();
    }));

    context.subscriptions.push(vscode.commands.registerCommand(`control4.move${t.name}Down`, (n) => {
      t.resource.MoveDown(n.data);
      t.provider.refresh();
    }));

    context.subscriptions.push(vscode.commands.registerCommand(`control4.refresh${t.plural}`, () => {
      t.provider.refresh()
      t.resource.Reload();
    }));

    // [ ] - When a node is removed from the tree the Webview panel should either be disposed or updated to another exisitng node.
    context.subscriptions.push(vscode.commands.registerCommand(`control4.remove${t.name}`, (n) => {
      t.resource.Delete(n);
      t.provider.refresh();
    }));
  })
}

export function deactivate() {
  if (!client) {
    return undefined;
  }
  return client.stop();
}