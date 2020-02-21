const { DateTime, Duration } = require("luxon");
const { Task } = require("./models");

const resolvers = {
  Query: {
    tasks: () => Task.find(), // A real application would have users :)
    tasksOnDay: (_, { day }) => {
      const dayDateTime = DateTime.fromISO(day).setZone("utc");
      const start = dayDateTime.startOf("day");
      const end = dayDateTime.endOf("day");

      return Task.find({
        date: {
          $gte: start.toJSDate(),
          $lte: end.toJSDate(),
        },
      });
    },
  },
  Mutation: {
    createTask: async (_, { name, date }, { pubsub }) => {
      // In production it might be a good idea to store the IANA timezone as well as the time
      const task = new Task({ name, date, complete: false });

      await task.save();

      pubsub.publish("task", {
        taskData: {
          mutation: "CREATED",
          task,
        },
      });

      return task;
    },
    updateTask: async (_, { id, ...updates }, { pubsub }) => {
      const task = await Task.findOneAndUpdate({ _id: id }, updates, {
        new: true,
      });

      pubsub.publish("task", {
        taskData: {
          mutation: "UPDATED",
          task,
        },
      });

      return task;
    },
    deleteTask: async (_, { id }, { pubsub }) => {
      const task = await Task.findOneAndDelete({ _id: id });

      pubsub.publish("task", {
        taskData: {
          mutation: "DELETED",
          task,
        },
      });

      return true;
    },
  },
  Subscription: {
    taskData: {
      subscribe: (_, {}, { pubsub }) => pubsub.asyncIterator("task"),
    },
  },
};

module.exports = resolvers;
