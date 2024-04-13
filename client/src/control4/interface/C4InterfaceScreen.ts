
import 'reflect-metadata';
import { jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import C4InterfaceDataCommand from './C4InterfaceDataCommand';
import C4InterfaceList from './C4InterfaceList';

import { asBoolean } from "../utility";
import C4InterfaceTrait from './C4InterfaceTrait';

@jsonObject
export default class C4InterfaceScreen {
    @jsonMember
    id: string

    @jsonMember
    type: string

    @jsonMember
    dataCommand: C4InterfaceDataCommand

    @jsonMember
    paginationStyle: string

    @jsonMember
    requiresRefresh: boolean

    @jsonMember
    titleProperty: string

    @jsonMember
    subtitleProperty: string

    @jsonMember
    imageProperty: string

    @jsonMember
    lengthProperty: string

    @jsonMember
    actionIdsProperty: string

    @jsonMember
    list: C4InterfaceList

    toXml() {
        let node = builder.create("Screen").root();

        node.att("type", this.type);
        node.ele(this.id);

        return node;
    }

    static fromXml(obj): C4InterfaceScreen {
        let i = new C4InterfaceScreen()

        i.type = obj["@type"] || obj["@xsi:type"];
        i.id = obj["Id"];
        i.dataCommand = C4InterfaceDataCommand.fromXml(obj.DataCommand);
        i.paginationStyle = obj["PaginationStyle"];
        i.requiresRefresh = asBoolean(obj["RequiresRefresh"]);
        i.titleProperty = obj["TitleProperty"];
        i.subtitleProperty = obj["SubtitleProperty"];
        i.imageProperty = obj["ImageProperty"];
        i.lengthProperty = obj["LengthProperty"];
        i.actionIdsProperty = obj["ActionIdsProperty"];
        i.list = C4InterfaceList.fromXml(obj.List);

        return i
    }
}