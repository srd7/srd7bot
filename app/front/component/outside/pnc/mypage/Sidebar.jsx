import React, { Component } from "react";
import PropTypes            from "prop-types";

import SideNav              from "app/front/component/bootstrap/nav/SideNav";

import { withPNCAccessKey } from "app/front/helper/PropHelper";

@withPNCAccessKey
export default class Sidebar extends Component {
  static propTypes = {
    accessKey        : PropTypes.string.isRequired,
  };

  render() {
    const { accessKey } = this.props;
    const urlBase = `/pnc/mypage/${accessKey}`;

    return (
      <SideNav>
        <SideNav.List>
          <SideNav.Item to={urlBase}>トップ</SideNav.Item>
          <SideNav.Item to={`${urlBase}/point`}>ポイント履歴</SideNav.Item>
        </SideNav.List>
      </SideNav>
    );
  }
}
