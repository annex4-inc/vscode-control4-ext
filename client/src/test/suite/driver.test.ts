import * as assert from 'assert';
import * as xpath from 'xpath-ts';
import { after } from 'mocha';
import { DOMParserImpl as dom } from 'xmldom-ts'

import * as vscode from 'vscode';
import { Driver } from '../../control4/driver';
import { HasNode, HasNodeValue } from '../utils';

suite('Driver Test Suite', () => {
    test('Creates a default driver', () => {
        let driver = new Driver("abc");
        let xml = driver.build();

        const doc = new dom().parseFromString(xml);

        HasNodeValue(doc, "semver", "0.0.1");
        HasNodeValue(doc, "version", "000001");
        HasNodeValue(doc, "control", "lua_gen");
        HasNodeValue(doc, "driver", "DriverWorks");

        HasNode(doc, "name");
        HasNode(doc, "model");
        HasNode(doc, "creator");
        HasNode(doc, "manufacturer");
        HasNode(doc, "created");
        HasNode(doc, "modified");
        HasNode(doc, "controlmethod");

        HasNode(doc, "config/script");
        HasNode(doc, "config/documentation");
    });

    test('Imports a default driver', () => {
        let driver = new Driver("abc");
        let xml = driver.build();

        const doc = new dom().parseFromString(xml);

        HasNodeValue(doc, "semver", "0.0.1");
        HasNodeValue(doc, "version", "000001");
        HasNodeValue(doc, "control", "lua_gen");
        HasNodeValue(doc, "driver", "DriverWorks");

        HasNode(doc, "name");
        HasNode(doc, "model");
        HasNode(doc, "creator");
        HasNode(doc, "manufacturer");
        HasNode(doc, "created");
        HasNode(doc, "modified");
        HasNode(doc, "controlmethod");

        HasNode(doc, "config/script");
        HasNode(doc, "config/documentation");
    });
});

