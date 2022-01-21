import * as builder from 'xmlbuilder2';

export class C4Conditional {
    id: number
    name: string
    type: string
    conditional_statement: string
    description: string
    sort_order: number  // 3.2.0

    toXml() {
        let node = builder.create("conditional").root();

        for (const key in this) {
            //@ts-ignore
            node.ele(key).txt(this[key])
        }

        return node;
    }
}