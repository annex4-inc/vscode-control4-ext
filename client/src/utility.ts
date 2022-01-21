import * as vscode from 'vscode';
import * as fs from 'fs'
import * as path from 'path'
import * as cp from 'child_process'

const fsPromises = fs.promises;

export async function WriteIfNotExists(file, data) {
    try {
        var handler = await fsPromises.open(file, 'wx');

        await handler.writeFile(data);

        await handler.close();
    } catch (err) {
        if (err.code == "ENOENT") {
            await fsPromises.mkdir(path.dirname(file));
            await WriteIfNotExists(file, data)
        }
    }
}

export async function ReadFileContents(file) {
    try {
        var handler = await fsPromises.open(file, 'r');
        var buffer = await handler.readFile();

        var contents = buffer.toString('utf-8');

        await handler.close();

        return contents;
    } catch (err) {
        console.log(err);
    }
}

export async function WriteFileContents(file, data) {
    try {
        var handler = await fsPromises.open(file, 'w');

        await handler.writeFile(data);

        await handler.close();
    } catch (err) {
        console.log(err);
    }
}

export async function GetDirents(dir): Promise<string[]> {
    const dirents = await fsPromises.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map(async (d) => {
        const res = path.join(dir, d.name)
        return d.isDirectory() ? [res].concat(await GetDirents(res)) : res;
    }))

    return files.flat();
}

export async function ForceWrite(file, data) {
    try {
        var handler = await fsPromises.open(file, 'w');

        await handler.writeFile(data);

        await handler.close();
    } catch (err) {
        if (err.code == "ENOENT") {
            try {
                await fsPromises.mkdir(path.dirname(file), {recursive: true});
                await ForceWrite(file, data)
            } catch (err) {
                console.log(err.message)
            }
        }
    }
}

export function StartProcess(command: string, args: string[]) {
    return new Promise(function (resolve, reject) {
        let p = cp.exec(`${command} ${args.join(" ")}`, {
            cwd: vscode.workspace.workspaceFolders[0].uri.fsPath
        }, function (err, stdOut, stdErr) {
            if (err) {
              reject(stdErr.trimEnd())
            } else {
              resolve(stdOut.trimEnd())
            }
        })
    })
}