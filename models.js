const mongoose = require("mongoose");

const Task = mongoose.model("Task", {
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  complete: {
    type: Boolean,
    required: true,
  },
  notes: {
    type: String,
  },
  timeAllotment: {
    type: String,
  },
});

module.exports = { Task };
