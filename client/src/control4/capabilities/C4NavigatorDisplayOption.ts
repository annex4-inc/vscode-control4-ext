
import 'reflect-metadata';
import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import { asInt, Driver } from '../driver';
import C4InterfaceIcon from '../interface/C4InterfaceIcon';
import C4StateIcons from './C4StateIcons';
import { C4DisplayIcons } from './C4DisplayIcons';

@jsonObject
export class C4NavigatorDisplayOption {
    @jsonMember
    proxybindingid: number

    @jsonMember
    translation_url?: string

    @jsonMember(C4DisplayIcons)
    display_icons?: C4DisplayIcons

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

        let displayicons = node.ele("display_icons");
        let defaulticons = this.display_icons.default_icons
        let stateicons = this.display_icons.state_icons

        if (defaulticons) {
            for (let i = 0; i < defaulticons.length; i++) {
                let repeat = (defaulticons[i] as any).repeat
    
                if (repeat) {
                    for (let j = repeat.start_size; j <= repeat.end_size; j += repeat.increment) {
                        displayicons.ele("Icon", {width: j, height: j}).txt(repeat.path.replace("%SIZE%", j));
                    }  
                } else {
                    displayicons.ele("Icon", {
                        height: defaulticons[i].height,
                        width: defaulticons[i].width
                    }).txt(defaulticons[i].path)
                }
            }
        }

        if (stateicons) {
            for (let s = 0; s < stateicons.length; s++) {
                let state = displayicons.ele("state");
                state.att("id", stateicons[s].id)
    
                for (let i = 0; i < stateicons[s].icons.length; i++) {
                    let repeat = (stateicons[s].icons[i] as any).repeat
        
                    if (repeat) {
                        for (let k = repeat.start_size; k <= repeat.end_size; k += repeat.increment) {
                            state.ele("Icon", {width: k, height: k}).txt(repeat.path.replace("%SIZE%", k));
                        }  
                    } else {
                        state.ele("Icon", {
                            height: stateicons[s].icons[i].height,
                            width: stateicons[s].icons[i].width
                        }).txt(stateicons[s].icons[i].path)
                    }
                }
    
            } 
        }

        return node;
    }

    static fromXml(value: any): C4NavigatorDisplayOption {
        let option = new C4NavigatorDisplayOption();

        option.proxybindingid = asInt(value["@proxybindingid"])
        option.translation_url = value.translation_url

        let displayicons = value.display_icons

        if (displayicons) {
            option.display_icons = C4DisplayIcons.fromXml(displayicons)
        }

        return option
    }
}