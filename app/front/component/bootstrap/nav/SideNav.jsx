import React, { Component } from "react";
import { Link }             from "react-router";
import PropTypes            from "prop-types";
import classNames           from "classnames";

import { withCurrentPath }  from "app/front/helper/PropHelper";

class SideNavList extends Component {
  static propTypes = {
    children         : PropTypes.node.isRequired,
  };

  render() {
    return (
      <ul className="nav nav-pills flex-column">
        { this.props.children }
      </ul>
    );
  }
}

@withCurrentPath
class SideNavItem extends Component {
  static propTypes = {
    currentPath      : PropTypes.string,
    to               : PropTypes.string.isRequired,
    children         : PropTypes.node.isRequired,
  };

  render() {
    const { currentPath, to, children } = this.props;
    return (
      <li className="nav-item">
        <Link className={classNames("nav-link", { active: to === currentPath })} to={to}>
          { children }
        </Link>
      </li>
    );
  }
}

export default class SideNav extends Component {
  static propTypes = {
    children         : PropTypes.node.isRequired,
  };

  render() {
    return (
      <nav className="col-sm-3 col-md-2 d-none d-sm-block bg-light sb7-sidebar">
        { this.props.children }
      </nav>
    );
  }

  static List = SideNavList;
  static Item = SideNavItem;
}
