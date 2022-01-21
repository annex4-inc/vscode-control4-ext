'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import { ReadFileContents, WriteFileContents } from './utility';

const fsPromises = fs.promises;

export default class Package {
  name: string
  watcher: vscode.FileSystemWatcher
  textDocument: vscode.TextDocument

  constructor() {
    /*this.watcher = vscode.workspace.createFileSystemWatcher("package.json", false, false, true);

    this.watcher.onDidChange(async () => {
        this.textDocument = await vscode.workspace.openTextDocument(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'package.json'));
    })
    */
  }

  async getDependencyOrder() {
    this.textDocument = await vscode.workspace.openTextDocument(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'package.json'));

    let p = JSON.parse(this.textDocument.getText());
    let dependencies = p.dependencies;

    if (dependencies) {
      let modules = Object.keys(dependencies);

      let deps = [];

      for (let i = 0; i < modules.length; i++) {
        deps.push(await this.getModuleDependencies(modules[i], 0));
      }

      //let srcDocument = modulePackage.main;
      //let srcFile = await vscode.workspace.openTextDocument(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'node_modules', module, srcDocument));
      //let srcData = srcFile.getText();

      console.log(deps);

      // Flatten the array
      deps = deps.flat();

      // Sort by depth
      let result = deps.sort(function (a, b) {
        return b.depth - a.depth;
      });

      let hierarchy = new Map();
      let final = [];

      for (let i = 0; i < result.length; i++) {
        if (hierarchy.has(result[i].module)) {
          continue;
        }

        hierarchy.set(result[i].module, i);
        final.push(result[i].module);
      }

      return final;
    }
  }

  async getModuleDependencies(module: string, depth: number): Promise<any> {
    try {
      let modulePackageDocument = await vscode.workspace.openTextDocument(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'node_modules', module, 'package.json'));
      let modulePackage = JSON.parse(modulePackageDocument.getText());

      let deps = [{ module: module, depth: depth }];

      if (modulePackage.dependencies) {
        let modules = Object.keys(modulePackage.dependencies);

        if (modules.length > 0) {
          for (let i = 0; i < modules.length; i++) {
            deps.push(await this.getModuleDependencies(modules[i], depth + 1));
          }
        }
      }

      return deps.flat();
    } catch (err) {
      console.log(err.message);
      throw new Error(`Failed to load module: ${module}`)
    }
  }

  async injectDependencies(modules, file) {
    let srcDocument = await ReadFileContents(file);
    let src = "";

    for (let i = 0; i < modules.length; i++) {
      let module = modules[i];

      let modulePackageDocument = await ReadFileContents(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'node_modules', module, 'package.json').fsPath);
      let json = JSON.parse(modulePackageDocument);

      let srcPackageDocument = await ReadFileContents(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'node_modules', module, json.main).fsPath);

      src += srcPackageDocument + "\r\n"
    }

    src += srcDocument;

    let environment = await ReadFileContents(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'environment.json').fsPath);

    if (environment) {
      let env = JSON.parse(environment)

      for (const [key, value] of Object.entries(env)) {
        //@ts-ignore
        src = src.replace(`\[\[ENV.${key}\]\]`, value)
      }
    }

    return await WriteFileContents(file, src);
  }

  /*async incrementVersion() {
    let p = new vscode.Task( new vscode.ProcessExecution("npm",);
    p.args = ["version", "patch"]
  }*/

  static async Get(path) {
    let result = await fsPromises.readFile(path)
    let pkg = new Package();

    Object.assign(pkg, JSON.parse(result.toString()))

    return pkg;
  }
}