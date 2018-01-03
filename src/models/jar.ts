import {Db, Json, Model, SakuraApiModel} from '@sakuraapi/api';
import {dbs} from '../config/bootstrap/db'

export class Jar extends SakuraApiModel {
  static fromJson(json: any){
    json = json || {};
    const coins = json.coins || 0
  }

  @Db() @Json()
  coins: number;
}

@Model({
  dbConfig: dbs.jar
})


