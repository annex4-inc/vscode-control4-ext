'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import Manifest from './manifest';
import { Driver } from './driver';
import Package from '../package';
import { StartProcess } from '../utility';

export enum BuildVersion {
  Debug = "debug",
  Release = "release"
}

export class Builder {
  static async* Build(version: BuildVersion, encrypted: boolean, templated: boolean) {
    const build = vscode.workspace.getConfiguration('control4.build');
    const increment = build.get<boolean>('autoIncrementVersion');

    if (increment) {
      try {
        yield {
          message: `Incrementing driver version to "${await StartProcess("npm", ["version", "--no-git-tag-version", "patch"])}"`
        }
      } catch (err) {
        console.log(err)
      }
    }

    let pkg = await Package.Get(`${vscode.workspace.workspaceFolders[0].uri.fsPath}/package.json`);
    let driver = await Driver.From(pkg);
        driver.encrypted = encrypted;

    // Establishing working directories
    const src = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, 'src');
    const int = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, 'intermediate', version);
    const dst = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, 'output', version);

    let manifest = new Manifest(pkg.name, version);

    try {
      manifest.addFile("driver.xml", driver.build());
      manifest.encrypted = encrypted;
    } catch (err) {
      console.log(err);

      yield {
        code: -1,
        message: err.message
      }

      return {
        code: -1,
        message: "Failed to prepare driver.xml",
        inner: err.message
      }
    }

    // Copies base files into an intermediate directory for building
    try {
      await manifest.prepare(src, int)
      yield {
        code: 1,
        message: "Intermediate folder prepared"
      }
    } catch (err) {
      console.log(err);
      return {
        code: -1,
        message: "Failed to prepare intermediate folder",
        inner: err.message
      }
    }

    // Inject dependies from driver lua compilation
    try {
      let modules = await pkg.getDependencyOrder();

      if (modules) {
        yield {
          code: 3,
          message: `Dependencies:\r\n\t${modules.join("\r\n\t")}`
        }

        await pkg.injectDependencies(modules, path.join(int, 'driver.lua'));
      }

      yield {
        code: 4,
        message: "Dependencies injected"
      }
    } catch (err) {
      console.log(err);
      return {
        code: -1,
        message: "Failed to inject dependencies",
        inner: err.message
      }
    }

    // Use driver packager to build the manifest
    try {
      if (templated) {
        await driver.zip(int, dst);
      } else {
        await manifest.build(int, dst, true);
      }

      yield {
        code: 5,
        message: "Driver built"
      }
    } catch (err) {
      console.log(err);
      return {
        code: -1,
        message: "Failed to build driver",
        inner: err.message
      }
    }

    try {
      const build = vscode.workspace.getConfiguration('control4.build');
      const ex = build.get<boolean>('exportToDriverLocation');

      let root = path.join(process.env.USERPROFILE, "Documents", "Control4", "Drivers")

      // @ts-expect-error
      if (pkg.control4 && pkg.control4.agent) {
        root = path.join(process.env.USERPROFILE, "Documents", "Control4", "Agents")
      }

      let driver = path.join(root, pkg.name + ".c4z")

      if (ex) {
        try {
          await fs.promises.copyFile(path.join(dst, pkg.name + ".c4z"), driver)

          yield {
            message: `Copied driver to: ${driver}`
          }
        } catch (err) {
          return {
            code: -1,
            message: "Failed to export driver",
            inner: err.message
          }
        }
      }
    } catch (err) {
      return {
        code: -1,
        message: "Failed to export driver",
        inner: err.message
      }
    }
  }
}