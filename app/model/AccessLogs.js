/**
 * アクセスログ
 */
import { Schema }         from "mongoose";

import Inject             from "app/lib/di/Inject";
import MongooseConnection from "app/lib/external/MongooseConnection";

@Inject({ mongooseConnection: MongooseConnection })
export default class AccessLogs {
  static injectionName = "AccessLogs";
  constructor({ mongooseConnection }) {
    this.mongooseConnection = mongooseConnection;

    const accessLogs = mongooseConnection.MModel("AccessLogs", new Schema({
      url       : String,
      referer   : String,
      ip        : String,
      userAgent : String,
      accessedAt: Date,
    }));

    this.schema = accessLogs;
  }

  insert(url, referer, ip, userAgent, accessedAt) {
    const accessLog = new this.schema({
      url, referer, ip, userAgent, accessedAt,
    });
    return accessLog.save();
  }
}
