#!/usr/bin/env node

require("babel-core/register");
var duplicateRecodeRemove = require("app/batch/DuplicateRecodeRemove");

duplicateRecodeRemove.exec()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
