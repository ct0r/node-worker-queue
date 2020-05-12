const { work } = require("../..");

work(() => {
  throw new Error("Test sync error");
});
