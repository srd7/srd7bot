// バグによって同じ数字でポイントが入っていたので、
// 重複するレコードを削除する。

import Inject             from "app/lib/di/Inject";
import PNCPointLogs       from "app/model/PNCPointLogs";

@Inject({ pncPointLogs: PNCPointLogs })
class DuplicateRecodeRemove {
  static injectionName = "DuplicateRecodeRemove";
  constructor({ pncPointLogs }) {
    this.pncPointLogs = pncPointLogs;
  }

  exec() {
    const pncPointLogs = this.pncPointLogs;

    return pncPointLogs.schema.find()
      .then(pncPointLogList => pncPointLogList.reduce((prev, pncPointLog) => {
        return prev.then(() =>
          pncPointLogs.schema.remove({
            twitterId: pncPointLog.twitterId,
            number   : pncPointLog.number,
            createdAt: { $gt: pncPointLog.createdAt },
          }).exec()
        );
      }, Promise.resolve(1)));
  }
}

module.exports = Inject.getInstance(DuplicateRecodeRemove);
