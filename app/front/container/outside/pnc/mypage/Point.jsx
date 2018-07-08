import React, { Component }   from "react";
import PropTypes              from "prop-types";
import moment                 from "moment";

import { bindActionCreators } from "redux";
import { connect }            from "react-redux";

import * as PNCPointLogAction from "app/front/action/PNCPointLogAction";

const DATE_FORMAT = "YYYY年MM月DD日 HH時mm分ss秒";

@connect(
  (state) => {
    const { pncAccessKey, pncPointLog } = state;
    const { profile } = pncAccessKey;
    const { pointLogList, hasNext, aggregatedAt, isInvalid } = pncPointLog;
    return { profile, pointLogList, hasNext, aggregatedAt, isInvalid };
  },
  (dispatch) => bindActionCreators(PNCPointLogAction, dispatch)
)
export default class OutsidePncMypagePoint extends Component {
  static propTypes = {
    profile          : PropTypes.object.isRequired,
    pointLogList     : PropTypes.array.isRequired,
    hasNext          : PropTypes.bool.isRequired,
    aggregatedAt     : PropTypes.instanceOf(Date).isRequired,
    isInvalid        : PropTypes.bool.isRequired,
    loadNext         : PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = this.getInitialState(props);

    this.loadNext        = ::this.loadNext;
    this.emptyListRender = ::this.emptyListRender;
    this.listRender      = ::this.listRender;
  }

  componentWillReceiveProps(newProps) {
    this.setState(this.getInitialState(newProps));
  }

  getInitialState(props) {
    return {
      profile     : props.profile,
      pointLogList: props.pointLogList,
      hasNext     : props.hasNext,
      aggregatedAt: props.aggregatedAt,
      isInvalid   : props.isInvalid,
    };
  }


  loadNext(_ev) {
    if (this.state.hasNext) {
      this.props.loadNext();
    }
  }

  render() {
    const { profile, pointLogList, hasNext, aggregatedAt, isInvalid } = this.state;
    return (
      <div className="sb7-pnc-mypage-point">
        { isInvalid ? <div>データ不整合のため再読み込みしてください</div> : null }
        <div>集計日時: { moment(aggregatedAt).format(DATE_FORMAT) }</div>
        {
          pointLogList.length === 0 ?
            this.emptyListRender() :
            this.listRender(profile, pointLogList)
        }
        {
          hasNext ?
            <button className="btn btn-link" onClick={this.loadNext} >続きを読み込む</button> :
            null
        }
      </div>
    );
  }

  emptyListRender() {
    return (
      <div>ポイント獲得履歴がありません</div>
    );
  }

  listRender(profile, pointLogList) {
    return (
      <table className="table">
        <thead>
          <tr>
            <th>対象素数</th>
            <th>獲得ポイント数</th>
            <th>ツイート日時</th>
            <th>対象ツイート</th>
          </tr>
        </thead>
        <tbody>
          { pointLogList.map((pointLog, i) => {
            const tweetUrl = `https://twitter.com/${profile.screenName}/status/${pointLog.statusId}`;

            return (
              <tr key={i}>
                <td>{ pointLog.number }</td>
                <td>{ pointLog.point }</td>
                <td>{ moment(pointLog.createdAt).format(DATE_FORMAT) }</td>
                <td>
                  { pointLog.statusId ?
                    <a href={tweetUrl} target="_blank">ツイートへのリンク</a> :
                    <span>ツイートへのリンクはありません</span>
                  }
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }
}
