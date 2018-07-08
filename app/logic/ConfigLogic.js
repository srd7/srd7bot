import _                from "underscore";

import Inject           from "app/lib/di/Inject";

// { $hour: 4 }
//   => function (obj) { return obj.hour === 4; }
// { $hour: 4, $minute: 30 }
//   => function (obj) { return obj.hour === 4 && obj.minute === 30 }
// { $hour: { $gt: 3 } }
//   => function (obj) { return obj.hour > 3; }
// { $hour: { $gt: 3, $lte: 21 }, $minute: { $gte: 0, $lte: 30 } }
//   => function (obj) { return obj.hour > 3 && obj.hour <= 21 && obj.minute >= 0 && obj.minute <= 30 }

// TODO: フォロワー数等も使えるようにしたい

function isOperator(key) {
  return key.match(/^\$(eq|ne|gte?|lte|default?)$/);
}

function isParameter(key) {
  return _.isString(key) && key.match(/^\$(hour|minute)$/);
}

function parseKey(_userProfile, time, key) {

  // TEMP: use $hour, $minute only.

  if (isParameter(key)) {
    const map = {
      $hour  : time.hour(),
      $minute: time.minute(),
    };
    return map[key];
  } else if (_.isString(key) && key.match(/^\$/)) {
    console.warn(`Unknown key type "${key}" may be unexpected result.`);
    return key;
  } else {
    return key;
  }
}

function compare(userProfile, time, operator, k1, k2) {

  const v1 = parseKey(userProfile, time, k1);
  const v2 = parseKey(userProfile, time, k2);

  const map = {
    $eq     : v1 === v2,
    $ne     : v1 !== v2,
    $gt     : v1 >   v2,
    $gte    : v1 >=  v2,
    $lt     : v1 <   v2,
    $lte    : v1 <=  v2,
    $default: v1 === v2,
  };

  const result = map[operator];

  if (! _.isUndefined(result)) {
    return result;
  } else {
    console.warn(`Unknown operator type "${operator}" always returns \`false\``);
    return false;
  }
}

function parse(userProfile, time, condition, operator = "$default", sentKey = undefined) {

  if (_.isObject(condition)) {

    const isOr = sentKey === "$or";

    return Object.keys(condition).reduce((bool, key) => {
      const next = isOperator(key)?
        parse(userProfile, time, condition[key], key, sentKey) :
        parse(userProfile, time, condition[key], "$default", key);

      // console.log(operator, condition, sentKey, "=>", next);
      return isOr? (bool || next) : (bool && next);
    }, ! isOr);
  } else {
    return compare(userProfile, time, operator, sentKey, condition);
  }
}

@Inject()
export default class ConfigLogic {
  static injectionName = "ConfigLogic";
  getCheckConditionFunc(userProfile, time) {
    return (condition) => {
      const _condition = _.isString(condition)? JSON.parse(condition) : condition;
      if (_.isObject(_condition)) {
        return parse(userProfile, time, condition);
      } else {
        return condition;
      }
    };
  }
}
