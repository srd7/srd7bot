import React, { Component }      from "react";
import PropTypes                 from "prop-types";

import { bindActionCreators }    from "redux";
import { connect }               from "react-redux";

import * as TwitterAccountAction from "app/front/action/TwitterAccountAction";

@connect(
  (state) => {
    return { twitterAccountList: state.twitterAccount };
  },
  (dispatch) => bindActionCreators(TwitterAccountAction, dispatch)
)
export default class Accounts extends Component {
  static propTypes = {
    twitterAccountList: PropTypes.array.isRequired,
    deleteAccount     : PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = this.getInitialState(props);

    this.deleteAccount = ::this.deleteAccount;
  }

  componentWillReceiveProps(newProps) {
    console.log(newProps);
    this.setState(this.getInitialState(newProps));
  }

  /**
   * State の状態を初期化する。
   * 最初の読み込み時と Props 変更時に。
   */
  getInitialState(props) {
    return {
      twitterAccountList: props.twitterAccountList,
    };
  }

  deleteAccount(index) {
    return (_ev) => {
      // TODO: 確認メッセージとか
      this.props.deleteAccount(this.state.twitterAccountList[index]);
    };
  }

  render() {
    const { twitterAccountList } = this.state;

    return (
      <div>
        <table className="table">
          <thead>
            <tr>
              <th className="width-150">ID</th>
              <th>Client label</th>
              <th className="width-150">Action</th>
            </tr>
          </thead>
          <tbody>
            {
              twitterAccountList.map((twitterAccount, i) => (
                <tr key={ twitterAccount.id }>
                  <td>@{ twitterAccount.screenName }</td>
                  <td>{ twitterAccount.twitterClientLabel }</td>
                  <td>
                    <button onClick={ this.deleteAccount(i) } title="Delete account">
                      <i className="fa fa-trash" aria-hidden={true} />
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    );
  }
}
