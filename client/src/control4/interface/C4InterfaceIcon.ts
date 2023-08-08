
import 'reflect-metadata';
import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import { asInt } from '../driver';

@jsonObject
export default class C4InterfaceIcon {
    @jsonMember
    height?: number

    @jsonMember
    width?: number

    @jsonMember
    path: string

    @jsonArrayMember(Number)
    sizes: number[]

    constructor(options?) {
        if (options) {
            this.height = options.height;
            this.width = options.width;
            this.path = options.path;
            this.sizes = options.sizes;
        }
    }

    toXml(size?: number) {
        let node = builder.create("Icon").root();

        if (size) {
            node.att("height", size.toString());
            node.att("width", size.toString());
            node.txt(this.path.replace("%SIZE%", size.toString()));
        } else if (this.height && this.width) {
            node.att("height", this.height.toString());
            node.att("width", this.width.toString());
            node.txt(this.path);
        }        

        return node;
    }

    static fromXml(obj): C4InterfaceIcon {
        let i = new C4InterfaceIcon()

        i.height = asInt(obj["@height"])
        i.width = asInt(obj["@width"])
        i.path = obj["#"]

        return i
    }
}