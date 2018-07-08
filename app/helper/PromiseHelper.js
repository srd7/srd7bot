import Inject from "app/lib/di/Inject";

@Inject()
export default class PromiseHelper {
  static injectionName = "PromiseHelper";
  /**
   * 一定時間待機する Promise を返す。
   */
  wait(millisec) {
    return new Promise(resolve => setTimeout(() => resolve(), millisec));
  }
}
