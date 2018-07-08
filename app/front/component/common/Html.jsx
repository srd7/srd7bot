import React, { Component } from "react";
import PropTypes            from "prop-types";

export default class Html extends Component {
  static propTypes = {
    title            : PropTypes.string.isRequired,
    css              : PropTypes.string.isRequired,
    js               : PropTypes.string.isRequired,
    favicon          : PropTypes.string.isRequired,
    markup           : PropTypes.node.isRequired,
    state            : PropTypes.string.isRequired,
  };

  render() {
    const { title, css, js, favicon, markup, state } = this.props;

    return (
      <html>
        <head>
          <meta charSet="utf-8" />
          <title>{ title }</title>
          <link rel="stylesheet" href={css} />
          <link rel="icon" href={favicon} />
        </head>
        <body>
          <div id="app" dangerouslySetInnerHTML={{ __html: markup }} />
          <script dangerouslySetInnerHTML={{ __html: state }} />
          <script src={js} defer />
        </body>
      </html>
    );
  }
}
