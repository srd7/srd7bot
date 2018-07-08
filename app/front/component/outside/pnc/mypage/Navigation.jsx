import React, { Component }     from "react";
import PropTypes                from "prop-types";

import HeadNav                  from "app/front/component/bootstrap/nav/HeadNav";

import { withPNCAccessKey }     from "app/front/helper/PropHelper";

@withPNCAccessKey
export default class Navigation extends Component {
  static propTypes = {
    accessKey        : PropTypes.string.isRequired,
  };

  render() {
    const { accessKey } = this.props;
    const urlBase = `/pnc/mypage/${accessKey}`;
    return (
      <HeadNav>
        <HeadNav.Brand to={urlBase}>素数チャレンジBot</HeadNav.Brand>
        <HeadNav.Toggle />
      </HeadNav>
    );
  }
}
