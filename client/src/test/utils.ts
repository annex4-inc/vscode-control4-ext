import * as xpath from 'xpath-ts';
import * as assert from 'assert';

export function HasNode(document: Document, tag: string) {
    const nodes = xpath.select("//" + tag, document, true);

    if (nodes == undefined) {
        assert.fail("Node " + tag + " does not exist");
    }
}

export function HasNodeValue(document: Document, tag: string, value: any) {
    const nodes = xpath.select("//" + tag, document, false);

    if (nodes == undefined || !nodes[0]) {
        assert.fail("Node " + tag + " does not exist");
    }
    
    assert.equal(nodes[0].firstChild.data, value, "Invalid value for " + tag);
}