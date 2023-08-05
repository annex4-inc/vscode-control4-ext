import 'reflect-metadata';
import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';

export class DisplayIconType {
    static readonly DEFAULT: string = "DEFAULT_ICON";
    static readonly STATE: string = "STATE_ICON";
}

@jsonObject
export class C4DisplayIcon {
    @jsonMember id: string
    @jsonMember type: string
    @jsonMember iconstate?: string
    @jsonArrayMember(Number) sizes?: number[]
    @jsonMember relpath?: string
    @jsonMember transurl?: string
    @jsonMember({
        deserializer: value => {
            if (typeof (value) == "string") {
                return Number.parseInt(value)
            } else {
                return value;
            }
        }
    }) proxybindingid?: number

    toXml(iconPathTemplate: string) {
        if (this.type == DisplayIconType.STATE) {
            let state = builder.create("state").root()
            state.att("id", this.iconstate)   
            this.sizes.forEach((size) => {
                state.ele("Icon", {
                    height: size,
                    width: size
                }).txt(iconPathTemplate.replace(/%RELPATH%/gi, this.relpath || "icons/device").replace(/%ICONFILENAME%/gi, this.id).replace(/%SIZE%/gi, '_' + size))
            })      
            return state;   
        } else {
/*             let node = dIcon
            this.sizes.forEach((size) => {
                node.ele("Icon", {
                    height: size,
                    width: size
                }).txt(iconPathTemplate.replace(/%RELPATH%/gi, this.relpath || "icons/device").replace(/%ICONFILENAME%/gi, this.id).replace(/%SIZE%/gi, '_' + size))
            })
            return node; */
        }
    }

    static fromXml(obj): C4DisplayIcon {
        let a = new C4DisplayIcon();

        a.id = obj.id;
        a.type = obj.type;
        a.iconstate = obj.iconstate;
        a.sizes = obj.sizes ? obj.sizes.item : undefined;
        a.relpath = obj.relpath;

        return a
    }
}
