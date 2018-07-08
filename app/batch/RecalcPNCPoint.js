// PNCPointLogs を変更後に、
// PNC Point を再計算する。

import Inject             from "app/lib/di/Inject";
import PNCPoints          from "app/model/PNCPoints";
import PNCPointLogs       from "app/model/PNCPointLogs";
import EventRegulators    from "app/model/EventRegulators";

@Inject({
  pncPoints: PNCPoints, pncPointLogs: PNCPointLogs,
  eventRegulators: EventRegulators,
})
class RecalcPNCPoint {
  static injectionName = "RecalcPNCPoint";
  constructor({ pncPoints, pncPointLogs, eventRegulators }) {
    this.pncPoints = pncPoints;
    this.pncPointLogs = pncPointLogs;
    this.eventRegulators = eventRegulators;
  }

  exec() {
    const pncPoints = this.pncPoints;
    const pncPointLogs = this.pncPointLogs;
    const eventRegulators = this.eventRegulators;

    const eventName = "PNC_POINT_RECORD";

    return Promise.all([
      // 最後にイベントを実行した時刻を取得
      eventRegulators.schema.findOne({ name: eventName }, null, { sort: { date: -1 } }),
      // ポイントを持つアカウントを全件取得
      pncPoints.schema.find(),
      // ポイントログを全件取得
      pncPointLogs.schema.find(),
    ])
      .then(([eventRegulator, pncPointList, pncPointLogList]) => {
        // 最後のイベント実行日
        const lastRecordAt = eventRegulator.date;
        // アカウントごとにポイントを再計算
        return pncPointList.reduce((prev, pncPoint) => {
          return prev.then(() => {
            const { twitterId } = pncPoint;
            const accountPNCPointLogList = pncPointLogList.filter(pncPointLog =>
              pncPointLog.twitterId === twitterId
            );
            let dailyPoint = 0;
            let totalPoint = 0;

            accountPNCPointLogList.forEach(pncPointLog => {
              totalPoint += pncPointLog.point;
              if (pncPointLog.createdAt > lastRecordAt) {
                dailyPoint += pncPointLog.point;
              }
            });

            return pncPoints.schema.update({ twitterId }, { dailyPoint, totalPoint }).exec();
          });
        }, Promise.resolve(1));
      });
  }
}

module.exports = Inject.getInstance(RecalcPNCPoint);
