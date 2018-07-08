import React, { Component } from "react";

import SideNav              from "app/front/component/bootstrap/nav/SideNav";

export default class Sidebar extends Component {
  static propTypes = {
  };

  render() {
    return (
      <SideNav>
        <SideNav.List>
          <SideNav.Item to="/">Home</SideNav.Item>
          <SideNav.Item to="/counter">Counter</SideNav.Item>
          <SideNav.Item to="/clients">Client</SideNav.Item>
          <SideNav.Item to="/accounts">Account</SideNav.Item>
          <SideNav.Item to="/actions">Bot Action</SideNav.Item>
        </SideNav.List>
      </SideNav>
    );
  }
}
