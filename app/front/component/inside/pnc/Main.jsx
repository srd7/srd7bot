import React, { Component } from "react";
import PropTypes            from "prop-types";

import Navigation           from "app/front/component/inside/Navigation";
import Sidebar              from "app/front/component/inside/pnc/Sidebar";

export default class PNCMain extends Component {
  static propTypes = {
    content          : PropTypes.node.isRequired,
  }
  render() {
    const { content } = this.props;

    return (
      <div>
        <Navigation />
        <div className="container-fluid">
          <div className="row">
            <Sidebar />
            <main className="col-sm-9 ml-sm-auto col-md-10 pt-3">
              { content }
            </main>
          </div>
        </div>
      </div>
    );
  }
}
