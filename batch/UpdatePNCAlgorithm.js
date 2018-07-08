#!/usr/bin/env node

require("babel-core/register");
var updatePNCAlgorithm = require("app/batch/UpdatePNCAlgorithm");

updatePNCAlgorithm.exec()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
