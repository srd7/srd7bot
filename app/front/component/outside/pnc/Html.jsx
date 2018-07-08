import React, { Component } from "react";
import PropTypes            from "prop-types";

import Html                 from "app/front/component/common/Html";

export default class InsideHtml extends Component {
  static propTypes = {
    isMinified       : PropTypes.bool.isRequired,
    markup           : PropTypes.node.isRequired,
    state            : PropTypes.string.isRequired,
  };

  render() {
    const { isMinified, markup, state } = this.props;
    const css = isMinified ? "/pnc.min.css" : "/pnc.css";
    const js = isMinified ? "/pnc.min.js" : "/pnc.js";
    const favicon = "/pnc.ico";

    return (
      <Html
        title="素数チャレンジBot"
        css={css} js={js} favicon={favicon}
        markup={markup} state={state}
      />
    );
  }
}
