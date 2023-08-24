import * as assert from 'assert';
import { BuildVersion, Builder } from '../../control4/builder';
import path from 'path';
import { before, suiteSetup } from 'mocha';
import { control4Create } from '../../commands';
import * as vscode from 'vscode';
import { Control4BuildTaskProvider } from '../../control4BuildTaskProvider';

suite('Driver Build', () => {
    let root = path.resolve("./temp/test");
    let context : vscode.ExtensionContext

    suiteSetup(async () => {
        try {
            const ext = vscode.extensions.getExtension('annex4-inc.vscode-control4');
            //const ext = vscode.extensions.getExtension('vscode.vscode-control4-ext-client');
            
            if (ext) {
                context = await ext.activate();
            }
        } catch (err) {
            console.log(err)
        }
    })

    before(async () => {
        await control4Create(root, "test")
    })

    test('Builds a c4z file', async () => {
        console.log(context)

        let iterator = Builder.Build(root, {
            version: BuildVersion.Debug,
            development: false,
            merge: false,
            template: false,
            encryption: false,
            deploy: {ip: "", port: 0},
            type: "control4"
        }, context);

        let value : IteratorResult<any> = null;

        while (value = await iterator.next(), !value.done) {
            
        }
    });
});

