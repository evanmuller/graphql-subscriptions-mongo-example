const { GraphQLServer } = require("graphql-yoga");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const resolvers = require("./resolvers");

dotenv.config();

const { PORT, DB_URL } = process.env;

const server = new GraphQLServer({
  typeDefs: "./schema.graphql",
  resolvers,
});

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

server.start({ port: PORT }, ({ port }) =>
  console.log(
    `Server started, listening on port ${port} for incoming requests.`,
  ),
);
