import _                from "underscore";
import Inject           from "app/lib/di/Inject";

@Inject()
export default class StringHelper {
  static injectionName = "StringHelper";
  /**
   * 文字列置換を行う。
   * 例えば
   *   "hoge is ${hoge}"
   * という文字列に対し
   *   { hoge: 3 }
   * というオブジェクトを作用させることで
   *   "hoge is 3"
   * という文字列を返す。
   */
  format(str, obj = {}) {
    const regexp = /\$\{([^${}]+)\}/g;

    return str.replace(regexp, (match, key) => {
      const value = obj[key];
      if (_.isUndefined(value)) {
        console.warn(`Object does not have key "${key}".`);
        return match;
      } else {
        return value;
      }
    });
  }
}
