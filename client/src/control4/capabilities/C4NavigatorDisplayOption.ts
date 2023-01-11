
import 'reflect-metadata';
import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import { asInt, Driver } from '../driver';
import C4InterfaceIcon from '../interface/C4InterfaceIcon';

@jsonObject
export class C4NavigatorDisplayOption {
    @jsonMember
    proxybindingid: number

    @jsonMember
    translation_url?: string

    @jsonArrayMember(C4InterfaceIcon)
    display_icons?: C4InterfaceIcon[]

    constructor(options?) {
        if (options) {
            this.proxybindingid = options.proxybindingid;
            this.display_icons = options.display_icons;
            this.translation_url = options.translation_url;
        }
    }

    toXml() {
        let node = builder.create("navigator_display_option").root();

        node.att("proxybindingid", this.proxybindingid.toString())

        if (!this.display_icons) {
            return node
        }

        let icons = node.ele("display_icons");
        
        for (let i = 0; i < this.display_icons.length; i++) {
            let repeat = (this.display_icons[i] as any).repeat

            if (repeat) {
                for (let j = repeat.start_size; j <= repeat.end_size; j += repeat.increment) {
                    icons.ele("Icon", {width: j, height: j}).txt(repeat.path.replace("%SIZE%", j));
                }  
            } else {
                icons.ele("Icon", {
                    height: this.display_icons[i].height,
                    width: this.display_icons[i].width
                }).txt(this.display_icons[i].path)
            }
        }

        return node;
    }

    static fromXml(value: any): C4NavigatorDisplayOption {
        let option = new C4NavigatorDisplayOption();

        option.proxybindingid = asInt(value["@proxybindingid"])
        option.translation_url = value.translation_url

        let icons = value.display_icons

        if (icons) {
            icons = Driver.CleanXmlArray(icons, "Icon")

            option.display_icons = icons.map((i) => {
                return C4InterfaceIcon.fromXml(i)
            })
        }

        return option
    }
}