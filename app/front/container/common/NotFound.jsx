import React, { Component } from "react";
import PropTypes            from "prop-types";

/**
 * 外部向けのフロントページ。
 * とりあえず設置するだけ。
 * 外部 JS は今のところ必要としない。
 */
export default class NotFound extends Component {
  static propTypes = {
  };

  render() {
    return (
      <html>
        <head>
          <meta charSet="utf-8" />
          <title>Authentication Error</title>
        </head>
        <body>
          <p>Authentication Error</p>
        </body>
      </html>
    );
  }
}
