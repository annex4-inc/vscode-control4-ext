import * as path from 'path';
import * as tmpFile from 'tmp';
import { runTests } from '@vscode/test-electron';

async function main() {
	try {
		const extensionDevelopmentPath = path.resolve(__dirname, '../../../');
		const extensionTestsPath = path.resolve(__dirname, './suite');
		const testWorkspace = path.resolve(__dirname, './fixtures/fixture1');

		console.log(extensionDevelopmentPath)

		await runTests({ version: '1.86.0', extensionDevelopmentPath, extensionTestsPath, launchArgs: [ testWorkspace ] });
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();