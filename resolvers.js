const { Task } = require("./models");

const resolvers = {
  Query: {
    tasks: () => Task.find(),
    description: () => "Description",
  },
  Mutation: {
    createTask: async (_, { name }) => {
      const task = new Task({ name });
      await task.save();
      return task;
    },
  },
};

module.exports = resolvers;
