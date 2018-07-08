import Sequelize from "sequelize";
import Inject    from "app/lib/di/Inject";

const env = process.env.NODE_ENV || "develop";
const isDevelop = env === "develop";

@Inject()
export default class SequelizeConnection {
  static injectionName = "SequelizeConnection";
  constructor() {
    this.sequelize = new Sequelize(process.env.DATABASE_URL, {
      logging: isDevelop && ::console.log,
    });
  }

  sync(force = false) {
    this.sequelize.sync({ force })
      .then(() => console.log("PostgreSQL model sync done (force: %s)", force));
  }
}
