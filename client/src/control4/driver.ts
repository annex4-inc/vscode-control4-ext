'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as builder from 'xmlbuilder2';
import * as semver from 'semver';

import { C4Event } from './C4Event';
import { C4Action } from './C4Action';
import { C4Command } from './C4Command';
import { C4Property } from './C4Property';
import { C4NavDisplayOption } from './capabilities/C4NavDisplayOption';
import { C4Connection, C4ConnectionClass, Direction } from './C4Connection';
import { C4Proxy, C4ProxyClass, C4ProxyType } from './C4Proxy';

import ActionsResource from '../components/actions';
import CommandsResource from '../components/commands';
import ConnectionsResource from '../components/connections';
import EventsResource from '../components/events';
import PropertiesResource from '../components/properties';
import NavDisplayOptionsResource from '../components/navdisplayoptions';
import ProxiesResource from '../components/proxies';

import { TypedJSON } from 'typedjson';
import { C4UI } from '.';
import { C4NavigatorDisplayOption } from './capabilities/C4NavigatorDisplayOption';
import { C4WebviewUrl } from './capabilities/C4WebviewUrl';
import { C4State } from './C4State';
import { C4Schedule } from './capabilities/C4Schedule';
import { C4Tab } from './C4Tab';

function getEnumKeyByEnumValue<T extends { [index: string]: string }>(myEnum: T, enumValue: string): keyof T | null {
    let keys = Object.keys(myEnum).filter(x => myEnum[x] == enumValue);
    return keys.length > 0 ? keys[0] : null;
}

class ControlMethod {
    static IP: string = "ip";
    static SERIAL: string = "serial";
    static IR: string = "ir";
    static ZIGBEE: string = "zigbee";
    static RELAY: string = "relay";
    static OTHER: string = "other";
}

export class NotificationAttachment {
    id: Number
    description: string
    source: string
    type: string
}

export class DriverIcon {
    small: string
    large: string
    image_source: string
}

/**
 * Manages all data in a Control4 driver
 */
export class Driver {
    filename: string
    copyright: string
    creator: string
    manufacturer: string
    documentation: string
    identifyImage: string
    identifyText: string
    name: string
    model: string
    created: Date
    modified: Date
    version: string
    icon: DriverIcon
    control: string
    controlmethod: ControlMethod
    driver: string

    agent: boolean
    combo: boolean
    jit: boolean

    connections: C4Connection[]
    properties: C4Property[]
    commands: C4Command[]
    actions: C4Action[]
    events: C4Event[]
    proxies: C4Proxy[]
    states: C4State[]
    tabs: C4Tab[]
    UI: C4UI[]
    navdisplayoptions: C4NavDisplayOption[]
    capabilities: any

    serialsettings: string
    notification_attachment_provider: Boolean
    schedule_default: C4Schedule
    notification_attachments: NotificationAttachment[]

    /*
    auto_update: boolean
    minimum_auto_update_version: number
    minimum_os_version: string
    force_auto_update: false
    */

    encrypted: boolean

    constructor(filename: string) {
        this.encrypted = true;
        this.filename = filename;
        this.copyright = `Copyright ${new Date().getFullYear()}`;
        this.creator = vscode.workspace.getConfiguration('control4.publish').get<string>('author');
        this.manufacturer = vscode.workspace.getConfiguration('control4.publish').get<string>('company');
        this.name = "";
        this.model = "";
        this.created = new Date();
        this.modified = new Date();
        this.version = "0.0.1";
        this.icon = new DriverIcon();
        this.control = "lua_gen"
        this.controlmethod = ControlMethod.IP;
        this.driver = "DriverWorks"
        this.documentation = "www/documentation.html";
        this.agent = false;
        this.combo = false;
        this.jit = true;

        this.connections = [];
        this.properties = [];
        this.commands = [];
        this.actions = [];
        this.events = [];
        this.proxies = [];
        this.UI = [];
        this.capabilities = {};
        this.states = [];
        this.navdisplayoptions = [];
    }

    /**
     * Load driver information based on the driver components
     */
    async load() {
        this.commands = await CommandsResource.Reload();
        this.actions = await ActionsResource.Reload();
        this.properties = await PropertiesResource.Reload();
        this.connections = await ConnectionsResource.Reload();
        this.events = await EventsResource.Reload();
        this.navdisplayoptions = await NavDisplayOptionsResource.Reload();
        this.proxies = await ProxiesResource.Reload();
    }

    /**
     * Exports the XML structure of a Control4 driver
     * @returns An XML string
     */
    build() {
        var root = builder.create("devicedata").root();
        root.ele("copyright",).txt(this.copyright);
        root.ele("creator").txt(this.creator);
        root.ele("manufacturer").txt(this.manufacturer);
        root.ele("name").txt(this.name);
        root.ele("model").txt(this.model);
        root.ele("created").txt(this.created.toLocaleString("en-US").replace(",", ""));
        root.ele("modified").txt(this.modified.toLocaleString("en-US").replace(",", ""));

        if (this.combo) {
            root.ele("combo").txt("true");
        }

        let major = semver.major(this.version);
        let minor = semver.minor(this.version);
        let patch = semver.patch(this.version);
        let version = `${major}${minor.toString().padStart(2, "0")}${patch.toString().padStart(3, "0")}`;

        root.ele("version").txt(version);
        root.ele("semver").txt(this.version);
        root.ele("agent").txt(this.agent.toString());

        if (this.icon) {
            let src = this.icon.image_source || "c4z";

            if (this.icon.small) {
                let s = root.ele("small").txt(this.icon.small);

                if (this.icon.image_source) {
                    s.att("image_source", src);
                }
            }

            if (this.icon.large) {
                let l = root.ele("large").txt(this.icon.large);

                if (this.icon.image_source) {
                    l.att("image_source", src);
                }
            }
        }

        root.ele("control").txt(this.control);
        root.ele("controlmethod").txt(this.controlmethod as string);
        root.ele("driver").txt(this.driver);

        if (this.proxies && this.proxies.length > 0) {
            var nProxies = root.ele("proxies").att({ qty: this.proxies.length });

            this.proxies.forEach((p) => {
                if (p.proxy == this.filename && !this.combo) {
                    root.ele("combo").txt("true")
                }

                nProxies.import(p.toXml())
            })
        }

        if (Object.keys(this.capabilities).length > 0) {
            var nCapabilities = root.ele("capabilities");
            
            if (this.navdisplayoptions.length > 0) {
                let dOptions = new C4NavigatorDisplayOption(this.navdisplayoptions, this.filename, true);
                nCapabilities.import(dOptions.toXml());
            }

            Object.keys(this.capabilities).forEach((key) => {
                let value = this.capabilities[key]

                if (key == "web_view_url") {
                    value.forEach((url : C4WebviewUrl) => {
                        nCapabilities.import(url.toXml())
                    })
                } else if (key == "schedule_default") {
                    nCapabilities.import((value as C4Schedule).toXml())
                } else if (typeof (value) == "object") {
                    if (value.attributes) {
                        if (typeof (value.value) == "object") {
                            let node = builder.create(value.value);
                            nCapabilities.ele(key, value.attributes).import(node)
                        } else {
                            nCapabilities.ele(key, value.attributes).txt(value.value)
                        }
                    } else {
                        if (typeof (value.value) == "object") {
                            let node = builder.create(value.value);
                            nCapabilities.ele(key).import(builder.create(node))
                        } else {
                            nCapabilities.ele(key).txt(value.value)
                        }
                    }
                } else {
                    nCapabilities.ele(key).txt(this.capabilities[key]);
                }
            })
        } else if (this.navdisplayoptions.length > 0) {
            var nCapabilities = root.ele("capabilities");
            let dOptions = new C4NavigatorDisplayOption(this.navdisplayoptions, this.filename, true);
            nCapabilities.import(dOptions.toXml());

        }

        if (this.notification_attachment_provider == true) {
            root.ele("notification_attachment_provider").txt("true");

            var nAttachments = root.ele("notification_attachments");

            this.notification_attachments.forEach((attachment: NotificationAttachment) => {
                let node = nAttachments.ele("attachment");

                node.ele("id").txt(attachment.id.toString());
                node.ele("type").txt(attachment.type);
                node.ele("description").txt(attachment.description);
                node.ele("source").txt(attachment.source);
            })
        }

        if (this.states && this.states.length > 0) {
            var states = root.ele("states")

            this.states.forEach((state: C4State) => {
                states.import(state.toXml())
            })
        }

        if (this.connections && this.connections.length > 0) {
            var nConnections = root.ele("connections")

            if (this.proxies) {
                this.proxies.forEach((p) => {
                    let found = false;

                    for (let i = 0; i < this.connections.length; i++) {
                        if (this.connections[i].id == p.id) {
                            found = true;
                        }
                    }

                    if (!found) {
                        let c = new C4Connection()
                        let cc = new C4ConnectionClass()
                        let cname = getEnumKeyByEnumValue(C4ProxyType, p.proxy);

                        // Automatically create connnections for proxies if it doesn't exist
                        if (cname) {
                            cc.classname = C4ProxyClass[cname]

                            c.id = p.id
                            c.facing = Direction.Unknown
                            c.connectionname = cname
                            c.consumer = false
                            c.audiosource = false
                            c.videosource = false
                            c.linelevel = false
                            c.classes = [cc];

                            nConnections.import(c.toXml())
                        }

                    }
                })
            }

            this.connections.forEach((c) => {
                if (c.total && c.total > 1) {
                    for (let i = 0; i < c.total; i++) {
                        let clone: C4Connection = Object.assign(Object.create(Object.getPrototypeOf(c)), c)

                        clone.id = c.id + i;
                        clone.connectionname = clone.connectionname.replace("%INDEX%", (i + 1).toString())

                        nConnections.import(clone.toXml())
                    }
                } else {
                    nConnections.import(c.toXml())
                }
            })
        }

        if (this.events && this.events.length > 0) {
            var nEvents = root.ele("events")

            this.events.forEach((e) => { nEvents.import(e.toXml()) })
        }

        // EVENTS & CONNECTIONS = ROOT
        // ACTIONS PARAMETERS COMMANDS = config

        var config = root.ele("config");

        config.ele("script", {
            ...(this.jit && { jit: "1"}),
            ...(this.encrypted && { encryption: "2"}),
            file: "driver.lua"
        })

        if (this.serialsettings) {
            config.ele("serial_settings").txt(this.serialsettings)
        }

        // Documentation is mandatory, even if empty
        config.ele("documentation", { file: this.documentation })

        if(this.identifyImage) {
            config.ele("identify_image").txt(this.identifyImage);
        }

        if(this.identifyText) {
            config.ele("identify_text").txt(this.identifyText);
        }

        if (this.tabs && this.tabs.length > 0) {
            let tabs = config.ele("tabs");
            
            this.tabs.forEach((t: C4Tab) => {
                tabs.import(t.toXml())
            })
        }

        if (this.commands && this.commands.length > 0) {
            let commands = config.ele("commands");

            this.commands.forEach((c: C4Command) => {
                commands.import(c.toXml())
            })
        }

        if (this.actions && this.actions.length > 0) {
            let actions = config.ele("actions");

            this.actions.forEach((a: C4Action) => {
                actions.import(a.toXml())
            })
        }

        if (this.properties.length > 0) {
            let properties = config.ele("properties");

            this.properties.forEach((p: C4Property) => {
                properties.import(p.toXml())
            })
        }

        return root.end({ prettyPrint: true, headless: true })
    }

    static From(pkg): Promise<Driver> {
        return new Promise(async (resolve, reject) => {
            try {
                let driver = new Driver(pkg.name)
                let icon = new DriverIcon();
                let control4 = pkg.control4 || {};

                // Assign the control4 properties onto our instance
                Object.assign(driver, control4);
                Object.assign(icon, control4.icon);

                driver.version = pkg.version;
                driver.icon = icon;
                driver.created = new Date(driver.created);
                driver.modified = new Date();

                if (driver.states) {
                    driver.states = driver.states.map((state) => {
                        return new C4State(state);
                    })
                }

                if (driver.tabs) {
                    driver.tabs = driver.tabs.map((tab) => {
                        return new C4Tab(tab)
                    })
                }
                
                if (driver.capabilities) {
                    if (driver.capabilities.web_view_url) {
                        driver.capabilities.web_view_url = driver.capabilities.web_view_url.map((url) => {
                            return new C4WebviewUrl(url)
                        })
                    }

                    if (driver.capabilities.schedule_default) {
                        driver.capabilities.schedule_default = new C4Schedule(driver.capabilities.schedule_default)
                    }
                }

                await driver.load()

                resolve(driver)
            } catch (err) {
                reject(err)
            }
        })
    }

    static CleanXmlArray(object, expectedTag): Array<any> {
        let root = object;

        if (Object.keys(root).length === 0) {
            return null;
        }

        if (!Array.isArray(object)) {
            if (object['#']) {
                root = object['#']
            }

            if (object[expectedTag]) {
                root = object[expectedTag]
            }
        }

        let ret = [];

        if (Array.isArray(root)) {
            for (let i = 0; i < root.length; i++) {
                let element = root[i];

                if (element[expectedTag]) {
                    if (Array.isArray(element[expectedTag])) {
                        for (let j = 0; j < element[expectedTag].length; j++) {
                            ret.push(element[expectedTag][j])
                        }
                    } else {
                        ret.push(element[expectedTag])
                    }
                } else if (element["!"] == undefined) {
                    ret.push(element)
                }
            }
        } else {
            ret.push(root)
        }

        return ret;
    }

    static Parse(xml): Driver {
        const doc = builder.create({parser: { comment: () => undefined }}, xml).root();
        const driver = doc.toObject();

        console.log(driver);

        //@ts-ignore
        const devicedata = driver.devicedata;

        if (devicedata["#"] != undefined) {
            throw new Error("The XML document contains duplicate root nodes. Unable to import succesfully.");
        }

        const icon = new DriverIcon();
        icon.image_source = devicedata.large ? devicedata.large["@image_source"] : "c4z"
        icon.small = devicedata.small ? devicedata.small["#"] : "composer/device_sm.png"
        icon.large = devicedata.large ? devicedata.small["#"] : "composer/device_lg.png"

        const d: Driver = new Driver(devicedata.name.replace(" ", "_").toLowerCase());

        d.copyright = devicedata.copyright
        d.creator = devicedata.creator
        d.manufacturer = devicedata.manufacturer
        d.name = devicedata.name
        d.model = devicedata.model
        d.created = devicedata.created ? new Date(devicedata.created) : new Date();
        d.modified = devicedata.modified ? new Date(devicedata.modified) : new Date();
        d.version = devicedata.version
        d.icon = icon
        d.control = devicedata.control
        d.controlmethod = devicedata.controlmethod
        d.identifyImage = devicedata.identify_image
        d.identifyText = devicedata.identify_text
        d.driver = devicedata.driver

        if (devicedata.capabilities) {
            Object.keys(devicedata.capabilities).forEach(function (key: string) {
                try {
                    let value: any = devicedata.capabilities[key];

                    if (key == "navigator_display_option") {
                        let c4navdisplayoptions = C4NavigatorDisplayOption.fromXml(value);
                        d.navdisplayoptions = C4NavDisplayOption.toInterface(c4navdisplayoptions);
                    } else if (key == "web_view_url") {
                        if (!d.capabilities[key]) {
                            d.capabilities[key] = [];
                        }
                        d.capabilities[key].push(C4WebviewUrl.fromXml(value))
                    } else if (key == "schedule_default") {
                        d.capabilities[key] = C4Schedule.fromXml(value)
                    } else if (key == "UI") {
                        d.UI.push(C4UI.fromXml(value));
                    } else if (value && typeof(value) === "string") {
                        if (value.match("[Tt][Rr][Uu][Ee]") || value.match("[Ff][Aa][Ll][Ss][Ee]")) {
                            d.capabilities[key] = asBoolean(value);
                        } else {
                            d.capabilities[key] = value
                        }
                    } else if (value && typeof(value) === "object") {
                        d.capabilities[key] = "";
                    } else {
                        d.capabilities[key] = value;
                    }
                } catch (err: any) {
                    throw new Error(`Failed to parse ${key}`)
                }
            });
        }

        if (devicedata.connections) {
            const connections = this.CleanXmlArray(devicedata.connections, "connection")

            if (connections) {
                connections.forEach(function (c) {
                    d.connections.push(C4Connection.fromXml(c))
                })
            }
        }

        if (devicedata.events) {
            const events = this.CleanXmlArray(devicedata.events, "event")

            if (events) {
                d.events = TypedJSON.parseAsArray<C4Event>(events, C4Event);
            }
        }

        if (devicedata.config.properties) {
            const properties = this.CleanXmlArray(devicedata.config.properties, "property")

            if (properties) {
                properties.forEach(function (p) {
                    d.properties.push(C4Property.fromXml(p))
                })
            }
        }

        if (devicedata.config.actions) {
            const actions = this.CleanXmlArray(devicedata.config.actions, "action")

            if (actions) {
                actions.forEach(function (a) {
                    d.actions.push(C4Action.fromXml(a));
                })
            }
        }

        if (devicedata.config.commands) {
            const commands = this.CleanXmlArray(devicedata.config.commands, "command")

            if (commands) {
                commands.forEach(function (c) {
                    try {
                        d.commands.push(C4Command.fromXml(c))
                    } catch (err) {
                        console.log(err.message)
                    }
                })
            }
        }

        if (devicedata.config.tabs) {
            const tabs = this.CleanXmlArray(devicedata.config.tabs, "tab")

            if (tabs) {
                tabs.forEach(function (t) {
                    try {
                        t.tabs.push(C4Tab.fromXml(t))
                    } catch (err) {
                        console.log(err.message)
                    }
                })
            }
        }

        if (devicedata.proxies) {
            const proxies = this.CleanXmlArray(devicedata.proxies, "proxy")

            if (proxies) {
                proxies.forEach(function (p) {
                    try {
                        d.proxies.push(C4Proxy.fromXml(p))
                    } catch (err) {
                        console.log(err.message)
                    }
                })
            }
        }

        return d;
    }
}

export const asInt = function (v: string) {
    return typeof (v) == "string" ? Number.parseInt(v) : v
}

export const asBoolean = function (v: string): boolean {
    return typeof (v) == "string" ? v.toLowerCase() == "true" : v
}