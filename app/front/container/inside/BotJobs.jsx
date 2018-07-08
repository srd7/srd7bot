import React, { Component }   from "react";
import PropTypes              from "prop-types";

import update                 from "react-addons-update";
import { bindActionCreators } from "redux";
import { connect }            from "react-redux";

import _                      from "underscore";
import classNames             from "classnames";

import * as BotJobAction      from "app/front/action/BotJobAction";

import Select                 from "app/front/component/bootstrap/form/Select";
import Option                 from "app/front/component/bootstrap/form/Option";
import EditableCell           from "app/front/component/common/EditableCell";

@connect(
  (state) => {
    return {
      botJobList            : state.botJob,
      twitterAccountList    : state.twitterAccount,
      botList               : state.bot.botList,
      runningStreamBotIdList: state.bot.runningStreamBotIdList,
    };
  },
  (dispatch) => bindActionCreators(BotJobAction, dispatch)
)
export default class BotJobs extends Component {
  static propTypes = {
    botJobList               : PropTypes.array.isRequired,
    twitterAccountList       : PropTypes.array.isRequired,
    botList                  : PropTypes.array.isRequired,
    runningStreamBotIdList   : PropTypes.array.isRequired,
    createBotAction          : PropTypes.func.isRequired,
    updateBotAction          : PropTypes.func.isRequired,
    deleteBotAction          : PropTypes.func.isRequired,
    runScriptBot             : PropTypes.func.isRequired,
    startStreamBot           : PropTypes.func.isRequired,
    stopStreamBot            : PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = this.getInitialState(props);

    this.saveNewBotAction  = ::this.saveNewBotAction;
    this.saveEditBotAction = ::this.saveEditBotAction;
    this.updateBotAction   = ::this.updateBotAction;
    this.deleteBotAction   = ::this.deleteBotAction;
  }

  componentWillReceiveProps(newProps) {
    this.setState(this.getInitialState(newProps));
  }

  /**
   * State の状態を初期化する。
   * 最初の読み込み時と Props 変更時に。
   */
  getInitialState(props) {
    const twitterAccount = props.twitterAccountList[0];
    const bot = props.botList[0];

    return {
      botJobList: props.botJobList,
      newBotJob: {
        twitterAccountId: twitterAccount? twitterAccount.id : "",
        botName         : bot? bot.name : "",
        config          : {},
      },
      configErrorIndex: [],
    };
  }

  /**
   * BotAction の情報を編集する。
   */
  updateBotAction(index, key) {
    if (index < 0) {
      return (ev) => this.setState(update(this.state, {
        newBotJob: {
          [key]: { $set: ev.target.value },
        },
      }));
    }
  }

  /**
   * BotName を変更する。
   * BotName を変えると、それに対応した config が自動的に入る。
   */
  updateBotName(index) {
    if (index < 0) {
      return (ev) => {
        const botName = ev.target.value;
        const bot = this.props.botList.find(bot => bot.name === botName);

        this.setState(update(this.state, {
          newBotJob: {
            botName: { $set: botName },
            config : { $set: bot.configTemplate },
          },
        }));
      };
    }
  }

  /**
   * BotConfig を変更する。
   * JSON を取り扱うため特別扱い。
   */
  updateBotConfig(index) {
    if (index < 0) {
      return (ev) => {
        try {
          this.setState(update(this.state, {
            newBotJob: {
              config: { $set: JSON.parse(ev.target.value) },
              hasError: { $set: false },
            },
          }));
        } catch(e) {
          this.setState(update(this.state, {
            newBotJob: {
              hasError: { $set: true },
            },
          }));
        }
      };
    } else {
      return (ev) => {
        try {
          this.setState(update(this.state, {
            botJobList: {
              [index]: {
                config: { $set: JSON.parse(ev.target.value) },
              },
            },
            configErrorIndex: { $apply: list => list.filter(item => item !== index) },
          }));
        } catch(e) {
          this.setState(update(this.state, {
            configErrorIndex: { $push: [index] },
          }));
        }
      };
    }
  }

  saveNewBotAction() {
    const { newBotJob } = this.state;
    // 超簡単な validation
    if (newBotJob.twitterAccountId && newBotJob.botName) {
      this.props.createBotAction(this.state.newBotJob);
    } else {
      console.error("Validation error");
    }
  }

  saveEditBotAction(index) {
    return (_ev) => this.props.updateBotAction(this.state.botJobList[index]);
  }

  deleteBotAction(index) {
    return (_ev) => {
      // TODO: 確認メッセージとか
      this.props.deleteBotAction(this.state.botJobList[index]);
    };
  }

  runScriptBot(botJobId) {
    return (_ev) => this.props.runScriptBot(botJobId);
  }

  startStreamBot(botJobId) {
    return (_ev) => this.props.startStreamBot(botJobId);
  }

  stopStreamBot(botJobId) {
    return (_ev) => this.props.stopStreamBot(botJobId);
  }

  render() {
    const { botJobList, newBotJob, configErrorIndex } = this.state;
    const { twitterAccountList, botList, runningStreamBotIdList } = this.props;

    return (
      <div>
        <table className="table">
          <thead>
            <tr>
              <th className="width-100">ID</th>
              <th className="width-150">Account</th>
              <th className="width-150">Client</th>
              <th className="width-150">Bot name</th>
              <th>Config</th>
              <th className="width-150">Action</th>
            </tr>
          </thead>
          <tbody>
            {
              botJobList.map((botJob, i) => {
                const twitterAccount = twitterAccountList.find(account =>
                  account.id === botJob.twitterAccountId
                );
                const bot = botList.find(bot =>
                  bot.name === botJob.botName
                );
                const isScript = bot && bot.isScript;
                const isStream = bot && bot.isStream;
                const isRunningStream = isStream && runningStreamBotIdList.includes(botJob.id);
                const isStoppingStream = isStream && !isRunningStream;

                return (
                  <tr key={botJob.id}>
                    <td>{ botJob.id }</td>
                    <td>@{ twitterAccount.screenName }</td>
                    <td>{ twitterAccount.twitterClientLabel }</td>
                    <td>{ botJob.botName }</td>
                    <EditableCell
                      value     = { JSON.stringify(botJob.config) }
                      onChange  = { this.updateBotConfig(i) }
                      className = { classNames("fixed", { "is-invalid": _.includes(configErrorIndex, i) }) }
                    />
                    <td>
                      <button
                        onClick  = { this.saveEditBotAction(i) }
                        title    = "Update bot action. After update, you must restart bot manually."
                        disabled = { _.includes(configErrorIndex, i) }
                      >
                        <i className="fa fa-floppy-o" aria-hidden={true} />
                      </button>
                      <button onClick={ this.deleteBotAction(i) } disabled={isRunningStream} title="Delete client.">
                        <i className="fa fa-trash" aria-hidden={true} />
                      </button>
                      {
                        isScript ? (
                          <button onClick={ this.runScriptBot(botJob.id) } title="Run script bot.">
                            <i className="fa fa-play-circle" aria-hidden={true} />
                          </button>
                        ) : null
                      }
                      {
                        isRunningStream ? (
                          <button onClick={ this.stopStreamBot(botJob.id) } title="Stop stream bot.">
                            <i className="fa fa-stop" aria-hidden={true} />
                          </button>
                        ) : null
                      }
                      {
                        isStoppingStream ? (
                          <button onClick={ this.startStreamBot(botJob.id) } title="Start stream bot.">
                            <i className="fa fa-play" aria-hidden={true} />
                          </button>
                        ) : null
                      }
                    </td>
                  </tr>
                );
              })
            }
            <tr>
              <td>New</td>
              <td colSpan="2">
                <Select
                  value     = { newBotJob.twitterAccountId }
                  onChange  = { this.updateBotAction(-1, "twitterAccountId") }
                  className = "width-100-percent"
                >
                  {
                    twitterAccountList.map(twitterAccount =>
                      <Option key={twitterAccount.id} value={twitterAccount.id}>
                        { `@${ twitterAccount.screenName } - ${ twitterAccount.twitterClientLabel }` }
                      </Option>
                    )
                  }
                </Select>
              </td>
              <td>
                <Select
                  value     = { newBotJob.botName }
                  onChange  = { this.updateBotName(-1) }
                  className = "width-100-percent"
                >
                  {
                    botList.map(bot =>
                      <Option key={bot.name} title={bot.description}>
                        { bot.name }
                      </Option>
                    )
                  }
                </Select>
              </td>
              <EditableCell
                value     = { JSON.stringify(newBotJob.config) }
                onChange  = { this.updateBotConfig(-1) }
                className = { classNames("fixed", { "is-invalid": newBotJob.hasError }) }
              />
              <td>
                <button onClick={ this.saveNewBotAction } title="Create new client." disabled={newBotJob.hasError}>
                  <i className="fa fa-floppy-o" aria-hidden={true} />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}
