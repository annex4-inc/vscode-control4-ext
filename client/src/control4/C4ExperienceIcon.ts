
import 'reflect-metadata';
import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';

export class ExperienceIconType {
    static readonly DEFAULT: string = "DEFAULT_ICON";
    static readonly STATE: string = "STATE_ICON";
}

@jsonObject
export class C4ExperienceIcon {
    @jsonMember id: string
    @jsonMember type: string
    //@jsonArrayMember(Number) sizes?: number[]
    @jsonArrayMember(String) sizes?: string[]
    @jsonMember template: string

    toXml() {
        let node = builder.create("property").root();

        for (const key in this) {
            if (key == "sizes") {
                let items = node.ele("items")

                this.sizes.forEach((i) => {
                    items.ele("item").txt(i);
                })
            } else {
                //@ts-ignore
                node.ele(key).txt(this[key])
            }
        }

        return node;
    }

    static fromXml(obj): C4ExperienceIcon {
        let a = new C4ExperienceIcon();

        a.id = obj.id;
        a.type = obj.type;
        a.sizes = obj.sizes ? obj.sizes.item : undefined;
        a.template = obj.template;

        return a
    }
}
