'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TreeNode } from './TreeNode';
import { C4Property } from '../../control4';
import { PropertyType } from '../../control4/C4Property';

export class PropertyNode extends TreeNode<C4Property> {
    constructor(name: string, property: C4Property) {

        let navIcon = "symbol-property";
        
        switch (property.type) {
            case PropertyType.STRING:
                navIcon = "symbol-string";
                break;
            case PropertyType.LIST:
                navIcon = "list-ordered";
                break;
            case PropertyType.RANGED_INTEGER:
            case PropertyType.RANGED_FLOAT:
                navIcon = "symbol-numeric";
                break;
            case PropertyType.PASSWORD:
                navIcon = "symbol-namespace";
                break;
            case PropertyType.LABEL:
                navIcon = "tag";
                break;
            case PropertyType.SCROLL:
                navIcon = "arrow-both";
                break;
            case PropertyType.TRACK:
                navIcon = "arrow-both";
                break;
            case PropertyType.DEVICE:
                navIcon = "desktop-download";
                break;
            case PropertyType.COLOR:
                navIcon = "symbol-color";
                break;
            case PropertyType.DYNAMIC:
                navIcon = "list-tree";
                break;
            case PropertyType.LINK:
                navIcon = "link";
                break;
            case PropertyType.CUSTOM:
                navIcon = "symbol-class";
                break;
            default:
                navIcon = "symbol-property";
                break;
        }

        super(name, property, navIcon, property.items && property.items.length == 0);

        this.description = property.type;
        this.tooltip = property.type;
    }


    getNameOfType() {
        return "C4Property"
    }

    contextValue = "property";
}

/*export class PropertyListNode extends PropertyNode {
    items: [string]

    constructor(name: string, items: [string], initial: string = items[0]) {
        super(name, PropertyType.LIST, initial, false);

        this.items = items;
    }
}

export class PropertyMinMaxNode extends PropertyNode {
    minimum: number;
    maximum: number;

    constructor(name: string, type: string, minimum: number, maximum: number, initial: number = (maximum + minimum) / 2) {
        super(name, type, initial.toString(), false);
    }
}

export class PropertyRangedNode extends PropertyMinMaxNode {
    constructor(name: string, minimum: number, maximum: number, initial: number = (maximum + minimum) / 2) {
        super(name, PropertyType.RANGE, minimum, maximum, initial);
    }
}

export class PropertyScrollNode extends PropertyMinMaxNode {
    constructor(name: string, minimum: number, maximum: number, initial: number = (maximum + minimum) / 2) {
        super(name, PropertyType.SCROLL, minimum, maximum, initial);
    }
}

export class PropertyTrackNode extends PropertyMinMaxNode {
    constructor(name: string, minimum: number, maximum: number, initial: number = (maximum + minimum) / 2) {
        super(name, PropertyType.TRACK, minimum, maximum, initial);
    }
}

export class PropertyLabelNode extends PropertyNode {
    constructor(name: string, value: string) {
        super(name, PropertyType.LABEL, value, false);
    }
}

export class PropertyPasswordNode extends PropertyNode {
    password: boolean

    constructor(name: string, initial: string) {
        super(name, PropertyType.STRING, initial, false);

        this.password = true;
    }
}
*/