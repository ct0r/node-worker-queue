const { work } = require("../..");

work(() => new Promise((resolve) => setTimeout(resolve, 100)));
