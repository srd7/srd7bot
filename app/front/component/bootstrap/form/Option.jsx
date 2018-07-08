import React, { Component } from "react";
import PropTypes            from "prop-types";

export default class Option extends Component {
  static propTypes = {
    value            : PropTypes.any,
    children         : PropTypes.node.isRequired,
  };

  render() {
    const { value, children, ...rest } = this.props;
    return (
      <option value={value} {...rest} >{ children }</option>
    );
  }
}
