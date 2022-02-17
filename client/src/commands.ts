'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Driver } from './control4/driver';

import ActionsResource from './components/actions';
import PropertiesResource from './components/properties';
import EventsResource from './components/events';
import CommandsResource from './components/commands';
import ConnectionsResource from './components/connections';
import ProxiesResource from './components/proxies';
import UIResource from "./components/ui";

// Retrieve the package, settings, and tasks from json template
import pjson from "./resources/package.json";
import sjson from "./resources/.vscode/settings.json";
import tjson from "./resources/.vscode/tasks.json";

import { Builder, BuildVersion } from './control4/builder';
import { ForceWrite, ReadFileContents, WriteFileContents, WriteIfNotExists } from './utility';

import AdmZip from 'adm-zip'
import Package from './package';

var templatePackage = pjson as any;
var templateSettings = sjson as any;
var templateTasks = tjson as any;

const fsPromises = fs.promises;

async function control4Create() {
  try {
    const root = vscode.workspace.workspaceFolders[0].uri.fsPath;

    try {
      const input = await vscode.window.showInputBox();

      var handler = await fsPromises.open(path.join(root, "package.json"), 'wx');

      templatePackage.name = input.toLowerCase().replace(" ", "_");
      templatePackage.control4.name = input;
      templatePackage.control4.created = new Date().toLocaleString('en-US', { timeZone: 'UTC' });

      await handler.writeFile(JSON.stringify(templatePackage, null, 2));
      await handler.close()
    } catch (err) {
      vscode.window.showWarningMessage("package.json already exists.")
      return;
    }

    // Write default lua script
    await WriteIfNotExists(`${root}/src/driver.lua`, "");

    // Write default documentation file
    await WriteIfNotExists(`${root}/src/www/documentation.html`, "");

    // Initialize all component files
    await ActionsResource.initialize();
    await PropertiesResource.initialize();
    await EventsResource.initialize();
    await CommandsResource.initialize();
    await ConnectionsResource.initialize();
    await ProxiesResource.initialize();
    await UIResource.initialize();

    // Initialize vscode settings
    await WriteIfNotExists(path.join(root, ".vscode", "settings.json"), JSON.stringify(templateSettings, null, 2));
    await WriteIfNotExists(path.join(root, ".vscode", "tasks.json"), JSON.stringify(templateTasks, null, 2));
    await WriteIfNotExists(path.join(root, ".gitignore"), await ReadFileContents(path.join(this.extensionUri.fsPath, "client", "src", "resources", "templates", ".gitignore")));
    await WriteIfNotExists(path.join(root, ".npmrc"), "@annex4:registry=https://npm.pkg.github.com" );

    let contents = await ReadFileContents(path.join(this.extensionUri.fsPath, "client", "src", "resources", "templates", "test.lua"));

    await WriteIfNotExists(path.join(root, "tests", "test.lua"), contents);
  } catch (err) {
    vscode.window.showWarningMessage("Internal error " + err.message);
  }
}

async function control4Import() {
  let p = vscode.window.showOpenDialog();
  
  // Initialize all component files
  await ActionsResource.initialize();
  await PropertiesResource.initialize();
  await EventsResource.initialize();
  await CommandsResource.initialize();
  await ConnectionsResource.initialize();
  await ProxiesResource.initialize();
  await UIResource.initialize();

  p.then(async (result: vscode.Uri[]) => {
    let c4z = result[0];

    let zip = new AdmZip(c4z.fsPath);

    let entries = zip.getEntries();
    let root = vscode.workspace.workspaceFolders[0].uri.fsPath;

    for (const entry of entries) {
      if (entry.entryName.startsWith("www")) {
        // Copy into www folder
        try {
          let contents = zip.readFile(entry)

          await ForceWrite(path.join(root, "src", entry.entryName), contents)
        } catch (err) {
          console.log(err.message)
        }
      } else if (entry.name == "driver.xml") {
        try {
          let contents = zip.readFile(entry)

          let driver: Driver = Driver.Parse(contents.toString('utf8'))

          let result = await Promise.all([
            ActionsResource.Write(driver.actions),
            PropertiesResource.Write(driver.properties),
            ConnectionsResource.Write(driver.connections),
            EventsResource.Write(driver.events),
            CommandsResource.Write(driver.commands),
            ProxiesResource.Write(driver.proxies),
            UIResource.Write(driver.UI)
          ])

          // Initialize vscode settings
          await WriteIfNotExists(path.join(root, ".vscode", "settings.json"), JSON.stringify(templateSettings, null, 2));
          await WriteIfNotExists(path.join(root, ".vscode", "tasks.json"), JSON.stringify(templateTasks, null, 2));
          await WriteIfNotExists(path.join(root, ".gitignore"), await ReadFileContents(path.join(this.extensionUri.fsPath, "client", "src", "resources", "templates", ".gitignore")));
          await WriteIfNotExists(path.join(root, ".npmrc"), "@annex4:registry=https://npm.pkg.github.com" );

          templatePackage.name = driver.name.toLowerCase().replace(" ", "_");
          templatePackage.control4.name = driver.name;
          templatePackage.control4.created = new Date().toLocaleString('en-US', { timeZone: 'UTC' });
          templatePackage.control4.model = driver.model;
          templatePackage.control4.manufacturer = driver.manufacturer;
          templatePackage.control4.creator = driver.creator;
          templatePackage.control4.capabilities = driver.capabilities;

          var handler = await fsPromises.open(path.join(root, "package.json"), 'wx');
          await handler.writeFile(JSON.stringify(templatePackage, null, 2));
          await handler.close()

          let tests = await ReadFileContents(path.join(this.extensionUri.fsPath, "client", "src", "resources", "templates", "test.lua"));

          await WriteIfNotExists(path.join(root, "tests", "test.lua"), tests);
        } catch (err) {
          console.log(err);
        }
      } else {
        let contents = zip.readFile(entry)

        await ForceWrite(path.join(root, "src", entry.entryName), contents)
      }
    }

    vscode.window.showInformationMessage(`Imported ${c4z.fsPath}`);

  }, function (err) {
    vscode.window.showErrorMessage(`Failed to import: ${err.message}`)
  })
}

async function rebuildTestDependencies() {
  let pkg = await Package.Get(`${vscode.workspace.rootPath}/package.json`);
  let modules = await pkg.getDependencyOrder(true);

  let content = "";

  if (modules) {
    for (let i = 0; i < modules.length; i++) {
      content += `dofile("node_modules/${modules[i]}/src.lua")\r\n`
    }
  }

  return await WriteFileContents(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'tests', 'generated.lua').fsPath, content);
}

export {
  control4Create,
  control4Import,
  rebuildTestDependencies
}