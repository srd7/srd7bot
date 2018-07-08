import React, { Component } from "react";
import PropTypes            from "prop-types";

import Container            from "app/front/component/bootstrap/layout/Container";
import Button               from "app/front/component/bootstrap/Button";

/**
 * 外部向け専用のログインフォーム。
 * とりあえず設置するだけ。
 * 外部 JS は今のところ必要としない。
 */
export default class LoginForm extends Component {
  static propTypes = {
    token            : PropTypes.string.isRequired,
    loginPath        : PropTypes.string.isRequired,
    isDevelop        : PropTypes.bool.isRequired,
  };

  render() {
    const { token, loginPath, isDevelop } = this.props;

    const css = isDevelop ? "/login.css" : "/login.min.css";

    return (
      <html>
        <head>
          <meta charSet="utf-8" />
          <title>bot login form</title>
          <link rel="stylesheet" href={css} />
        </head>
        <body>
          <Container>
            <form method="POST" action={loginPath} className="sb7-login-form">
              <h2>Please sign in</h2>
              <input type="hidden" name="_csrf" value={token} />
              <input type="email" name="email" placeholder="Email" className="form-control" />
              <input type="password" name="password" placeholder="Password" className="form-control" />
              <Button size="md" color="primary" type="submit" className="btn-block">Sign in</Button>
            </form>
          </Container>
        </body>
      </html>
    );
  }
}
