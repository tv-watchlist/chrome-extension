import { CountryModel } from './country.model';
export class ChannelModel {
    id: number;
    name: string;
    image: string;
    country: CountryModel;
    constructor() {
        this.id = 0;
        this.name = '';
        this.image = '';
        this.country = new CountryModel();
    }
    // test ={"id":11,"name":"Cartoon Network","country":{"name":"United States","code":"US","timezone":"America/New_York"}};
}
