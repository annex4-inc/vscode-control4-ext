
import 'reflect-metadata';
import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import C4InterfaceCommand from './interface/C4InterfaceCommand';
import C4InterfaceIcons from './interface/C4InterfaceIcons';
import C4InterfaceScreen from './interface/C4InterfaceScreen';
import C4InterfaceTab from './interface/C4InterfaceTab';

import { asInt } from "./utility"

@jsonObject
export class C4UI {
    @jsonMember
    proxy: number

    @jsonMember
    deviceIcon: string

    @jsonMember
    brandingIcon: string

    @jsonArrayMember(C4InterfaceIcons)
    icons: C4InterfaceIcons[]

    @jsonArrayMember(C4InterfaceScreen)
    screens: C4InterfaceScreen[]

    @jsonArrayMember(C4InterfaceTab)
    tabs: C4InterfaceTab[]

    @jsonMember
    tabCommand: C4InterfaceCommand

    toXml() {
        let node = builder.create("icons").root();

        for (const key in this) {
            if (key == "icons") {
                let icons = node.ele("Icons");

                this.icons.forEach(i => {
                    icons.import(i.toXml())
                });
            }
            else if (key == "screens") {
                let screens = node.ele("Screens");

                this.screens.forEach(i => {
                    screens.import(i.toXml())
                });
            }
            else if (key == "tabs") {
                if (this.tabCommand) {
                    node.import(this.tabCommand.toXml());
                } else if (this.tabs) {
                    let tabs = node.ele("Tab");

                    this.tabs.forEach(i => {
                        tabs.import(i.toXml())
                    });
                }

            } else {
                //@ts-ignore
                node.ele(key).txt(this[key]);
            }
        }

        return node;
    }

    static fromXml(obj): C4UI {
        let ui = new C4UI();

        ui.deviceIcon = obj.DeviceIcon;
        ui.brandingIcon = obj.BrandingIcon;
        ui.proxy = asInt(obj["@proxybindingid"]);

        ui.icons = obj.Icons.IconGroup.map(function (i) {
            return C4InterfaceIcons.fromXml(i)
        })

        ui.screens = obj.Screens.Screen.map(function (s) {
            return C4InterfaceScreen.fromXml(s)
        })

        if (obj.Tabs && obj.Tabs.Tab) {
            ui.tabs = obj.Tabs.IconGroup.map(function (t) {
                return C4InterfaceTab.fromXml(t)
            })
        } else if (obj.Tabs && obj.Tabs.Command) {
            ui.tabCommand = C4InterfaceCommand.fromXml(obj.Tabs.Command);
        }

        return ui
    }
}