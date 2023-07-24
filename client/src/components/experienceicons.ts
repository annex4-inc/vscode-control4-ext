import { TypedJSON } from 'typedjson';
import { C4ExperienceIcon } from '../control4';
import { Component } from './component';

class ExperienceIconsResource extends Component {
    experienceicons: C4ExperienceIcon[]

    constructor() {
        super('experienceicons.c4c');

        this.load().then(() =>
        {
            this.experienceicons = TypedJSON.parseAsArray<C4ExperienceIcon>(this.data, C4ExperienceIcon);
        });
    }

    Get() {
        return this.experienceicons;
    }

    async Reload() {
        await this.load()
        this.experienceicons = TypedJSON.parseAsArray<C4ExperienceIcon>(this.data, C4ExperienceIcon);
        return this.experienceicons
    }
}

const resource = new ExperienceIconsResource();

export default resource;