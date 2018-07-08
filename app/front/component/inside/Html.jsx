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
    const css = isMinified ? "/inside.min.css" : "/inside.css";
    const js = isMinified ? "/inside.min.js" : "/inside.js";
    const favicon = "/inside.ico";

    return (
      <Html
        title="bot"
        css={css} js={js} favicon={favicon}
        markup={markup} state={state} />
    );
  }
}
