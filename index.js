const { GraphQLServer, PubSub } = require("graphql-yoga");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const resolvers = require("./resolvers");

dotenv.config();

const { PORT, DB_URL } = process.env;

mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to Mongo");
  })
  .catch(error => {
    console.log("Error connecting to Mongo", error);
  });

const server = new GraphQLServer({
  typeDefs: "./schema.graphql",
  resolvers,
  context: {
    pubsub: new PubSub(),
  },
});

server.start({ port: PORT }, ({ port }) =>
  console.log(
    `Server started, listening on port ${port} for incoming requests.`,
  ),
);
