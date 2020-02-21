const { DateTime } = require("luxon");
const { Task } = require("./models");

const updateTask = async (id, updates, pubsub) => {
  const task = await Task.findOneAndUpdate({ _id: id }, updates, { new: true });

  pubsub.publish("task", {
    taskData: {
      mutation: "UPDATED",
      task,
    },
  });

  return task;
};

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
    updateTask: (_, { id, name, date, complete }, { pubsub }) =>
      updateTask(id, { name, date, complete }, pubsub),
    moveTask: (_, { id, date }, { pubsub }) => updateTask(id, { date }, pubsub),
    completeTask: (_, { id, complete }, { pubsub }) =>
      updateTask(id, { complete }, pubsub),
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
