'use strict';

import * as vscode from 'vscode';
import * as path from 'path';

import Package from '../package';
import {
    OpenSSLStage,
    IncrementVersionStage,
    IntermediateStage,
    DriverXmlBuildStage,
    ManifestStage,
    DependencyInjectionStage,
    ZipStage,
    CopyToOutputStage,
    CleanStage,
    LuaInjectionStage
} from "./stages"

export enum BuildVersion {
  Debug = "debug",
  Release = "release"
}

export interface BuildStage {
  Execute(source: string, intermediate: string, destination: string): Promise<any>;
  OnSuccess(result: any): String
  OnFailure(result: any): String
}

export class Builder {
  static async* Build(version: BuildVersion, encrypted: boolean, templated: boolean, development: boolean, context: vscode.ExtensionContext) {
    const pkg = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, 'package.json');

    const _package = await Package.Get(pkg);

    // Prepare the build stages
    let stages = new Array<BuildStage>();
        stages.push(new IncrementVersionStage());
        stages.push(new CleanStage());
        stages.push(new IntermediateStage());
        stages.push(new DriverXmlBuildStage(_package, encrypted));
        stages.push(new DependencyInjectionStage(_package));

    if (development) {
        stages.push(new LuaInjectionStage());
    }
        
    if (vscode.workspace.getConfiguration('control4').get<string>('buildMethod') == "DriverPackager") {
        stages.push(new ManifestStage(_package, encrypted));
    } else {
        if (!templated) {
            stages.push(new OpenSSLStage(encrypted, context.asAbsolutePath(path.join('client', 'src', 'resources', 'certificate.pem'))));
        }
        stages.push(new ZipStage(_package));
    }

    stages.push(new CopyToOutputStage(_package));

    // Establish working directories
    const src = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, 'src');
    const int = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, 'intermediate', version);
    const dst = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, 'output', version);

    for (let i = 0; i < stages.length; i++) {
        let stage = stages[i];

        try {
            let result = await stage.Execute(src, int, dst);

            yield {
                message: stage.OnSuccess(result)
            }
        } catch (err) {
            yield {
                message: stage.OnFailure(err)
            }
        }
    }
  }
}