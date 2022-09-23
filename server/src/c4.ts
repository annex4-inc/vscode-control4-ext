import * as fse from 'fs-extra';
import { URI } from 'vscode-uri';
import * as path from 'path';

import { CompletionItemKind } from 'vscode-languageserver';
import { CompletionItem } from 'vscode-languageserver-types';
import { InsertTextFormat } from 'vscode-languageserver/node';

let Methods: any = {
    SendToProxy: function (parameterIndex: number): Array<CompletionItem> {
        let items: Array<CompletionItem> = [];

        if (parameterIndex == 0) {
            Resources.connections.forEach((p: any) => {
                if (p.id < 1000 || (p.id >= 5000 && p.id < 6000)) {
                    items.push({
                        label: p.id.toString(),
                        kind: CompletionItemKind.Text,
                        data: p.id,
                        documentation: p.connectionname,
                        detail: p.id < 1000 ? "Control" : "Proxy"
                    })
                }
            })
        }

        return items;
    },
    UpdateProperty: function (parameterIndex: number, values: Array<any>): Array<CompletionItem> {
        let items: Array<CompletionItem> = [];

        if (parameterIndex == 0) {
            Resources.properties.forEach((p: any) => {
                items.push({
                    label: `"${p.name}"`,
                    documentation: `Control4 Property "${p.name}" - ${p.type}`,
                    kind: CompletionItemKind.Text,
                    data: p.name,
                    detail: p.type,
                })
            })
        } else if (parameterIndex == 1) {
            let value = values[0];

            if (!value) {
                return items;
            }

            let property = Resources.properties.find(p => {
                return value.includes(p.name);
            })

            if (property.type == "LIST") {
                property.items.forEach((i: any) => {
                    items.push({
                        label: `"${i}"`,
                        documentation: `${property.name} - ${i}`,
                        kind: CompletionItemKind.Text,
                        data: i,
                        detail: i
                    })
                })
            }
        }

        return items;
    },
    FireEventByID: function (parameterIndex: number): Array<CompletionItem> {
        let items: Array<CompletionItem> = [];

        if (parameterIndex == 0) {
            Resources.events.forEach((p: any) => {
                items.push({
                    label: p.id.toString(),
                    documentation: p.description,
                    kind: CompletionItemKind.Text,
                    data: p.name,
                    detail: p.name
                })
            })
        }

        return items;
    },
    FireEvent: function (parameterIndex: number): Array<CompletionItem> {
        let items: Array<CompletionItem> = [];

        if (parameterIndex == 0) {
            Resources.events.forEach((p: any) => {
                items.push({
                    label: p.name,
                    documentation: p.description,
                    kind: CompletionItemKind.Text,
                    data: p.name,
                    detail: p.id.toString(),
                    insertText: `"${p.name}"`,
                })
            })
        }

        return items;
    }
}

let Suggestions = {
    Get: function (method: string, parameterIndex: number, values: Array<any>): Array<CompletionItem> {
        let items = [];

        if (Methods[method]) {
            items.push(...Methods[method](parameterIndex, values));
        }

        return items;
    }
}

let Resources: any = {
    proxies: [],
    properties: [],
    actions: [],
    connections: [],
    events: [],
    commands: []
}

let Components = {
    Set: function (uri: string) {
        let path = URI.parse(uri).fsPath;

        let results = new RegExp(/\\([a-zA-Z]*?)\.c4c/, "i").exec(path);

        if (results && results[1]) {
            let resource = results[1];

            fse.readFile(path).then(result => {
                let j = JSON.parse(result.toString());
                Resources[resource] = j
            })
        }
    },
    Initialize: function (uri: string) {
        Object.keys(Resources).forEach(r => {
            fse.readFile(path.join(URI.parse(uri).fsPath, "components", `${r}.c4c`)).then(result => {
                Resources[r] = JSON.parse(result.toString());
            }).catch(err => {
                console.log(err);
            })
        })
    }
}

export {
    Suggestions,
    Components
}