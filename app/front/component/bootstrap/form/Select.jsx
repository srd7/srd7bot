import React, { Component } from "react";
import PropTypes            from "prop-types";
import classNames           from "classnames";

export default class Select extends Component {
  static propTypes = {
    label            : PropTypes.string,
    id               : PropTypes.string,
    className        : PropTypes.string,
    onChange         : PropTypes.func,
    children         : PropTypes.node.isRequired,
  };

  static defaultProps = {
    onChange         : () => {},
  };

  onChange(ev) {
    this.props.onChange(ev);
  }

  render() {
    const { label, className, children, ...rest } = this.props;
    return (
      <div className="form-group">
        { label ? <label htmlFor={this.props.id}>{ label }</label> : null }
        <select className={ classNames(className, "form-control") } onChange={this.onChange} {...rest}>
          { children }
        </select>
      </div>
    );
  }
}
