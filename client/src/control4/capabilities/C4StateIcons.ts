
import 'reflect-metadata';
import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import { asInt, Driver } from '../driver';
import C4InterfaceIcon from '../interface/C4InterfaceIcon';

@jsonObject
export default class C4StateIcons {
    @jsonMember
    id : string

    @jsonArrayMember(C4InterfaceIcon)
    icons?: C4InterfaceIcon[]

    constructor(options?) {
        if (options) {
            this.id = options.id;
            this.icons = options.icons;
        }
    }

    toXml() {
        let node = builder.create("state").root();

        node.att("id", this.id.toString())

        if (!this.icons) {
            return node
        }
        
        for (let i = 0; i < this.icons.length; i++) {
            let repeat = (this.icons[i] as any).repeat

            if (repeat) {
                for (let j = repeat.start_size; j <= repeat.end_size; j += repeat.increment) {
                    node.ele("Icon", {width: j, height: j}).txt(repeat.path.replace("%SIZE%", j));
                }  
            } else {
                node.ele("Icon", {
                    height: this.icons[i].height,
                    width: this.icons[i].width
                }).txt(this.icons[i].path)
            }
        }

        return node
    }

    static fromXml(value: any): C4StateIcons {
        let option = new C4StateIcons();

        option.id = value["@id"]

        let states = value
        let icons = value.Icon

        if (icons) {
            icons = Driver.CleanXmlArray(states, "Icon")

            option.icons = icons.map((i) => {
                return C4InterfaceIcon.fromXml(i)
            })
        }

        return option
    }
}