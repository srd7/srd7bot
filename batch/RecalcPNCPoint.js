#!/usr/bin/env node

require("babel-core/register");
var recalcPNCPoint = require("app/batch/RecalcPNCPoint");

recalcPNCPoint.exec()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
