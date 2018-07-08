import React, { Component } from "react";
import PropTypes            from "prop-types";

import classNames           from "classnames";

export default class Button extends Component {
  static propTypes = {
    children         : PropTypes.node.isRequired,
    type             : PropTypes.string.isRequired,
    size             : PropTypes.string.isRequired,
    color            : PropTypes.string.isRequired,
    className        : PropTypes.string,
  };

  static defautltProps = {
    type             : "button",
    size             : "md",
    color            : "primary",
  };

  render() {
    const { children, type, size, color, className: propClass, ...rest } = this.props;
    const className = classNames(
      propClass,
      "btn",
      `btn-${size}`,
      `btn-${color}`,
    );
    return (
      <button className={className} type={type} {...rest} >
        { children }
      </button>
    );
  }
}
