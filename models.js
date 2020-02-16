const mongoose = require("mongoose");

const Task = mongoose.model("Task", {
  name: {
    type: String,
    required: true,
  },
});

module.exports = { Task };
