
import 'reflect-metadata';
import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import { asInt, Driver } from '../driver';
import C4InterfaceIcon from '../interface/C4InterfaceIcon';
import C4StateIcons from './C4StateIcons';

@jsonObject
export class C4NavigatorDisplayOption {
    @jsonMember
    proxybindingid: number

    @jsonMember
    translation_url?: string

    @jsonArrayMember(C4InterfaceIcon)
    display_icons?: C4InterfaceIcon[]

    @jsonArrayMember(C4StateIcons)
    state_icons?: C4StateIcons[]

    constructor(options?) {
        if (options) {
            this.proxybindingid = options.proxybindingid;
            this.display_icons = options.display_icons;
            this.state_icons = options.state_icons;
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

        console.log(this.state_icons);
        console.log(node.toString());

        if (!this.state_icons) {
            return node
        }

        console.log(node.toString());

        for (let s = 0; s < this.state_icons.length; s++) {
            let state = icons.ele("state");
            state.att("id", this.state_icons[s].id)

            for (let i = 0; i < this.state_icons[s].icons.length; i++) {
                let repeat = (this.state_icons[s].icons[i] as any).repeat
    
                if (repeat) {
                    for (let k = repeat.start_size; k <= repeat.end_size; k += repeat.increment) {
                        state.ele("Icon", {width: k, height: k}).txt(repeat.path.replace("%SIZE%", k));
                    }  
                } else {
                    state.ele("Icon", {
                        height: this.state_icons[s].icons[i].height,
                        width: this.state_icons[s].icons[i].width
                    }).txt(this.state_icons[s].icons[i].path)
                }
            }

        }

        console.log(node.toString());

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