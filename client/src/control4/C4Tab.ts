
import 'reflect-metadata';
import { jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';

@jsonObject
export class C4Tab {
    @jsonMember
    file: string

    @jsonMember
    name: string

    constructor(options?) {
        if (options) {
            this.file = options.file;
            this.name = options.name;
        }
    }

    toXml() {
        let node = builder.create();

        let e = node.ele("tab", {
            file: this.file,
            name: this.name
        });

        return node;
    }

    static fromXml(obj): C4Tab {
        let t = new C4Tab();

        t.file = obj["@file"];
        t.name = obj["@name"];

        return t;
    }
}