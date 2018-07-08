import Sequelize           from "sequelize";

import Inject              from "app/lib/di/Inject";
import SequelizeConnection from "app/lib/external/SequelizeConnection";

@Inject({ sequelizeConnection: SequelizeConnection })
export default class TwitterClients {
  static injectionName = "TwitterClients";
  constructor({ sequelizeConnection }) {
    const twitterClients = sequelizeConnection.sequelize.define("twitterClient", {
      label         : { type: Sequelize.STRING, allowNull: false },
      consumerKey   : { type: Sequelize.STRING, allowNull: false },
      consumerSecret: { type: Sequelize.STRING, allowNull: false },
    });

    this.schema = twitterClients;
  }
  /**
   * id から TwitterClient を取得する。
   * 値が存在したらそのオブジェクト、なければ null が返る。
   */
  findById(id) {
    return this.schema.findOne({ where: { id }})
      .then(data => data.get({ plain: true }));
  }

  /**
   * TwitterClient レコード一覧を取得する。
   * 返り値は TwitterClient の配列。
   */
  list() {
    return this.schema.findAll()
      .then(data => data.map(rawValue => rawValue.get({ plain: true })));
  }

  /*
   * TwitterClient レコードを作成する。
   * 完了時は Insert が完了したデータ（id付き）が返る。
   */
  create(label, consumerKey, consumerSecret) {
    return this.schema.create({ label, consumerKey, consumerSecret });
  }

  /**
   * TwitterClient レコードを id を用いて更新する。
   * 完了時は成功失敗の配列(たぶん)が返る。
   */
  update(id, label, consumerKey, consumerSecret) {
    return this.schema.update({ label, consumerKey, consumerSecret }, { where: { id }} );
  }

  /**
   * TwitterClient レコードを id を用いて削除する。
   * 完了時は成功失敗の配列(たぶん)が返る。
   */
  delete(id) {
    return this.schema.destroy({ where: { id }});
  }
}
