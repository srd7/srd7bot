import mongoose from "mongoose";
import Inject   from "app/lib/di/Inject";

@Inject()
export default class MongooseConnection {
  static injectionName = "MongooseConnection";
  constructor() {
    mongoose.Promise = Promise;

    mongoose.connect(process.env.MONGODB_URI)
      .then((_data) => {
        console.log("MongoDB connection success.");
      })
      .catch((err) => {
        console.error(err);
      });

    // Escape
    //  "Cannot read property 'modelSchemas' of undefined"
    // error.
    this.MModel = mongoose.model.bind(mongoose);
  }
}
