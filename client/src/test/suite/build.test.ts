import * as assert from 'assert';
import * as vscode from 'vscode';

import path from 'path';

import { BuildVersion, Builder } from '../../build/builder';

suite('Driver Build', () => {
    let root = path.resolve("../../src/test/fixtures/fixture1");
    let context : vscode.ExtensionContext

    suiteSetup(async () => {
        try {
            const ext = vscode.extensions.getExtension('annex4-inc.vscode-control4');
            
            if (ext && !ext.isActive) {
                context = await ext.activate();
            }
        } catch (err) {
            assert.fail(err.message);
        }
    })

    test('Builds a c4z file', async () => {
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

