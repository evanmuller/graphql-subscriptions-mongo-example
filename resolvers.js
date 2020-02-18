const moment = require("moment");
const { Task } = require("./models");

const updateTask = async (id, updates, pubsub) => {
  const task = await Task.findOneAndUpdate(
    { _id: id },
    updates.date // If there's a date, convert it to UTC.
      ? {
          ...updates,
          date: moment.utc(updates.date).toDate(),
        }
      : updates,
    {
      new: true,
    },
  );

  pubsub.publish("updatedTask", { updatedTask: task });

  return task;
};

const resolvers = {
  Query: {
    tasks: () => Task.find(), // A real application would have users, but we're going to skip that for this.
    tasksOnDay: (_, { day }) => {
      // A real application would store timezone offsets, for this, everything will be UTC.

      const startOfDay = moment
        .utc(day)
        .startOf("day")
        .toDate();

      const endOfDay = moment
        .utc(day)
        .endOf("day")
        .toDate();

      return Task.find({
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });
    },
  },
  Mutation: {
    createTask: async (_, { name }, { pubsub }) => {
      const task = new Task({
        name,
        date: moment()
          .utc()
          .toDate(),
        complete: false,
      });

      await task.save();
      pubsub.publish("newTask", { newTask: task });
      return task;
    },
    updateTask: (_, { id, name, date, complete }, { pubsub }) =>
      updateTask(id, { name, date, complete }, pubsub),
    moveTask: (_, { id, date }, { pubsub }) => updateTask(id, { date }, pubsub),
    completeTask: (_, { id, complete }, { pubsub }) =>
      updateTask(id, { complete }, pubsub),
    deleteTask: async (_, { id }, { pubsub }) => {
      await Task.findOneAndDelete({ _id: id });
      pubsub.publish("deletedTask", { deletedTask: id });
      return true;
    },
  },
  Subscription: {
    newTask: {
      subscribe: (_, {}, { pubsub }) => {
        return pubsub.asyncIterator("newTask");
      },
    },
    updatedTask: {
      subscribe: (_, {}, { pubsub }) => {
        return pubsub.asyncIterator("updatedTask");
      },
    },
    deletedTask: {
      subscribe: (_, {}, { pubsub }) => {
        return pubsub.asyncIterator("deletedTask");
      },
    },
  },
};

module.exports = resolvers;
