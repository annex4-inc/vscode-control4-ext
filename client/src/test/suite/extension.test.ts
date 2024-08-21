import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
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

    test("It initializes control4.import command", async () => {
        let result = await vscode.commands.getCommands(true)
        
        assert.equal(true, result.includes('control4.import'))
    })

    test("It initializes control4.create command", async () => {
        let result = await vscode.commands.getCommands(true)
        
        assert.equal(true, result.includes('control4.create'))
    })
});

