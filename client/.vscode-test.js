const { defineConfig } = require('@vscode/test-cli');

module.exports = defineConfig({
    label: 'Tests',
    workspaceFolder: './tmp',
    files: 'out/test/**/*.test.js', 
    version: '1.86.0', 
    mocha: { ui: 'tdd', timeout: 20000 }
});