'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as builder from 'xmlbuilder2';
import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as fse from 'fs-extra';
import { ForceWrite } from "../utility"

const fsPromises = fs.promises;

export default class Manifest {
  files: string[]
  folders: string[]
  contents: object
  driverName: string
  type: string
  encrypted: boolean
  buildType: string

  constructor(driverName: string, buildType: string) {
    this.type = "c4z";
    this.driverName = driverName;
    this.files = []
    this.folders = [];
    this.contents = {};
    this.encrypted = false;
    this.buildType = buildType;
  }

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

  addFolder(path) {
    this.folders.push(path)
  }

  addFile(path, content) {
    this.files.push(path)
    this.contents[path] = content;
  }

  async prepare(src : string, int: string) {
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

  async build(source: string, destination: string, doScan: boolean) : Promise<Boolean> {
    return new Promise(async (resolve, reject) => {
      if (doScan) {
        await this.scan(source);
      }
  
      try {
        await ForceWrite(`${vscode.workspace.rootPath}/intermediate/${this.buildType}/manifest.xml`, this.toString());
      } catch (err) {
        vscode.window.showInformationMessage(err.message);
      }
  
      const configuration = vscode.workspace.getConfiguration('control4');
      const packager = configuration.get<string>('driverPackagerLocation');
  
      try {
        let stat = fsPromises.stat(packager);
  
        console.log(stat);
      } catch (err) {
        vscode.window.showInformationMessage("Unable to locate DriverPackager.exe: Missing File - " + packager);
      }
  
      cp.execFile(path.basename(packager), ["-v", source, destination, 'manifest.xml'], { shell: false, cwd: path.dirname(packager), timeout: 3000 }, (err, stdout, stderr) => {
        if (err) {
          vscode.window.showErrorMessage(stderr ? stderr : stdout);
          reject(false)
        } else {
          vscode.window.showInformationMessage(`"${this.driverName}.c4z" built at ${new Date().toLocaleTimeString()}`, {modal: false}, "Open Folder", "Ok").then(selection => {
            if (selection === "Open Folder") {
              vscode.env.openExternal(vscode.Uri.file(destination));
            }
          });

          resolve(true)
        }
      })
    })
  }
}