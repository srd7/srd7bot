import React, { Component } from "react";
import PropTypes            from "prop-types";
import { withPNCAccessKey } from "app/front/helper/PropHelper";

@withPNCAccessKey
export default class OutsidePncMypageIndex extends Component {
  static propTypes = {
    profile          : PropTypes.isRequired,
  };

  render() {
    const { profile } = this.props;
    return (
      <div className="sb7-pnc-mypage">
        <h2>素数チャレンジBotマイページ</h2>
        <img src={profile.profileImageUrl} alt={"@" + profile.screenName} />
      </div>
    );
  }
}
