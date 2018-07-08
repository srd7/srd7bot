import React, { Component } from "react";

import SideNav              from "app/front/component/bootstrap/nav/SideNav";

export default class Sidebar extends Component {
  static propTypes = {
  };

  render() {
    return (
      <SideNav>
        <SideNav.List>
          <SideNav.Item to="/pnc">Home</SideNav.Item>
          <SideNav.Item to="/pnc/ranking">Ranking</SideNav.Item>
          <SideNav.Item to="/pnc/point">Point Manager</SideNav.Item>
        </SideNav.List>
      </SideNav>
    );
  }
}
