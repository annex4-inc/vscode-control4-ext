import { TypedJSON } from 'typedjson';
import { C4Property } from '../control4';
import { Component } from './component';

class PropertiesResource extends Component {
    properties: C4Property[]

    constructor() {
        super('properties.c4c');

        this.load().then(() =>
        {
            this.properties = TypedJSON.parseAsArray<C4Property>(this.data, C4Property);
        });
    }

    Get() {
        return this.properties;
    }

    async Reload() {
        await this.load()
        this.properties = TypedJSON.parseAsArray<C4Property>(this.data, C4Property);
        return this.properties
    }
}

const resource = new PropertiesResource();

export default resource;