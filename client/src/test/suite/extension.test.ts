import * as assert from 'assert';
import path from 'path';
import { control4Create } from '../../commands';
import { FileExists } from '../../utility';

suite('Extension Test Suite', () => {
    test("Creates a new project directory", async () => {
        let root = path.resolve("./temp/abc");

        await control4Create(root, "abc");

        assert.equal(true, await FileExists(path.resolve("./temp/abc", "package.json")) )
        assert.equal(true, await FileExists(path.resolve("./temp/abc", "src", "driver.lua")) )
    })
});

