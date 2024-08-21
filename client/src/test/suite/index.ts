import * as path from 'path';
import Mocha from 'mocha';
import { glob } from 'glob';

export function run(testsRoot: string): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd',
		color: true
	});

	return new Promise((c, e) => {
		let g = glob('**/**.test.js', { cwd: testsRoot })
		g.then((files) => {
			// Add files to the test suite
			files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

			try {
				// Run the mocha test
				mocha.run(failures => {
					if (failures > 0) {
						e(new Error(`${failures} tests failed.`));
					} else {
						c();
					}
				});
			} catch (err) {
				console.error(err);
				e(err);
			}
		});
	});
}