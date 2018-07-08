import React, { Component } from "react";
import PropTypes            from "prop-types";

/**
 * <table> 内で使う編集可能なセル。
 *
 * とりあえず value は string 限定にしているが、
 * 数字も許容する可能性がある場合はよしなに変更しよう。
 */
export default class EditableCell extends Component {
  static propTypes = {
    value            : PropTypes.string.isRequired,
    onChange         : PropTypes.func.isRequired,
    className        : PropTypes.string,
  };

  static defaultProps = {
    className        : "",
  };

  emitChange(ev) {
    ev.target = { value: ev.target.innerHTML };
    console.log(ev.target.value);
    this.props.onChange(ev);
  }

  render() {
    const { value, className } = this.props;

    return (
      <td
        contentEditable
        // onInput   = { ::this.emitChange }
        onBlur    = { ::this.emitChange }
        className = { className }
        dangerouslySetInnerHTML = {{ __html: value }}
      />
    );
  }
}
