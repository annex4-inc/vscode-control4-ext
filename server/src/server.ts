/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  CompletionItemKind,
  SignatureHelp,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  WorkDoneProgressReporter,
  InitializeResult,
  CompletionItemTag,
  SignatureHelpParams,
  CancellationToken,
  ResultProgressReporter,
  SignatureHelpTriggerKind,
  Hover,
  HoverParams,
  ParameterInformation,
  CompletionParams,
  CompletionTriggerKind,
  InsertTextFormat,
  FileChangeType,
  MarkupContent,
  MarkupKind
} from 'vscode-languageserver/node';

import {
  Suggestions,
  Components
} from './c4'

import {
  TextDocument
} from 'vscode-languageserver-textdocument';

//import * as h from './resources/hooks';
import functions from './resources/functions.json';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;
let workspaceRoot: string;

connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;

  // Does the client support the `workspace/configuration` request?
  // If not, we fall back using global settings.
  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: [":", ".", ",", "("]
      },
      signatureHelpProvider: {
        triggerCharacters: ["(", ","]
      },
      hoverProvider: true
    }
  };
  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true
      }
    };
  }

  if (params.workspaceFolders && params.workspaceFolders[0]) {
    workspaceRoot = params.workspaceFolders[0].uri;

    connection.console.log(params.workspaceFolders[0].uri);
  } else {
    connection.console.log("No workspace folder")
  }
  
  return result;
});

connection.onInitialized(() => {
  Components.Initialize(workspaceRoot);

  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(DidChangeConfigurationNotification.type, undefined);
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders(_event => {
      connection.console.log('Workspace folder change event received.');
    });
  }
});

// The example settings
interface ExampleSettings {
  maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
let globalSettings: ExampleSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
  if (hasConfigurationCapability) {
    // Reset all cached document settings
    documentSettings.clear();
  } else {
    globalSettings = <ExampleSettings>(
      (change.settings.languageServerExample || defaultSettings)
    );
  }

  // Revalidate all open text documents
  documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<ExampleSettings> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }
  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: 'languageServerExample'
    });
    documentSettings.set(resource, result);
  }
  return result;
}

// Only keep settings for open documents
documents.onDidClose(e => {
  documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {

}

connection.onDidChangeWatchedFiles(_change => {
  // Monitored files have change in VSCode
  _change.changes.forEach(function(change) {
    Components.Set(change.uri)
  })
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
  (params: CompletionParams): CompletionItem[] => {
    let document = documents.get(params.textDocument.uri);
    let position = params.position;

    let items : CompletionItem[] = [];

    if (params.context?.triggerCharacter == ":") {
      if (document) {
        // Search for the function name
        let text = document.getText({ start: { line: position.line, character: 0 }, end: { line: position.line, character: position.character } });
  
        // Find the Control4 function call
        let results = new RegExp(/C4:/, "i").exec(text);
  
        if (!results) {
          return [];
        }
      }

      let fs : CompletionItem[] = functions.map((func: any, index: number) => {
        let documentation : MarkupContent = {
          kind: MarkupKind.Markdown,
          value: func.description
        }

        let item : CompletionItem = {
          label: func.label,
          kind: CompletionItemKind.Function,
          data: index,
          detail: func.version,
          documentation: documentation
        }

        return item;
      })
  
      items.push(...fs);
    }

    if (params.context?.triggerCharacter == "," || params.context?.triggerCharacter == "(") {{
      // Search for the function name
      if (document) {
        let text = document.getText({ start: { line: position.line, character: 0 }, end: { line: position.line, character: position.character } });

        // Find the Control4 function call
        let results = new RegExp(/C4:([^ ()]+)\(?([^()]+)*\)*?/, "i").exec(text);

        let index = 0;

        // SendToProxy
        if (results) {
          if (results[2]) {
            index = (results[2].match(/,/g) || []).length;
          } 
          
          items.push(...Suggestions.Get(results[1], index));
        }
      }
    }}

    return items;
  }
);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
  (item: CompletionItem): CompletionItem => {
    if (item.kind == CompletionItemKind.Function) {  
      if (functions[item.data].deprecated) {
        item.tags = [CompletionItemTag.Deprecated]
      }
  
      return item;
    } else {
      return item;
    }
  }
);

connection.onSignatureHelp((params: SignatureHelpParams, token: CancellationToken, workDoneProgress: WorkDoneProgressReporter, resultProgress: ResultProgressReporter<never> | undefined): SignatureHelp | null => {
  let document = documents.get(params.textDocument.uri);
  let position = params.position;

  if (document) {
    // Search for the function name
    let text = document.getText({ start: { line: position.line, character: 0 }, end: { line: position.line, character: position.character } });

    // Find the Control4 function call
    let results = new RegExp(/C4:([^ ()]+)\(?([^()]+)*\)*?/, "i").exec(text);

    if (results) {
      let f = null;
      // Retrieve function details
      for (let i = 0; i < functions.length; i++) {
        if (functions[i].label == results[1]) {
          f = functions[i];

          break;
        }
      }

      if (f) {
        let parameters = f.parameters?.map((p: any) => {
          let param : ParameterInformation = {
            label: p.name,
            documentation: p.description,
          }

          return param
        })

        let index = 0

        if (results[2]) {
          index = (results[2].match(/,/g) || []).length;
        }

        return {
          activeParameter: index,
          activeSignature: 0,
          signatures: [{
            label: f.signature,
            documentation: {
              kind: MarkupKind.Markdown,
              value: f.description
            },
            parameters: parameters,
          }]
        }
      }
    }
  }

  return null;
})

connection.onHover((params: HoverParams) : Hover | null => {
  let document = documents.get(params.textDocument.uri);
  let position = params.position;

  // Search for the function name.
  if (document) {
    let text = document.getText({ start: { line: position.line, character: 0 }, end: { line: position.line, character: 65536 } });

    // Find the Control4 function call.
    let results = new RegExp("C4:(.+?)\\s*\\(", "i").exec(text);
  
    if (results) {
      let f = null;
      // Retrieve function details
      for (let i = 0; i < functions.length; i++) {
        if (functions[i].label == results[results.length - 1]) {
          f = functions[i];
  
          break;
        }
      }
  
      if (f) {
        let parameters = f.parameters?.map((p: any) => {
          let param : ParameterInformation = {
            label: p,
            documentation: p
          }
  
          return param
        })
  
        return {
          contents: f.description
        }
      }
    }
  }

  return null;
})

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();