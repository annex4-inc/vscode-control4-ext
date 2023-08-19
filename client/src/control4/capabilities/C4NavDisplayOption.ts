import 'reflect-metadata';
import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import { NavDisplayOptionType } from './C4NavigatorDisplayOption';
import C4StateIcon from './C4StateIcon';

@jsonObject
export class C4NavDisplayOption {
    @jsonMember id: string
    @jsonMember type: string
    @jsonMember iconstate?: string
    @jsonArrayMember(Number) sizes?: number[]
    @jsonMember relpath?: string
    @jsonMember translation_url?: string
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
        if (this.type == NavDisplayOptionType.STATE) {
            let state = builder.create("state").root()
            state.att("id", this.iconstate)   
            this.sizes.forEach((size) => {
                state.ele("Icon", {
                    height: size,
                    width: size
                }).txt(iconPathTemplate.replace(/%RELPATH%/gi, this.relpath || "icons/device").replace(/%ICONFILENAME%/gi, this.id).replace(/%SIZE%/gi, '_' + size))
            })      
            return state;   
        }
    }

    static fromXml(obj): C4NavDisplayOption {
        let a = new C4NavDisplayOption();

        a.id = obj.id;
        a.type = obj.type;
        a.iconstate = obj.iconstate;
        a.sizes = obj.sizes ? obj.sizes.item : undefined;
        a.relpath = obj.relpath;

        return a
    }

    static toInterface(obj): C4NavDisplayOption[] {
        let alloptions = new Array( new C4NavDisplayOption());
        
        if(obj.proxybindingid) {
            let p = new C4NavDisplayOption();
            p.proxybindingid = obj.proxybindingid;
            p.id = "Proxy Binding Id";
            p.type = NavDisplayOptionType.PROXY;
            alloptions[0] = p;
        } else {
            let p = new C4NavDisplayOption();
            p.proxybindingid = 5001;
            p.id = "Proxy Binding Id";
            p.type = NavDisplayOptionType.PROXY;
            alloptions[0] = p;
        }

        if(obj.translation_url) {
            let t = new C4NavDisplayOption();
            t.translation_url = /[^/]*$/.exec(obj.translation_url)[0];
            t.id = "Translations URL";
            t.type = NavDisplayOptionType.TRANSLATIONS_URL;
            alloptions.push(t);
        }

        let sizes: number[] = [];
        let lasticonname = "";
        let default_icons = new C4NavDisplayOption();
        obj.display_icons.defaults.forEach((d, currentid, items) => {
            //let iconname = /^[^_]+(?=_)/.exec(/[^/]*$/.exec(d.path)[0])[0]; 
            let iconname = /^[^.]+(?=.)/.exec(/[^/]*$/.exec(d.path)[0])[0]; 
            // This version maintains the underscrore.
            let withunderscore = /^[^_]+(?=_)\w/.exec(iconname);
            // This version omits the underscore.
            //let withunderscore = /^[^_]+(?=_)/.exec(iconname);
            if (withunderscore) {
                iconname = withunderscore[0];
            }
            if (iconname === lasticonname || currentid === 0) {
                sizes.push(d.width);
            }
            if ((iconname != lasticonname) && (currentid != 0)) {
                default_icons.id = lasticonname;
                default_icons.sizes = sizes;
                default_icons.type = NavDisplayOptionType.DEFAULT;
                default_icons.relpath = /.*(?=\/)/.exec(items[currentid-1].path.replace(/(?:[^\/]*\/){4}/.exec(items[currentid-1].path), ""))[0];
                alloptions.push(default_icons);
                sizes = [];
                sizes.push(d.width);
                default_icons = new C4NavDisplayOption();
            }
            if (currentid === items.length - 1) {
                default_icons.id = iconname;
                default_icons.sizes = sizes;
                default_icons.type = NavDisplayOptionType.DEFAULT;
                default_icons.relpath = /.*(?=\/)/.exec(items[currentid].path.replace(/(?:[^\/]*\/){4}/.exec(items[currentid].path), ""))[0];
                alloptions.push(default_icons);
            }

            lasticonname = iconname;
        })

        let state_icons = <C4StateIcon>obj.display_icons.states;
        Object.entries(state_icons).forEach(([state, icons]) => {
            let sizes: number[] = [];
            let lasticonname = "";
            let icon = new C4NavDisplayOption();
            icons.forEach((d, currentid, items) => {
                //let iconname = /^[^_]+(?=_)\w/.exec(/[^/]*$/.exec(d.path)[0])[0]; 
                let iconname = /^[^.]+(?=.)/.exec(/[^/]*$/.exec(d.path)[0])[0]; 
                // This version maintains the underscrore.
                let withunderscore = /^[^_]+(?=_)\w/.exec(iconname);
                // This version omits the underscore.
                //let withunderscore = /^[^_]+(?=_)/.exec(iconname);
                if (withunderscore) {
                    iconname = withunderscore[0];
                }
                if (iconname === lasticonname || currentid === 0) {
                    sizes.push(d.width);
                }
                if ((iconname != lasticonname) && (currentid != 0)) {
                    icon.iconstate = state;
                    icon.id = lasticonname;
                    icon.sizes = sizes;
                    icon.type = NavDisplayOptionType.STATE;
                    icon.relpath = /.*(?=\/)/.exec(items[currentid-1].path.replace(/(?:[^\/]*\/){4}/.exec(items[currentid-1].path), ""))[0];
                    alloptions.push(icon);
                    sizes = [];
                    sizes.push(d.width);
                    icon = new C4NavDisplayOption();
                }
                if (currentid === items.length - 1) {
                    icon.iconstate = state;
                    icon.id = iconname;
                    icon.sizes = sizes;
                    icon.type = NavDisplayOptionType.STATE;
                    icon.relpath = /.*(?=\/)/.exec(items[currentid].path.replace(/(?:[^\/]*\/){4}/.exec(items[currentid].path), ""))[0];
                    alloptions.push(icon);
                }
                lasticonname = iconname;
            });
        });

        return alloptions
    }
}
