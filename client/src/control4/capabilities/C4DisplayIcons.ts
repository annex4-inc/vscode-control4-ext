import 'reflect-metadata';
import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import { asInt, Driver } from '../driver';
import C4InterfaceIcon from '../interface/C4InterfaceIcon';
import C4StateIcons from './C4StateIcons';
import { XMLBuilder } from 'xmlbuilder2/lib/interfaces';

@jsonObject
export class C4DisplayIcons {
    @jsonArrayMember(C4InterfaceIcon)
    default_icons?: C4InterfaceIcon[]

    @jsonArrayMember(C4StateIcons)
    state_icons?: C4StateIcons[]

    constructor(options?) {
        if (options) {
            this.default_icons = options.default_icons;
            this.state_icons = options.state_icons;
        }
    }

    toXml() {
        let node = builder.create("display_icons").root();

        if (this.default_icons) {
            for (let i = 0; i < this.default_icons.length; i++) {
                let repeat = (this.default_icons[i] as any).repeat
    
                if (repeat) {
                    for (let j = repeat.start_size; j <= repeat.end_size; j += repeat.increment) {
                        node.ele("Icon", {width: j, height: j}).txt(repeat.path.replace("%SIZE%", j));
                    }  
                } else {
                    node.ele("Icon", {
                        height: this.default_icons[i].height,
                        width: this.default_icons[i].width
                    }).txt(this.default_icons[i].path)
                }
            }
        }
        
        if (this.state_icons) {
            for (let s = 0; s < this.state_icons.length; s++) {
                let state = node.ele("state");
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
        }

        return node;
    }

    static fromXml(value: any): C4DisplayIcons {
        let option = new C4DisplayIcons;

        let defaulticons = value.Icon
        let stateicons = value.state

        if (defaulticons) {
            defaulticons = Driver.CleanXmlArray(defaulticons, "Icon")

            option.default_icons = defaulticons.map((i) => {
                return C4InterfaceIcon.fromXml(i)
            })
        }
        if (stateicons) {
            stateicons = Driver.CleanXmlArray(stateicons, "state")

            option.state_icons = stateicons.map((i) => {
                return C4StateIcons.fromXml(i)
            })
        }
        
        return option
    }
}