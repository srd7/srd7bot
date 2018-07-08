// 素数ポイント計算アルゴリズム

import _                from "underscore";

import Inject           from "app/lib/di/Inject";

import PNCPointLogs     from "app/model/PNCPointLogs";

@Inject({ pncPointLogs: PNCPointLogs })
export default class PNCPointLogics {
  static injectionName = "PNCPointLogics";
  constructor({ pncPointLogs }) {
    this.pncPointLogs = pncPointLogs;
  }

  calcPoint(twitterId, number, pointType) {
    const pncPointLogs = this.pncPointLogs;

    const basePoint = this.calcBasePoint(number, pointType);

    return pncPointLogs.checkObtained(twitterId, number)
      .then(value => {
        // 既に他の人が見つけた素数の場合、
        // ポイントは 4分の1。
        // 既に自分が見つけた素数の場合はゼロ。
        switch(value) {
          case pncPointLogs.NOBODY_OBTAINED    : return basePoint;
          case pncPointLogs.ALREADY_OBTAINED   : return 0;
          case pncPointLogs.OTHER_USER_OBTAINED: return Math.round(basePoint / 4);
          default                              : return 0;
        }
      });
  }

  // 数字から得られる素点の計算法
  calcBasePoint(number, pointType) {
    const pncPointLogs = this.pncPointLogs;
    switch (pointType) {
      // チャレンジの場合は一律31ポイント。
      case pncPointLogs.POINT_CHALLENGE: return 31;
      // TL 反応の場合は一律13ポイント。
      case pncPointLogs.POINT_TL       : return 13;
      // 数字リプの場合はちょっと計算する。
      case pncPointLogs.POINT_NUMBER   : {
        // 含まれる数字の種類 - 1
        // すなわち最高で9ポイント。
        return _.uniq(number.toString().split("")).length - 1;
      }
      // その他の場合は0ポイント。
      default: return 0;
    }
  }
}
