import React, { Component }     from "react";

import HeadNav                  from "app/front/component/bootstrap/nav/HeadNav";

export default class Navigation extends Component {
  render() {
    return (
      <HeadNav>
        <HeadNav.Brand to="/">Bot Manager</HeadNav.Brand>
        <HeadNav.Toggle />
        <HeadNav.Collapse>
          <HeadNav.List>
            <HeadNav.Item to="/">Account</HeadNav.Item>
            <HeadNav.Item to="/pnc">PNC</HeadNav.Item>
          </HeadNav.List>
          <HeadNav.List left>
            <HeadNav.Item to="/logout" external>Sign out</HeadNav.Item>
          </HeadNav.List>
        </HeadNav.Collapse>
      </HeadNav>
    );
  }
}
