
import 'reflect-metadata';
import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';

export class ExperienceIconType {
    static readonly DEFAULT: string = "Default_Icon";
    static readonly STATE: string = "State_Icon";
}

@jsonObject
export class C4ExperienceIcon {
    @jsonMember id: string
    @jsonMember type: string
    @jsonMember iconstate: string
    @jsonArrayMember(String) sizes?: string[]
    @jsonMember path: string

    toXml() {
        if (this.type == "State_Icon") {
            let state = builder.create("state").root()
            state.att("id", this.iconstate.toString())   
            this.sizes.forEach((size) => {
                state.ele("Icon", {
                    height: size,
                    width: size
                }).txt(this.path.replace(/%SIZE%/gi, '_' + size))
            })      
            return state;   
        } else {
/*             let node = dIcon
            this.sizes.forEach((size) => {
                node.ele("Icon", {
                    height: size,
                    width: size
                }).txt(this.path.replace(/%SIZE%/gi, '_' + size))
            })
            return node; */
        }
    }

    static fromXml(obj): C4ExperienceIcon {
        let a = new C4ExperienceIcon();

        a.id = obj.id;
        a.type = obj.type;
        a.iconstate = obj.iconstate;
        a.sizes = obj.sizes ? obj.sizes.item : undefined;
        a.path = obj.path;

        return a
    }
}
