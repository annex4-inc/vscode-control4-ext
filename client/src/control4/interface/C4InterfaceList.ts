
import 'reflect-metadata';
import { jsonMember, jsonObject } from 'typedjson';
import * as builder from 'xmlbuilder2';
import C4InterfaceTrait from './C4InterfaceTrait';

@jsonObject
export default class C4InterfaceList {
    @jsonMember
    defaultActionProperty: string

    @jsonMember
    actionIdsProperty: string

    @jsonMember
    titleProperty: string

    @jsonMember
    subtitleProperty: string

    @jsonMember
    imageProperty: string

    @jsonMember
    iconProperty: string

    @jsonMember
    lengthProperty: string

    @jsonMember
    isLink: C4InterfaceTrait

    @jsonMember
    isHeader: C4InterfaceTrait

    @jsonMember
    willTranslate: C4InterfaceTrait

    toXml() {
        let node = builder.create("Param").root();

        node.ele("ItemDefaultActionProperty", this.defaultActionProperty);
        node.ele("ItemActionIdsProperty", this.actionIdsProperty);
        node.ele("TitleProperty", this.titleProperty);
        node.ele("SubTitleProperty", this.subtitleProperty);
        node.ele("ImageProperty", this.imageProperty);
        node.ele("IconProperty", this.iconProperty);
        node.ele("LengthProperty", this.lengthProperty);

        return node;
    }

    static fromXml(obj): C4InterfaceList {
        let i = new C4InterfaceList()

        i.defaultActionProperty = obj["ItemDefaultActionProperty"]
        i.actionIdsProperty = obj["ItemActionIdsProperty"]
        i.titleProperty = obj["TitleProperty"]
        i.subtitleProperty = obj["SubTitleProperty"];
        i.imageProperty = obj["ImageProperty"];
        i.iconProperty = obj["IconProperty"];
        i.lengthProperty = obj["LengthProperty"];

        i.isLink = obj.IsLink ? C4InterfaceTrait.fromXml(obj.IsLink) : undefined;
        i.isHeader = obj.IsHeader ? C4InterfaceTrait.fromXml(obj.IsHeader) : undefined;
        i.willTranslate = obj.WillTranslate ? C4InterfaceTrait.fromXml(obj.WillTranslate) : undefined;

        return i
    }
}