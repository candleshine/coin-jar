import {Db, Json, Model, SakuraApiModel} from '@sakuraapi/api';
import {dbs} from '../config/db';

@Model({
  dbConfig: dbs.jar
})
export class Jar {
  static fromJson(json: any) {
    json = json || {};
    const jar = new Jar();
    jar.coins = 0;
    return jar;
  }

  @Db() @Json()
  coins: number;
}
