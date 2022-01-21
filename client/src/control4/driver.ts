'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as builder from 'xmlbuilder2';
import * as path from 'path';
import * as semver from 'semver';

import { C4Event } from './C4Event';
import { C4Action } from './C4Action';
import { C4Command } from './C4Command';
import { C4Property } from './C4Property';
import { C4Connection, C4ConnectionClass, Direction } from './C4Connection';
import { C4Proxy, C4ProxyClass, C4ProxyType } from './C4Proxy';

import ActionsResource from '../components/actions';
import CommandsResource from '../components/commands';
import ConnectionsResource from '../components/connections';
import EventsResource from '../components/events';
import PropertiesResource from '../components/properties';
import ProxiesResource from '../components/proxies';

import { WriteFileContents } from "../utility"

import AdmZip from 'adm-zip'
import { TypedJSON } from 'typedjson';

function getEnumKeyByEnumValue<T extends { [index: string]: string }>(myEnum: T, enumValue: string): keyof T | null {
  let keys = Object.keys(myEnum).filter(x => myEnum[x] == enumValue);
  return keys.length > 0 ? keys[0] : null;
}

class ControlMethod {
  static IP: string = "ip";
  static SERIAL: string = "serial";
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

  connections: C4Connection[]
  properties: C4Property[]
  commands: C4Command[]
  actions: C4Action[]
  events: C4Event[]
  proxies: C4Proxy[]
  capabilities: Object

  notification_attachment_provider: Boolean
  notification_attachments: NotificationAttachment[]

  encrypted: boolean

  constructor(filename) {
    this.encrypted = true;
    this.filename = filename;
    this.copyright = `Copyright ${new Date().getFullYear()}`;
    this.creator = vscode.workspace.getConfiguration('control4.publish').get<string>('author');
    this.manufacturer = vscode.workspace.getConfiguration('control4.publish').get<string>('company');
    this.name = "";
    this.model = "";
    this.created = new Date();
    this.modified = new Date();
    this.version = "";
    this.icon = new DriverIcon();
    this.control = "lua_gen"
    this.controlmethod = ControlMethod.IP;
    this.driver = "DriverWorks"
    this.agent = false;

    this.connections = [];
    this.properties = [];
    this.commands = [];
    this.actions = [];
    this.events = [];
    this.proxies = [];
    this.capabilities = {};
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
    this.proxies = await ProxiesResource.Reload();
  }

  /**
   * 
   * @param name 
   * @returns 
   */
  static getTemplateXml(name) {
    const configuration = vscode.workspace.getConfiguration('control4');
    const creator = configuration.get<string>('author');
    const company = configuration.get<string>('company');

    var root = builder.create("devicedata").root();

    root.ele("copyright").txt(`Copyright ${new Date().getFullYear()} ${company}`);
    root.ele("creator").txt(creator);
    root.ele("manufacturer").txt(company);
    root.ele("name").txt(name);
    root.ele("model").txt("");
    root.ele("created").txt(new Date().toISOString());
    root.ele("modified").txt(new Date().toISOString());
    root.ele("version").txt("1");
    root.ele("small").txt("devices_sm\\c4.gif");
    root.ele("large").txt("devices_sm\\c4.gif");
    root.ele("control").txt("lua_gen");
    root.ele("controlmethod").txt("ip");
    root.ele("driver").txt("Driverworks");
    root.ele("proxies").att({ qty: 1 })
      .ele("proxy").txt(name)

    return root.end({ prettyPrint: true })
  }

  async zip(src, dst) {
    var zip = new AdmZip();

    zip.addLocalFolder(src);

    try {
      await WriteFileContents(path.resolve(dst, `${this.filename}.c4z`), zip.toBuffer());

      vscode.window.showInformationMessage(`"${this.filename}.c4z" built at ${new Date().toLocaleTimeString()}`, { modal: false }, "Open Folder", "Ok").then(selection => {
        if (selection === "Open Folder") {
          vscode.env.openExternal(vscode.Uri.file(dst));
        }
      });
    } catch (err) {
      vscode.window.showErrorMessage(err.message);
    }
  }

  build() {
    var root = builder.create("devicedata").root();
    root.ele("copyright",).txt(this.copyright);
    root.ele("creator").txt(this.creator);
    root.ele("manufacturer").txt(this.manufacturer);
    root.ele("name").txt(this.name);
    root.ele("model").txt(this.model);
    root.ele("created").txt(this.created.toLocaleString("en-US").replace(",", ""));
    root.ele("modified").txt(this.modified.toLocaleString("en-US").replace(",", ""));

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
    //@ts-ignore
    root.ele("controlmethod").txt(this.controlmethod);
    root.ele("driver").txt(this.driver);

    if (this.proxies && this.proxies.length > 0) {
      var nProxies = root.ele("proxies").att({ qty: this.proxies.length });

      this.proxies.forEach((p) => {
        if (p.proxy == this.filename) {
          root.ele("combo").txt("true")
        }

        nProxies.import(p.toXml())
      })
    }

    if (Object.keys(this.capabilities).length > 0) {
      var nCapabilities = root.ele("capabilities");

      Object.keys(this.capabilities).forEach((key) => {
        let value = this.capabilities[key]

        if (typeof (value) == "object") {
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

    if (this.encrypted) {
      config.ele("script", { file: "driver.lua", encryption: "2" });
    } else {
      config.ele("script", { file: "driver.lua" });
    }

    // Documentation is mandatory, even if empty
    config.ele("documentation", { file: "www/documentation.html" })

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
    const doc = builder.create({}, xml).root();
    const driver = doc.end({ format: 'object' })

    console.log(driver)

    //@ts-ignore
    const devicedata = driver.devicedata;

    const icon = new DriverIcon();
    icon.image_source = devicedata.large["@image_source"]
    icon.small = devicedata.small["#"]
    icon.large = devicedata.large["#"]

    const d: Driver = new Driver("TODO")

    d.copyright = devicedata.copyright
    d.creator = devicedata.creator
    d.manufacturer = devicedata.manufacturer
    d.name = devicedata.name
    d.model = devicedata.model
    d.created = new Date(devicedata.created)
    d.modified = new Date(devicedata.modified)
    d.version = devicedata.version
    d.icon = icon
    d.control = devicedata.control
    d.controlmethod = devicedata.controlmethod
    d.driver = devicedata.driver

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
        d.actions = TypedJSON.parseAsArray<C4Action>(actions, C4Action);
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

export const asInt = function (v) {
  return typeof (v) == "string" ? Number.parseInt(v) : v
}

export const asBoolean = function (v) {
  return v ? v.toLowerCase() == "true" : v
}