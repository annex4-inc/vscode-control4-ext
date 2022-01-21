import { TypedJSON } from 'typedjson';
import { C4Proxy } from '../control4';
import { Component } from './component';

class ProxiesResource extends Component {
    proxies: C4Proxy[]

    constructor() {
        super('proxies.c4c');

        this.load().then(() =>
        {
            this.proxies = TypedJSON.parseAsArray<C4Proxy>(this.data, C4Proxy);
        });
    }

    Get() {
        return this.proxies;
    }

    async Reload() {
        await this.load()
        this.proxies = TypedJSON.parseAsArray<C4Proxy>(this.data, C4Proxy);
        return this.proxies
    }
}

const resource = new ProxiesResource();

export default resource;