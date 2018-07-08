import React, { Component } from "react";
import PropTypes            from "prop-types";

import Index                from "app/front/container/outside/pnc/Index";

export default class OutsidePncMypageMain extends Component {
  static propTypes = {
    content          : PropTypes.node.isRequired,
  };

  static defaultProps = {
    content          : <Index />,
  };

  render() {
    return (
      <div>
        { this.props.content }
      </div>
    );
  }
}
