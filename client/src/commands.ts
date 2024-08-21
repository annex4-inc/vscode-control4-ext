'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Driver } from './control4/driver';

import {
  ActionsResource, 
  CommandsResource,
  ConnectionsResource,
  EventsResource,
  PropertiesResource,
  ProxiesResource,
  UIResource
} from './components'

// Retrieve the package, settings, and tasks from json template
import pjson from "./resources/package.json";
import sjson from "./resources/.vscode/settings.json";
import tjson from "./resources/.vscode/tasks.json";

import { FileExists, ForceWrite, ReadFileContents, WriteFileContents, WriteIfNotExists } from './utility';

import AdmZip from 'adm-zip'
import Package from './package';

var templatePackage = pjson as any;
var templateSettings = sjson as any;
var templateTasks = tjson as any;

const fsPromises = fs.promises;

async function control4Create(rootPath: string, name: string) {
  try {
    try {
      let p = path.join(rootPath, "package.json");

      if (!await FileExists(p)) {
        await fsPromises.mkdir(rootPath, {recursive: true});
      }

      var handler = await fsPromises.open(path.join(rootPath, "package.json"), 'wx');

      templatePackage.name = name.toLowerCase().replace(/ /g, "_");
      templatePackage.control4.name = name;
      templatePackage.control4.created = new Date().toLocaleString('en-US', { timeZone: 'UTC' });

      await handler.writeFile(JSON.stringify(templatePackage, null, 2));
      await handler.close()
    } catch (err) {
      vscode.window.showWarningMessage("package.json already exists.")
      return;
    }

    // Write default lua script
    await WriteIfNotExists(`${rootPath}/src/driver.lua`, "");

    // Write default documentation file
    await WriteIfNotExists(`${rootPath}/src/www/documentation.html`, "");

    // Initialize all component files
    await ActionsResource.initialize();
    await PropertiesResource.initialize();
    await EventsResource.initialize();
    await CommandsResource.initialize();
    await ConnectionsResource.initialize();
    await ProxiesResource.initialize();
    await UIResource.initialize();

    // Initialize vscode settings
    await WriteIfNotExists(path.join(rootPath, ".vscode", "settings.json"), JSON.stringify(templateSettings, null, 2));
    await WriteIfNotExists(path.join(rootPath, ".vscode", "tasks.json"), JSON.stringify(templateTasks, null, 2));
    await WriteIfNotExists(path.join(rootPath, ".gitignore"), await ReadFileContents(path.join(this.extensionUri.fsPath, "client", "src", "resources", "templates", ".gitignore")));
    await WriteIfNotExists(path.join(rootPath, ".npmrc"), "@annex4:registry=https://npm.pkg.github.com" );

    let contents = await ReadFileContents(path.join(this.extensionUri.fsPath, "client", "src", "resources", "templates", "test.lua"));

    await WriteIfNotExists(path.join(rootPath, "tests", "test.lua"), contents);
  } catch (err) {
    vscode.window.showWarningMessage("Internal error " + err.message);
  }
}

async function control4Import(rootPath: vscode.Uri, destinationPath: string) {
  // Initialize all component files
  await ActionsResource.initialize();
  await PropertiesResource.initialize();
  await EventsResource.initialize();
  await CommandsResource.initialize();
  await ConnectionsResource.initialize();
  await ProxiesResource.initialize();
  await UIResource.initialize();

  let c4z = rootPath;
  let zip = new AdmZip(c4z.fsPath);
  let entries = zip.getEntries();

  for (const entry of entries) {
    if (entry.entryName.startsWith("www")) {
      // Copy into www folder
      try {
        let contents = zip.readFile(entry)

        await ForceWrite(path.join(destinationPath, "src", entry.entryName), contents)
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
        await WriteIfNotExists(path.join(destinationPath, ".vscode", "settings.json"), JSON.stringify(templateSettings, null, 2));
        await WriteIfNotExists(path.join(destinationPath, ".vscode", "tasks.json"), JSON.stringify(templateTasks, null, 2));
        await WriteIfNotExists(path.join(destinationPath, ".gitignore"), await ReadFileContents(path.join(this.extensionUri.fsPath, "client", "src", "resources", "templates", ".gitignore")));
        await WriteIfNotExists(path.join(destinationPath, ".npmrc"), "@annex4:registry=https://npm.pkg.github.com" );

        templatePackage.name = path.basename(c4z.path, ".c4z");
        templatePackage.control4.name = driver.name;
        templatePackage.control4.created = new Date().toLocaleString('en-US', { timeZone: 'UTC' });
        templatePackage.control4.model = driver.model;
        templatePackage.control4.manufacturer = driver.manufacturer;
        templatePackage.control4.creator = driver.creator;
        templatePackage.control4.capabilities = driver.capabilities;
        templatePackage.control4.icon = driver.icon;

        var handler = await fsPromises.open(path.join(destinationPath, "package.json"), 'wx');
        await handler.writeFile(JSON.stringify(templatePackage, null, 2));
        await handler.close()

        let tests = await ReadFileContents(path.join(this.extensionUri.fsPath, "client", "src", "resources", "templates", "test.lua"));

        await WriteIfNotExists(path.join(destinationPath, "tests", "test.lua"), tests);
      } catch (err) {
          return vscode.window.showInformationMessage(`${err.message}`);
      }
    } else {
      let contents = zip.readFile(entry)

      await ForceWrite(path.join(destinationPath, "src", entry.entryName), contents)
    }
  }
}

async function rebuildTestDependencies() {
  let pkg = await Package.Get(`${vscode.workspace.rootPath}/package.json`);
  let modules = await pkg.getDependencyOrder(true);

  let content = "";

  if (modules) {
    for (let i = 0; i < modules.length; i++) {
      let module = modules[i];

      let modulePackageDocument = await ReadFileContents(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'node_modules', module, 'package.json').fsPath);
      let json = JSON.parse(modulePackageDocument);

      content += `dofile("node_modules/${modules[i]}/${json.main}")\r\n`
    }
  }

  return await WriteFileContents(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'tests', 'generated.lua').fsPath, content);
}

export {
  control4Create,
  control4Import,
  rebuildTestDependencies
}