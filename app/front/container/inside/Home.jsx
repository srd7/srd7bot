import React, { Component } from "react";
import PropTypes            from "prop-types";

export default class Home extends Component {
  static propTypes = {
    temp             : PropTypes.string,
  };

  render() {
    return (
      <div>Home</div>
    );
  }
}
