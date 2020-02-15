const { GraphQLServer } = require("graphql-yoga");

const PORT = process.env.PORT || 4000;

const resolvers = {
  Query: {
    description: () => "Description",
  },
};

const server = new GraphQLServer({
  typeDefs: "./schema.graphql",
  resolvers,
});

server.start({ port: PORT }, ({ port }) =>
  console.log(
    `Server started, listening on port ${port} for incoming requests.`,
  ),
);
