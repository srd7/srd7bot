module.exports = {
  up: function (queryInterface, Sequelize) {
    // 共通項目
    var id = {
      type         : Sequelize.INTEGER,
      primaryKey   : true,
      autoIncrement: true,
    };
    var createdAt = { type: Sequelize.DATE };
    var updatedAt = { type: Sequelize.DATE };

    // とりあえず foreignKey が問題ない順番で作成する

    const botActions = queryInterface.createTable("botActions", {
      id: id, createdAt: createdAt, updatedAt: updatedAt,
      twitterAccountId: { type: Sequelize.INTEGER, allowNull: false },
      botName         : { type: Sequelize.STRING , allowNull: false },
      config          : { type: Sequelize.JSONB  , allowNull: false },
    });

    const eventLogs = queryInterface.createTable("eventLogs", {
      id: id, createdAt: createdAt, updatedAt: updatedAt,
      kind   : { type: Sequelize.STRING, allowNull: false },
      trigger: { type: Sequelize.STRING, allowNull: false },
      message: { type: Sequelize.STRING, allowNull: false },
    });

    const twitterAccounts = queryInterface.createTable("twitterAccounts", {
      id: id, createdAt: createdAt, updatedAt: updatedAt,
      twitterClientId: { type: Sequelize.INTEGER, allowNull: false },
      twitterId      : { type: Sequelize.STRING , allowNull: false },
      screenName     : { type: Sequelize.STRING , allowNull: false },
      accessToken    : { type: Sequelize.STRING , allowNull: false },
      accessSecret   : { type: Sequelize.STRING , allowNull: false },
    });

    const twitterClients = queryInterface.createTable("twitterClients", {
      id: id, createdAt: createdAt, updatedAt: updatedAt,
      label         : { type: Sequelize.STRING, allowNull: false },
      consumerKey   : { type: Sequelize.STRING, allowNull: false },
      consumerSecret: { type: Sequelize.STRING, allowNull: false },
    });

    var tables = [
      botActions,
      eventLogs,
      twitterAccounts,
      twitterClients,
    ];

    return Promise.all(tables)
      .then(function () {
        var botActionsTwitterAccountId = queryInterface.changeColumn(
          "botActions",
          "twitterAccountId",
          {
            type: Sequelize.INTEGER, allowNull: false,
            references: {
              model: "twitterAccounts",
              key  : "id",
            },
            onUpdate: "cascade",
            onDelete: "cascade",
          }
        );

        var twitterAccountsTwitterClientId = queryInterface.changeColumn(
          "twitterAccounts",
          "twitterClientId",
          {
            type: Sequelize.INTEGER, allowNull: false,
            references: {
              model: "twitterClients",
              key  : "id",
            },
            onUpdate: "cascade",
            onDelete: "cascade",
          }
        );

        var foreignKeys = [
          botActionsTwitterAccountId,
          twitterAccountsTwitterClientId,
        ];

        return Promise.all(foreignKeys);
      });
  },

  down: function (queryInterface, _Sequelize) {
    var botActions      = queryInterface.dropTable("botActions");
    var eventLogs       = queryInterface.dropTable("eventLogs");
    var twitterAccounts = queryInterface.dropTable("twitterAccounts");
    var twitterClients  = queryInterface.dropTable("twitterClients");

    return Promise.all([
      botActions, eventLogs, twitterAccounts, twitterClients,
    ]);
  },
};
