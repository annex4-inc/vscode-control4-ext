'use strict';

import * as vscode from 'vscode';
import * as path from 'path';

import Package from '../package';
import { glob } from 'glob';
import { Control4BuildTaskDefinition } from '../control4BuildTaskProvider';

export enum BuildVersion {
  Debug = "debug",
  Release = "release"
}

export abstract class BuildStage {
  task: Control4BuildTaskDefinition
  pkg: Package
  context: vscode.ExtensionContext
  name: string

  constructor(name: string, task: Control4BuildTaskDefinition, pkg: Package, ctx: vscode.ExtensionContext) {
    this.name = name;
    this.task = task;
    this.pkg = pkg;
    this.context = ctx;
  }

  abstract Execute(source: string, intermediate: string, destination: string): Promise<any>;
  abstract OnSuccess(result: any): String
  abstract OnFailure(result: any): String
  abstract IsEnabled(): Boolean
}

const BuildStages =  ["prebuild", "prescript", "script", "postscript", "build", "postbuild"]

const GetBuildStages = async(stage: string, task: Control4BuildTaskDefinition, pkg: Package, context: vscode.ExtensionContext) => {
    let files = await glob("**/**.stage.[tj]s", {cwd: path.join(__dirname, `./stages/${stage}`)})
    let stages : Array<BuildStage> = [];

    for (let i = 0; i < files.length; i++) {
        let module = await import(path.join(__dirname, `./stages/${stage}`, files[i]))

        stages.push(new module.default(task, pkg, context))
    }

    return stages
}

export class Builder {
  static async* Build(rootPath: string, task: Control4BuildTaskDefinition, context: vscode.ExtensionContext) {
    const pkgFile = path.join(rootPath, 'package.json');

    // Establish working directories
    const src = path.join(rootPath, 'src');
    const int = path.join(rootPath, 'intermediate', task.version);
    const dst = path.join(rootPath, 'output', task.version);

    const pkg = await Package.Get(pkgFile);

    let stages = new Array<BuildStage>();

    for (let i = 0; i < BuildStages.length; i++) {
        let nested = await GetBuildStages(BuildStages[i], task, pkg, context);
        for (let i = 0; i < nested.length; i++) {
            stages.push(nested[i])
        }
    }

    let success = 0;
    let failure = 0;

    let skipped = [];

    for (let i = 0; i < stages.length; i++) {
        let stage = stages[i];

        if (!stage.IsEnabled()) {
            skipped.push(stage.name);
            continue;
        }

        yield {
            message: '\x1b[34m' + stage.name + '\x1b[0m'
        }

        try {
            let start = Date.now();
            let result = await stage.Execute(src, int, dst);
            let end = Date.now();

            success += 1;

            yield {
                message:  `\x1b[92m 🗸 \x1b[0m ${stage.OnSuccess(result)} \x1b[90m (${end - start}ms)`
            }
        } catch (err) {
            failure += 1;

            yield {
                message: '\x1b[91m 𐄂 ' + stage.OnFailure(err) + '\x1b[0m'
            }
        }
    }

    if (skipped.length > 0) {
        yield {
            message: `\r\n\t \x1b[90m Skipped ${skipped.length} (${skipped.join(", ")}) stages \x1b[0m`
        }
    }

    if (failure == 0) {
        yield {
            message:  '\r\n\t \x1b[92m ✔ ' + `${success} stages complete`
        }
    } else {
        yield {
            message:  '\r\n\t \x1b[92m ✔ ' + `${success} stages complete, ` + '\x1b[0m' + `\x1b[91m ${failure} failed` + '\x1b[0m'
        }
    }
  }
}