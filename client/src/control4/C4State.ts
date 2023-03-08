
import 'reflect-metadata';
import { jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';

@jsonObject
export class C4State {
    @jsonMember
    id: number

    @jsonMember
    small: string

    @jsonMember
    large: string

    constructor(options) {
        if (options) {
            this.id = options.id;
            this.small = options.small;
            this.large = options.large;
        }
    }

    toXml() {
        let node = builder.create();

        let e = node.ele("state");
            e.ele("id").txt(this.id.toString());
            e.ele("small").txt(this.small);
            e.ele("large").txt(this.large);

        return node;
    }

    static fromXml(obj): C4State {
        return new C4State(obj);
    }
}