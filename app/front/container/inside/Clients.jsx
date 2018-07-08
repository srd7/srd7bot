import React, { Component }     from "react";
import PropTypes                from "prop-types";

import update                   from "react-addons-update";
import { bindActionCreators }   from "redux";
import { connect }              from "react-redux";

import * as TwitterClientAction from "app/front/action/TwitterClientAction";

import EditableCell             from "app/front/component/common/EditableCell";

@connect(
  (state) => {
    return { twitterClientList: state.twitterClient };
  },
  (dispatch) => bindActionCreators(TwitterClientAction, dispatch)
)
export default class Clients extends Component {
  static propTypes = {
    twitterClientList: PropTypes.array.isRequired,
    createClient     : PropTypes.func.isRequired,
    updateClient     : PropTypes.func.isRequired,
    deleteClient     : PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = this.getIntialState(props);

    this.updateClient   = ::this.updateClient;
    this.saveNewClient  = ::this.saveNewClient;
    this.saveEditClient = ::this.saveEditClient;
  }

  componentWillReceiveProps(newProps) {
    this.setState(this.getIntialState(newProps));
  }

  /**
   * State の状態を初期化する。
   * 最初の読み込み時と Props 変更時に。
   */
  getIntialState(props) {
    return {
      // 編集のために、既存データもすべて state に入れる。
      twitterClientList: props.twitterClientList,
      // 新規作成するアプリの情報
      newClient: {
        label         : "",
        consumerKey   : "",
        consumerSecret: "",
      },
    };
  }

  /**
   * Client の情報を編集する。
   * index が -1 の場合は、新規 app の編集を行う。
   */
  updateClient(index, key) {
    if (index < 0) {
      return (ev) => this.setState(update(this.state, {
        newClient: {
          [key]: { $set: ev.target.value },
        },
      }));
    } else {
      return (ev) => this.setState(update(this.state, {
        twitterClientList: {
          [index]: { [key]: { $set: ev.target.value } },
        },
      }));
    }
  }

  saveNewClient() {
    this.props.createClient(this.state.newClient);
  }

  saveEditClient(index) {
    return (_ev) => this.props.updateClient(this.state.twitterClientList[index]);
  }

  deleteClient(index) {
    return (_ev) => {
      // TODO: 確認メッセージとか
      this.props.deleteClient(this.state.twitterClientList[index]);
    };
  }

  loginClient(index) {
    return (_ev) => {
      const app = this.state.twitterClientList[index];
      // TODO: もっといい方法があれば変える！
      location.href = "/tw/login/" + app.id;
    };
  }

  render() {
    // const { value: apps, createClient, updateClient } = this.props;
    const { twitterClientList } = this.state;

    return (
      <div>
        <table className="table">
          <thead>
            <tr>
              <th className="width-100">ID</th>
              <th>Label</th>
              <th>Consumer key</th>
              <th>Consumer secret</th>
              <th className="width-150">Action</th>
            </tr>
          </thead>
          <tbody>
            {
              twitterClientList.map((twitterClient, i) => (
                <tr key={ twitterClient.id }>
                  <td>{ twitterClient.id }</td>
                  <EditableCell
                    value     = { twitterClient.label }
                    onChange  = { this.updateClient(i, "label")}
                    className = "fixed"
                  />
                  <EditableCell
                    value     = { twitterClient.consumerKey }
                    onChange  = { this.updateClient(i, "consumerKey")}
                    className = "fixed"
                  />
                  <EditableCell
                    value     = { twitterClient.consumerSecret }
                    onChange  = { this.updateClient(i, "consumerSecret")}
                    className = "fixed"
                  />
                  <td>
                    <button onClick={ this.saveEditClient(i) } title="Update client.">
                      <i className="fa fa-floppy-o" aria-hidden={true} />
                    </button>
                    <button onClick={ this.deleteClient(i) } title="Delete client.">
                      <i className="fa fa-trash" aria-hidden={true} />
                    </button>
                    <button onClick={ this.loginClient(i) } title="Login on Twitter.">
                      <i className="fa fa-twitter" aria-hidden={true} />
                      &nbsp;
                      <i className="fa fa-sign-in" aria-hidden={true} />
                    </button>
                  </td>
                </tr>
              ))
            }
            <tr>
              <td>New</td>
              <EditableCell
                value     = { this.state.newClient.label }
                onChange  = { this.updateClient(-1, "label") }
                className = "fixed"
              />
              <EditableCell
                value     = { this.state.newClient.consumerKey }
                onChange  = { this.updateClient(-1, "consumerKey") }
                className = "fixed"
              />
              <EditableCell
                value     = { this.state.newClient.consumerSecret }
                onChange  = { this.updateClient(-1, "consumerSecret") }
                className = "fixed"
              />
              <td>
                <button onClick={ this.saveNewClient } title="Create new client.">
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
