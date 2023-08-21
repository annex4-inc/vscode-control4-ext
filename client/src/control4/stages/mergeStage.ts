import * as path from 'path';
import { BuildStage } from '../builder';
import { ReadFileContents, WriteFileContents } from '../../utility';

export default class MergeStage implements BuildStage {
    static r = new RegExp(/require\s*?[\[\[]*?['"(]+(.+)['"]+\)/, "gm");

    constructor() { }

    regExpEscape(literal_string) {
        return literal_string.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
    }

/*     async FindModule(_source: string, module: string) {
        let file = path.join(_source, ... module.split('.')) + ".lua"
        let exists = await FileExists(file);

        if (!exists) {
            file = path.join(_source, "../", ... module.split('.')) + ".lua"
        }

        return file
    } */

 /*    async GetModules(_source: string, module: string) {
        let fileDocument = await ReadFileContents(await this.FindModule(_source, module));
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
    } */

/*     async Execute(_source: string, intermediate: string, _destination: string): Promise<any> {
        let srcFile = path.join(intermediate, "driver.lua")
        let srcDocument = await ReadFileContents(srcFile);
        let modules = "";

        let matches = srcDocument.matchAll(MergeStage.r);

        // Create module data for each require statement
        for (const match of matches) {
            let file = await this.FindModule(_source, match[1])
            let fileDocument = await ReadFileContents(file);
            let nestedPackages = await this.GetModules(_source, match[1])

            for (const nested of nestedPackages) {
                let doc = await ReadFileContents(path.join(_source, ... nested.split('.')) + ".lua");

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
    } */

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
                modules = modules + `package.preload['${match[1]}'] = (function(...)\n ${fileDocument} end)\n`
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



