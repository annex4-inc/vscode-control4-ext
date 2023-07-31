
import 'reflect-metadata';
import { jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import { asInt } from '../driver';

@jsonObject
export class C4WebviewUrl {
    @jsonMember
    proxybindingid: number

    @jsonMember
    value: string

    constructor(options?) {
        if (options) {
            this.proxybindingid = options.proxybindingid
            this.value = options.value
        }
    }

    toXml() {
        let node = builder.create("web_view_url").root();

        node.att("proxybindingid", this.proxybindingid.toString())
        node.txt(this.value)

        return node;
    }

    static fromXml(obj): C4WebviewUrl {
        let url = new C4WebviewUrl();

        url.proxybindingid = obj["@proxybindingid"] ? asInt(obj["@proxybindingid"]) : 5001
        url.value = obj["#"]

        return url
    }
}