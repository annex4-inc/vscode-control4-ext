import { BuildStage } from '../builder';
import Package from '../../package';
import Manifest from '../manifest';

export default class ManifestStage implements BuildStage {
    package: any
    pkg: Package
    encrypted: boolean

    constructor(pkg: Package, encrypted: boolean) {
        this.pkg = pkg;
        this.encrypted = encrypted;
    }

    async Execute(source: string, intermediate: string, destination: string): Promise<any> {
        let manifest = new Manifest(this.pkg.name);

        manifest.encrypted = this.encrypted;

        return await manifest.build(source, intermediate, destination, true);
    }

    OnSuccess(result: any): String {
        return `[Manifest    ] Built ${this.pkg.name}.c4z`;
    }

    OnFailure(result: any): String {
        return `[Manifest    ] Failed to build ${this.pkg.name}.c4z`;
    }
}



