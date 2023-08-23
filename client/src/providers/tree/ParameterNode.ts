'use strict';

import { TreeNode } from './TreeNode';
import { C4Parameter } from '../../control4';
import { ParameterType } from '../../control4/C4Parameter';

export class ParameterNode extends TreeNode<C4Parameter> {
    constructor(name: string, parameter: C4Parameter, parentNode: TreeNode<any>) {
        
        let navIcon = "";
        
        switch (parameter.type) {
            case ParameterType.STRING:
                navIcon = "symbol-string";
                break;
            case ParameterType.LIST:
                navIcon = "list-ordered";
                break;
            case ParameterType.RANGED_INTEGER:
            case ParameterType.RANGED_FLOAT:
                navIcon = "symbol-numeric";
                break;
            case ParameterType.PASSWORD:
                navIcon = "symbol-namespace";
                break;
            case ParameterType.LABEL:
                navIcon = "tag";
                break;
            case ParameterType.SCROLL:
                navIcon = "arrow-both";
                break;
            case ParameterType.TRACK:
                navIcon = "arrow-both";
                break;
            case ParameterType.DEVICE:
                navIcon = "desktop-download";
                break;
            case ParameterType.COLOR:
                navIcon = "symbol-color";
                break;
            case ParameterType.DYNAMIC:
                navIcon = "list-tree";
                break;
            case ParameterType.LINK:
                navIcon = "link";
                break;
            case ParameterType.CUSTOM:
                navIcon = "symbol-class";
                break;
            default:
                navIcon = "symbol-property";
                break;
        }

        super(name, parameter, navIcon, parameter.type !== "LIST", parentNode);

        this.description = parameter.type;
        this.tooltip = parameter.type;
    }

    
    getNameOfType() {
        return "C4Parameter"
    }

    contextValue = "parameter";
}
