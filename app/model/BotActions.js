/**
 * Bot のアカウントとアクションの紐づけ
 */
import Sequelize           from "sequelize";

import Inject              from "app/lib/di/Inject";
import SequelizeConnection from "app/lib/external/SequelizeConnection";
import TwitterAccounts     from "app/model/TwitterAccounts";
import TwitterClients      from "app/model/TwitterClients";

@Inject({
  sequelizeConnection: SequelizeConnection,
  twitterAccounts    : TwitterAccounts,
  twitterClients     : TwitterClients,
})
export default class BotActions {
  static injectionName = "BotActions";
  constructor({ sequelizeConnection, twitterAccounts, twitterClients }) {
    const botActions = sequelizeConnection.sequelize.define("botAction", {
      botName: { type: Sequelize.STRING, allowNull: false },
      config : { type: Sequelize.JSONB , allowNull: false },
    });

    botActions.belongsTo(twitterAccounts.schema, {
      foreignKey: { allowNull: false },
      onDelete  : "CASCADE",
    });

    this.schema = botActions;
    this.twitterAccounts = twitterAccounts;
    this.twitterClients  = twitterClients;
  }

  findByIdWithToken(id) {
    return this.schema.findOne({
      where  : { id },
      include: [{
        model   : this.twitterAccounts.schema,
        required: true,
        include : [this.twitterClients.schema],
      }],
    })
      .then(rawValue => {
        const { twitterAccount, ...botAction } = rawValue.get({ plain: true });
        const { twitterClient } = twitterAccount;

        return {
          id                : botAction.id,
          botName           : botAction.botName,
          botConfig         : botAction.config,
          twitterAccountId  : twitterAccount.id,
          twitterId         : twitterAccount.twitterId,
          screenName        : twitterAccount.screenName,
          accessToken       : twitterAccount.accessToken,
          accessSecret      : twitterAccount.accessSecret,
          twitterClientId   : twitterClient.id,
          twitterClientLabel: twitterClient.label,
          consumerKey       : twitterClient.consumerKey,
          consumerSecret    : twitterClient.consumerSecret,
          createdAt         : botAction.createdAt,
          updatedAt         : botAction.updatedAt,
        };
      });
  }

  /**
   * BotAction レコード一覧のみを取得する。
   * 返り値は BotAction の配列。
   */
  list() {
    return this.schema.findAll()
      .then(data => data.map(rawValue => rawValue.get({ plain: true })));
  }

  /**
   * BotAction レコード一覧を取得する。
   * そのまま TwitterAccounts や TwitterClients まで取得する。
   *
   * 返り値はそれをコネコネして使いやすい状態にする。
   */
  listBotWithToken() {
    return this.schema.findAll({
      include: [{
        model   : this.twitterAccounts.schema,
        required: true,
        include : [this.twitterClients.schema],
      }],
    })
      .then(data => data.map(rawValue => {
        const { twitterAccount, ...botAction } = rawValue.get({ plain: true });
        const { twitterClient } = twitterAccount;

        return {
          id                : botAction.id,
          botName           : botAction.botName,
          botConfig         : botAction.config,
          twitterAccountId  : twitterAccount.id,
          twitterId         : twitterAccount.twitterId,
          screenName        : twitterAccount.screenName,
          accessToken       : twitterAccount.accessToken,
          accessSecret      : twitterAccount.accessSecret,
          twitterClientId   : twitterClient.id,
          twitterClientLabel: twitterClient.label,
          consumerKey       : twitterClient.consumerKey,
          consumerSecret    : twitterClient.consumerSecret,
          createdAt         : botAction.createdAt,
          updatedAt         : botAction.updatedAt,
        };
      }));
  }

  /**
   * BotAction レコードを作成する。
   * 完了時は Insert が完了したデータ（id付き）が返る。
   */
  create(twitterAccountId, botName, config) {
    return this.schema.create({ twitterAccountId, botName, config });
  }

  /**
   * BotAction レコードを id を用いて更新する。
   * 完了時は成功失敗の配列(たぶん)が返る。
   */
  update(id, twitterAccountId, botName, config) {
    return this.schema.update({ twitterAccountId, botName, config }, { where: { id }} );
  }

  /**
   * BotAction レコードを id を用いて削除する。
   * 完了時は成功失敗の配列(たぶん)が返る。
   */
  delete(id) {
    return this.schema.destroy({ where: { id }});
  }
}
