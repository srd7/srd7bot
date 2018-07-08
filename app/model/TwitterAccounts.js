import _                   from "underscore";
import Sequelize           from "sequelize";

import Inject              from "app/lib/di/Inject";
import SequelizeConnection from "app/lib/external/SequelizeConnection";
import TwitterClients      from "app/model/TwitterClients";

@Inject({ sequelizeConnection: SequelizeConnection, twitterClients: TwitterClients })
export default class TwitterAccounts {
  static injectionName = "TwitterAccounts";
  constructor({ sequelizeConnection, twitterClients }) {
    const twitterAccounts = sequelizeConnection.sequelize.define("twitterAccount", {
      twitterId      : { type: Sequelize.STRING, allowNull: false },
      screenName     : { type: Sequelize.STRING, allowNull: false },
      accessToken    : { type: Sequelize.STRING, allowNull: false },
      accessSecret   : { type: Sequelize.STRING, allowNull: false },
    });

    twitterAccounts.belongsTo(twitterClients.schema, {
      foreignKey: { allowNull: false },
      onDelete  : "CASCADE",
    });

    this.schema = twitterAccounts;
    this.twitterClients = twitterClients;
  }
  /**
   * TwitterAccount レコード一覧を取得する。
   * TwitterClients についても取得する。
   *
   * 返り値は twitterAccount に twitterClient の consumer(Key|Secret) を加えたもの。
   */
  listWithAppKey() {
    return this.schema.findAll({ include: [{ model: this.twitterClients.schema, required: true }]})
      .then(data => data.map(rawValue => {
        // rawValue.get({ plain: true })
        const { twitterClient, ...twitterAcccount } = rawValue.get({ plain: true });
        const { id: twitterClientId, label: twitterClientLabel, consumerKey, consumerSecret } = twitterClient;
        return _.assign({}, twitterAcccount, { twitterClientId, twitterClientLabel, consumerKey, consumerSecret });
      }));
  }

  /**
   * TwitterAccount レコードを、twitterId と twitterClientId で upsert する。
   */
  upsert(twitterId, screenName, accessToken, accessSecret, twitterClientId) {
    return this.schema.upsert(
      { twitterId, screenName, accessToken, accessSecret, twitterClientId },
      { where: { twitterId, twitterClientId }}
    );
  }

  /**
   * TwitterAccount レコードを id を用いて削除する。
   * 完了時は成功失敗の配列(たぶん)が返る。
   */
  delete(id) {
    return this.schema.destroy({ where: { id }});
  }
}
