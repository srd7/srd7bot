import React, { Component }   from "react";
import PropTypes              from "prop-types";

import { bindActionCreators } from "redux";
import { connect }            from "react-redux";

import * as CounterAction     from "app/front/action/CounterAction";

@connect(
  (state) => {
    return { value: state.counter };
  },
  (dispatch) => bindActionCreators(CounterAction, dispatch)
)
export default class Counter extends Component {
  static propTypes = {
    value            : PropTypes.number.isRequired,
    increment        : PropTypes.func.isRequired,
    decrement        : PropTypes.func.isRequired,
  };

  incrementIfOdd() {
    if (this.props.value % 2 !== 0) {
      this.props.increment();
    }
  }

  incrementAsync() {
    setTimeout(() => this.props.increment(), 1000);
  }

  render() {
    const { value, increment, decrement } = this.props;
    return (
      <div>
        <p>
          Clicked: {value} times
          {" "}
          <button onClick={increment}>
            +
          </button>
          {" "}
          <button onClick={decrement}>
            -
          </button>
          {" "}
          <button onClick={::this.incrementIfOdd}>
            Increment if odd
          </button>
          {" "}
          <button onClick={::this.incrementAsync}>
            Increment async
          </button>
        </p>
      </div>
    );
  }
}
