import { CountryModel } from './country.model';
export class ChannelModel {
    id: number;
    name: string;
    image: string;
    country: CountryModel;

    // test ={"id":11,"name":"Cartoon Network","country":{"name":"United States","code":"US","timezone":"America/New_York"}};
}
