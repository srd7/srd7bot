import UUID   from "uuid/v4";
import Inject from "app/lib/di/Inject";

@Inject()
export default class RandomHelper {
  static injectionName = "RandomHelper";
  /**
   * UUID 生成
   */
  randomUUID() {
    return UUID();
  }
}
