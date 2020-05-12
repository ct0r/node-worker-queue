const { work } = require("../..");

work(() => Promise.reject(new Error("Async error")));
