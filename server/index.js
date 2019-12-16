require("dotenv").config();
const { GraphQLServer, PubSub } = require("graphql-yoga");
const Ably = require("ably");
const ably = new Ably.Realtime(process.env.API_KEY);
const channel = ably.channels.get(
  "[product:ably-bitflyer/bitcoin]" + "bitcoin:jpy"
);

const typeDefs = `
  type Message {
    id: ID!
    side: String!
    price: Int!
    size: Int!
    exec_date: String!
    buy_child_order_acceptance_id: ID!
    sell_child_order_acceptance_id: ID!
  }
  type Query {
    messages(limit: Int, direction: String): [Message!]!
  }
  type Subscription {
    message: Message!
  }
`;

// wrap the call to channel history in a promise
const getMessageHistory = (limit, direction) => {
  return new Promise((resolve, reject) => {
    channel.history({ limit, direction }, (err, resultPage) => {
      if (err) {
        reject(err);
      } else {
        const messages = resultPage.items;
        resolve(messages);
      }
    });
  });
};

// resolver function that uses the promise function created for channel history
const messages = async (parent, args, ctx, info) => {
  // set some defaults for the call to history
  const { limit = 10, direction = "forwards" } = args;
  // call the wrapped call to history which is now an async function so you can wait for it to resolve
  const rawMessages = await getMessageHistory(limit, direction);
  // the return from the history call returns the items, pull off the data property for each item to send to the query
  return rawMessages.map(message => message.data);
};

const NEW_MESSAGE_TOPIC = "new_message";
const resolvers = {
  Query: {
    messages
  },
  Subscription: {
    message: {
      subscribe: (parent, args, ctx, info) =>
        ctx.pubsub.asyncIterator(NEW_MESSAGE_TOPIC)
    }
  }
};

const serverOptions = {
  port: 5000,
  endpoint: "/graphql",
  playground: "/docs",
  subscriptions: "/subscriptions",
  tracing: true,
  debug: true
};

const pubsub = new PubSub();
const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub } });

server.start(serverOptions, ({ port }) =>
  console.log(`server running on port ${port}`)
);

channel.subscribe(message =>
  pubsub.publish(NEW_MESSAGE_TOPIC, { message: message.data })
);
