import * as path from 'path';
import { BuildStage } from '../../builder';
import { ReadFileContents, WriteFileContents, FileExists } from '../../../utility';

export default class MergeStage extends BuildStage {
    static r = new RegExp(/require\s*?[\[\[]*?['"(]+(.+)['"]+\)/, "gm");

    constructor(task, pkg, ctx) { super("Merge", task, pkg, ctx) }

    regExpEscape(literal_string) {
        return literal_string.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
    }

    async FindModule(source: string, module: string) {
        let file = path.join(source, ... module.split('.')) + ".lua"
        let exists = await FileExists(file);

        if (!exists) {
            file = path.join(source, "../", ... module.split('.')) + ".lua"
        }

        return file
    }

    async GetModules(source: string, module: string) {
        let fileDocument = await ReadFileContents(await this.FindModule(source, module));
        let modules = [];

        // Get the modules for this dependency
        let moduleMatches = fileDocument.matchAll(MergeStage.r)

        // Recursively retrieve all nested modules
        for (const match of moduleMatches) {
            let nested = await this.GetModules(source, match[1])

            if (nested && nested.length > 0) {
                modules.push(nested)
            }
            
            modules.push(match[1]);
        }

        return modules
    }

    /*
    async Execute(source: string, intermediate: string, _destination: string): Promise<any> {
        let srcFile = path.join(intermediate, "driver.lua")
        let srcDocument = await ReadFileContents(srcFile);
        let modules = "";
        let merged = [];

        let matches = srcDocument.matchAll(MergeStage.r);

        // Create module data for each require statement
        for (const match of matches) {
            let file = await this.FindModule(source, match[1])
            let fileDocument = await ReadFileContents(file);

            // This will automatically skip nested 'require' dependencies, libraries should be built with squish.
            if (!fileDocument){
                continue;
            }
            
            let nestedPackages = await this.GetModules(source, match[1])

            merged.push(match[1])
            if (nestedPackages.length > 0) {
                merged.push(nestedPackages)
            }

            for (const nested of nestedPackages) {
                let doc = await ReadFileContents(path.join(source, ... nested.split('.')) + ".lua");

                if (doc) {
                    modules = modules + `package.preload['${nested}'] = (function(...)\n ${doc}\n end)\n`
                }
            }

            if (fileDocument) {
                modules = modules + `package.preload['${match[1]}'] = (function(...)\n ${fileDocument}\n end)\n`
            }            
        }

        srcDocument = modules + srcDocument;

        await WriteFileContents(srcFile, srcDocument);
    }
    */

    async Execute(_source: string, intermediate: string, _destination: string): Promise<any> {
        let srcFile = path.join(intermediate, "driver.lua")
        let srcDocument = await ReadFileContents(srcFile);

        let r = new RegExp(/require\s*?[\[\[]*?['"(]+(.+)['"]+\)/, "gm");
        let matches = srcDocument.matchAll(r);
        let modules = ""

        // Create module data for each require statement
        for (const match of matches) {
            let fileDocument = await ReadFileContents(path.join(_source, ... match[1].split('.')) + ".lua");

            // Check to make sure the library exists, if not don't include it.
            // This could be caused by a package using its own require statements in which case it should handle the package preload.
            if (fileDocument) {
                modules = modules + `package.preload['${match[1]}'] = (function(...)\n  local fn = load([[\n\n${fileDocument}\n\n]])\n\n  return fn()\nend)()\n`
            }
        }

        srcDocument = modules + srcDocument;

        await WriteFileContents(srcFile, srcDocument);
    }

    OnSuccess(result: any): String {
        if (typeof(result) === "string") {
            return result;
        } else {
            return `${result.join(", ")}`;
        }
    }

    OnFailure(result: any): String {
        return "Failed to inject lua source";
    }
    
    IsEnabled(): Boolean {
        return this.task.merge || this.task.encryption;
    }
}



