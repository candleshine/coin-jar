import {
  Db,
  IDbGetParams,
  IFromDbOptions,
  Json,
  Model,
  SakuraApi,
  SapiModelMixin
}            from '@sakuraapi/api';
import {
  Collection,
  CollectionInsertOneOptions,
  CollectionOptions,
  Cursor,
  Db as MongoDb,
  DeleteWriteOpResultObject,
  InsertOneWriteOpResult,
  ObjectID,
  ReplaceOneOptions,
  UpdateWriteOpResult
}            from 'mongodb';
import {dbs} from '../config/db';

export {
  Collection,
  CollectionInsertOneOptions,
  CollectionOptions,
  Cursor,
  MongoDb,
  DeleteWriteOpResultObject,
  InsertOneWriteOpResult,
  ObjectID,
  ReplaceOneOptions,
  UpdateWriteOpResult,
  IDbGetParams,
  IFromDbOptions,
  SakuraApi
};

@Model({
  dbConfig: dbs.jar
})
export class Jar extends SapiModelMixin() {
  @Db() @Json()
  coins: number;
}
