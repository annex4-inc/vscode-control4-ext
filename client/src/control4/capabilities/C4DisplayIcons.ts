
import 'reflect-metadata';
import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import { Driver, asInt } from '../driver';
import C4InterfaceIcon from '../interface/C4InterfaceIcon';
import C4StateIcon from './C4StateIcon';
import { C4PathTemplates } from './C4NavigatorDisplayOption';

@jsonObject
export class C4DisplayIcons {
    @jsonArrayMember(C4InterfaceIcon)
    defaults: C4InterfaceIcon[]

    @jsonMember(C4InterfaceIcon)
    states?: {[key:string]: C4InterfaceIcon[]}

    constructor(options?) {
        if (options) {
            this.defaults = options.defaults.map((v) => { return new C4InterfaceIcon(v)} );
            this.states = {}
            

            if (options.states) {
                Object.entries(options.states).forEach((v: any) => {
                    this.states[v[0]] = [];

                    v[1].forEach((d: C4InterfaceIcon) => {
                        this.states[v[0]].push(new C4InterfaceIcon(d))
                    })
                })
            }
        }
    }

    toXml() {
        let node = builder.create("display_icons").root();

        this.defaults.forEach((d) => {
            if (d.sizes) {
                d.sizes.forEach((size) => {
                    node.import(d.toXml(size))
                })
                
            } else {
                node.import(d.toXml())
            }
        })

        Object.entries(this.states).forEach((state) => {
            let s = node.ele("state", { id: state[0]});

            state[1].forEach((d) => {
                if (d.sizes) {
                    d.sizes.forEach((size) => {
                        s.import(d.toXml(size))
                    })
                    
                } else {
                    s.import(d.toXml())
                }
            })
        })

        return node;
    }

    static fromXml(value: any): C4DisplayIcons {
        let option = new C4DisplayIcons();
            option.states = {}

        let defaults = Driver.CleanXmlArray(value.display_icons, "Icon")
        let states = Driver.CleanXmlArray(value.display_icons, "state")

        option.defaults = defaults.map((d) => {           
            return C4InterfaceIcon.fromXml(d)
        })

        states.forEach((s) => {
            let state = C4StateIcon.fromXml(s)
            option.states[state.Id] = state.Icons
        })

        return option
    }

    static fromInterface(default_icons ?: any, state_icons ?: any, path: string = C4PathTemplates.C4ROOT_PATH + C4PathTemplates.ICON_PATH): C4DisplayIcons {
        let display_icons = new C4DisplayIcons();
            display_icons.states = {}

        display_icons.defaults = default_icons.map((d) => {
            let dpath = path.replace(/%RELPATH%/gi, d.relpath || "icons/device").replace(/%ICONFILENAME%/gi, d.id);
            return <C4InterfaceIcon>{ path: dpath, sizes: d.sizes }
        })

        state_icons.forEach((s) => {
            let state = C4StateIcon.fromInterface(s, path)
            display_icons.states[state.Id] = state.Icons
        })

        // Explore allowing multiple single State Icon entries with same state value.
/*         let countList: {count:number} = state_icons.reduce(function(p, c){
            p[c.iconstate] = (p[c.iconstate] || 0) + 1;
            return p;
          }, {});
        console.log(countList);
        Object.entries(countList).forEach(([key, count]) => {
            if (count > 1) {
                console.log(key, count);
            }
            
        });
        let result = state_icons.filter(function(obj){
            return countList[obj.iconstate] > 1;
          });

        console.log(result); */

        return display_icons
    }
}