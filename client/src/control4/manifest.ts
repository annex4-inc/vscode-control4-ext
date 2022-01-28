'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as builder from 'xmlbuilder2';
import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as fse from 'fs-extra';
import { ForceWrite, GetDirents, ReadFileContents } from "../utility"


const fsPromises = fs.promises;

export default class Manifest {
    files: string[]
    folders: string[]
    contents: object
    driverName: string
    type: string
    encrypted: boolean

    constructor(driverName: string) {
        this.type = "c4z";
        this.driverName = driverName;
        this.files = []
        this.folders = [];
        this.contents = {};
        this.encrypted = false;
    }

    /**
     * Scans a directory and adds all files into the manifest.
     * @param path Source directory to scan
     */
    async scan(path) {
        this.files = [];
        this.folders = [];

        try {
            let files = await fsPromises.readdir(path, { withFileTypes: true });

            files.forEach((file) => {
                if (file.isDirectory()) {
                    this.folders.push(file.name)
                } else {
                    this.files.push(file.name)
                }
            })
        } catch (err) {
            console.log(err)
        }
    }

    /**
     * Adds a folder to the manifest
     * @param path Path to file relative to the manifest
     */
    addFolder(path) {
        this.folders.push(path)
    }

    /**
     * Adds a file path and the file content into the manifest
     * @param path Path to file relative to the manifest
     * @param content The content of the file
     */
    addFile(path, content) {
        this.files.push(path)
        this.contents[path] = content;
    }

    /**
     * Moves the required files from the source directory to the intermediate directory. Intermediate directory will be used with DriverPackager.exe
     * @param src Path to source directory
     * @param int Path to intermediate directory
     * @returns 
     */
    async prepare(src: string, int: string) {
        return new Promise(async (resolve, reject) => {
            try {
                await fsPromises.rmdir(int, { recursive: true })

                fse.copy(src, int, async (err, data) => {
                    if (err) {
                        reject(err)
                    } else {
                        for (let i = 0; i < this.files.length; i++) {
                            if (this.contents[this.files[i]]) {
                                await ForceWrite(path.join(int, this.files[i]), this.contents[this.files[i]])
                            }
                        }

                        resolve(data)
                    }
                })
            } catch (err) {
                reject(err)
            }
        })
    }

    /**
     * Builds the driver using DriverPackager.exe
     * @param source Path to the source directory
     * @param destination Path to the output directory
     * @param doScan Runs the scan method to determine which files exist in the source directory. They will automatically be included in the manifest.
     * @returns 
     */
    async build(source: string, intermediate: string, destination: string, doScan: boolean): Promise<Boolean> {
        return new Promise(async (resolve, reject) => {
            if (doScan) {
                await this.scan(intermediate);
            }

            try {
                await ForceWrite(path.join(intermediate, 'manifest.xml'), this.toString());
            } catch (err) {
                vscode.window.showInformationMessage(err.message);
            }

            const configuration = vscode.workspace.getConfiguration('control4');
            const packager = configuration.get<string>('driverPackagerLocation');

            try {
                // Try to retrive DriverPackager.exe information, if it fails the configuration is invalid
                fsPromises.stat(packager);
            } catch (err) {
                vscode.window.showInformationMessage("Unable to locate DriverPackager.exe: Missing File - " + packager);
            }

            if (configuration.get<string>('buildMethod') == "OpenSSL") {

            } else {
                // Attempt to build the driver using driver packager
                cp.execFile(path.basename(packager), ["-v", intermediate, destination, 'manifest.xml'], { shell: false, cwd: path.dirname(packager), timeout: 3000 }, (err, stdout, stderr) => {
                    if (err) {
                        vscode.window.showErrorMessage(stderr ? stderr : stdout);
                        reject(false)
                    } else {
                        vscode.window.showInformationMessage(`"${this.driverName}.c4z" built at ${new Date().toLocaleTimeString()}`, { modal: false }, "Open Folder", "Ok").then(selection => {
                            if (selection === "Open Folder") {
                                vscode.env.openExternal(vscode.Uri.file(destination));
                            }
                        });

                        resolve(true)
                    }
                })
            }
        })
    }

    toString() {
        var root = builder.create("Driver").root()
        root.att("type", this.type)
            .att("name", this.driverName)
            .att("squishLua", "false")
            .att("Encryption", this.encrypted ? "true" : "false")

        var items = root.ele("Items");

        for (var i = 0; i < this.files.length; i++) {
            items.ele("Item", {
                type: "file",
                name: this.files[i]
            });
        }

        for (var i = 0; i < this.folders.length; i++) {
            items.ele("Item", {
                type: "dir",
                name: this.folders[i],
                recurse: true
            })
        }

        return root.end({ prettyPrint: true })
    }
}