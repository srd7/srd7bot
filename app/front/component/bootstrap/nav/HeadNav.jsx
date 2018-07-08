import React, { Component } from "react";
import { Link }             from "react-router";
import PropTypes            from "prop-types";
import classNames           from "classnames";

class HeadNavBrand extends Component {
  static propTypes = {
    to               : PropTypes.string.isRequired,
    children         : PropTypes.node.isRequired,
  };

  render() {
    const { to, children } = this.props;
    return (
      <Link className="navbar-brand" to={to}>
        { children }
      </Link>
    );
  }
}

class HeaderNavToggle extends Component {
  render() {
    return (
      <button className="navbar-toggler d-lg-none" type="button" data-toggle="collapse">
        <span className="navbar-toggle-icon" />
      </button>
    );
  }
}

class HeaderNavCollapse extends Component {
  static propTypes = {
    children         : PropTypes.node.isRequired,
  };

  render() {
    return (
      <div className="collapse navbar-collapse">
        { this.props.children }
      </div>
    );
  }
}

class HeaderNavList extends Component {
  static propTypes = {
    left             : PropTypes.bool.isRequired,
    children         : PropTypes.node.isRequired,
  };

  static defaultProps = {
    left             : false,
  }

  render() {
    const { left, children } = this.props;
    return (
      <ul className={classNames("navbar-nav", { "mr-auto": !left, "mt-2 mt-md-0": left })}>
        { children }
      </ul>
    );
  }
}


class HeaderNavItem extends Component {
  static propTypes = {
    to               : PropTypes.string.isRequired,
    external         : PropTypes.bool.isRequired,
    children         : PropTypes.node.isRequired,
  };

  static defaultProps = {
    external         : false,
  }

  render() {
    const { to, external, children, ...rest } = this.props;
    return (
      <li className="nav-item">
        { external ?
          (
            <a className="nav-link" href={to} {...rest} >
              { children }
            </a>
          ) : (
            <Link className="nav-link" to={to} {...rest} >
              { children }
            </Link>
          )
        }
      </li>
    );
  }
}

export default class HeadNav extends Component {
  static propTypes = {
    children         : PropTypes.node.isRequired,
  };

  render() {
    return (
      <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
        { this.props.children }
      </nav>
    );
  }

  static Brand = HeadNavBrand;
  static Toggle = HeaderNavToggle
  static Collapse = HeaderNavCollapse;
  static List = HeaderNavList;
  static Item = HeaderNavItem;
}
