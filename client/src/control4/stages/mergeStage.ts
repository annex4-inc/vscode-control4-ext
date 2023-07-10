import * as path from 'path';
import { BuildStage } from '../builder';
import { ReadFileContents, WriteFileContents } from '../../utility';

export default class MergeStage implements BuildStage {
    static r = new RegExp(/require\s*?[\[\[]*?['"(]+(.+)['"]+\)/, "gm");

    constructor() { }

    regExpEscape(literal_string) {
        return literal_string.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
    }

    async GetModules(_source: string, module: string) {
        let fileDocument = await ReadFileContents(path.join(_source, ... module.split('.')) + ".lua");
        let modules = [];

        // Get the modules for this dependency
        let moduleMatches = fileDocument.matchAll(MergeStage.r)

        // Recursively retrieve all nested modules
        for (const match of moduleMatches) {
            let nested = await this.GetModules(_source, match[1])

            if (nested && nested.length > 0) {
                modules.push(nested)
            }
            
            modules.push(match[1]);
        }

        return modules
    }

    async Execute(_source: string, intermediate: string, _destination: string): Promise<any> {
        let srcFile = path.join(intermediate, "driver.lua")
        let srcDocument = await ReadFileContents(srcFile);
        let modules = "";

        let matches = srcDocument.matchAll(MergeStage.r);

        // Create module data for each require statement
        for (const match of matches) {
            let fileDocument = await ReadFileContents(path.join(_source, ... match[1].split('.')) + ".lua");
            let nestedPackages = await this.GetModules(_source, match[1])

            // Recursively retrieve modules
            for (const nested of nestedPackages) {
                let doc = await ReadFileContents(path.join(_source, ... nested.split('.')) + ".lua");

                if (doc) {
                    modules = modules + `package.preload['${nested}'] = (function(...)\n ${doc}\n end)\n`
                }
            }

            // Check to make sure the library exists, if not don't include it.
            if (fileDocument) {
                modules = modules + `package.preload['${match[1]}'] = (function(...)\n ${fileDocument}\n end)\n`
            }            
        }

        srcDocument = modules + srcDocument;

        await WriteFileContents(srcFile, srcDocument);
    }

    OnSuccess(result: any): String {
        if (typeof(result) === "string") {
            return result;
        } else {
            return `[Lua Merge   ] Injected lua source from files`;
        }
    }

    OnFailure(result: any): String {
        return "[Lua Merge   ] Failed to inject lua source";
    }
}



