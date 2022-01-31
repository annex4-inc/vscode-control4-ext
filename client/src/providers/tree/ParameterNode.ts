'use strict';

import { TreeNode } from './TreeNode';
import { C4Parameter } from '../../control4';

export class ParameterNode extends TreeNode<C4Parameter> {
    constructor(name: string, parameter: C4Parameter, parentNode: TreeNode<any>) {
        super(name, parameter, "info", parameter.type !== "LIST", parentNode);

        this.description = parameter.type;
        this.tooltip = parameter.type;
    }

    contextValue = "parameter";
}
