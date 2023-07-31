
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
        a.iconstate = obj.iconstate;
        a.sizes = obj.sizes ? obj.sizes.item : undefined;
        a.template = obj.template;

        return a
    }
}
