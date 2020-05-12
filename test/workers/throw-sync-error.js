const { work } = require("../..");

work(() => {
  throw new Error("Sync error");
});
