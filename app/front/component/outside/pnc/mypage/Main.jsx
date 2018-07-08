import React, { Component } from "react";
import PropTypes            from "prop-types";

import { withPNCAccessKey } from "app/front/helper/PropHelper";

import Navigation           from "app/front/component/outside/pnc/mypage/Navigation";
import Sidebar              from "app/front/component/outside/pnc/mypage/Sidebar";

import MypageIndex          from "app/front/container/outside/pnc/mypage/Index";

@withPNCAccessKey
export default class OutsidePncMypageMain extends Component {
  static propTypes = {
    content          : PropTypes.node.isRequired,
    isSuccess        : PropTypes.bool.isRequired,
  };

  static defaultProps = {
    content          : <MypageIndex />,
  };

  render() {
    return this.props.isSuccess ? this.successRender() : this.failureRender();
  }

  successRender() {
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

  failureRender() {
    return (
      <div className="sb7-pnc-invalid">
        <i className="fa fa-exclamation-triangle" aria-hidden={true} />
        <span className="sb7-pnc-invalid-message">
          Invalid access key.
        </span>
      </div>
    );
  }
}
