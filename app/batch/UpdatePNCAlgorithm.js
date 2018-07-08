// 素数ポイントの計算アルゴリズムを変更し、
// それに応じたポイントを再付与する。

import Inject             from "app/lib/di/Inject";
import PNCPointLogic      from "app/logic/PNCPointLogic";
import PNCPointLogs       from "app/model/PNCPointLogs";

@Inject({ pncPointLogic: PNCPointLogic, pncPointLogs: PNCPointLogs })
class UpdatePNCAlgorithm {
  static injectionName = "UpdatePNCAlgorithm";
  constructor({ pncPointLogic, pncPointLogs }) {
    this.pncPointLogic = pncPointLogic;
    this.pncPointLogs  = pncPointLogs;
  }

  exec() {
    const pncPointLogs = this.pncPointLogs;
    return pncPointLogs.schema.find()
      .then(pncPointLogList => pncPointLogList.reduce((prev, pncPointLog) => {
        return prev.then(() => {
          const { number } = pncPointLog;
          const dateStart = 20170318000000;
          const dateEnd   = 20170331235959;

          if (number > dateStart && number < dateEnd) {
            // 日付の数字で獲得したポイントは、
            // ひとまずチャレンジではなくTLポイントであったことにする。
            // すなわち13ポイントのまま。
            return pncPointLogs.schema.update(
              { _id: pncPointLog._id },
              { pointType: pncPointLogs.POINT_TL },
            ).exec();
          } else {
            // その他の数字で獲得したポイントは、
            // 数字ポイント。
            // ポイントを再計算する。
            const newBasePoint = this.pncPointLogic.calcBasePoint(number, pncPointLogs.POINT_NUMBER);
            // 元々のポイントは、桁数マイナス1
            const oldBasePoint = number.toString().length - 1;
            // 実際に得られたポイントが oldBasePoint よりも少ない場合は
            // 既にポイントを得られた数字。
            // そのため4で割る。
            const newPoint = (pncPointLog.point < oldBasePoint)? Math.floor(newBasePoint / 4) : newBasePoint;

            if (newPoint === 0) {
              // ポイントが0になるなら、そのレコードを削除する
              return pncPointLogs.schema.remove({ _id: pncPointLog._id }).exec();
            } else {
              // ポイントがあるなら、そのレコードを上書きする
              return pncPointLogs.schema.update(
                { _id: pncPointLog._id },
                { point: newPoint, pointType: pncPointLogs.POINT_NUMBER },
              ).exec();
            }
          }
        });
      }, Promise.resolve(1)));
  }
}

module.exports = Inject.getInstance(UpdatePNCAlgorithm);
