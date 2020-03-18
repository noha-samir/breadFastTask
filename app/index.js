import express from "express";
import mongoose, { Model } from "mongoose";
import { resolvers } from "./resolvers";
import { typeDefs } from "./typeDefs";
import { ApolloServer, gql } from "apollo-server-express";
import { logger } from "./logger";
import moment from "moment";

const mongooseFindAndFilter = require('mongoose-find-and-filter');
require("dotenv").config();

mongoose.plugin(mongooseFindAndFilter);

const server = async () => {
    //create Apollo server and log errors in logger.js if exist
    const server = new ApolloServer({
        typeDefs, resolvers,
        formatError: (err) => {
            logger.log('error', `[${moment().format('YYYY-MM-DD hh:mm:ss')}] ${err.extensions.exception.stacktrace}`);
            const error = new Error(err.message);
            error.statusCode = err.extensions.code;
            return error;
        },
    });
    //connect our server to mongodb
    const app = express();
    server.applyMiddleware({ app });
    try {
        await mongoose.connect(`mongodb+srv://${process.env.SERVERNAME}:${process.env.SERVERPASSWORD}@cluster0-ro3et.mongodb.net/test?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });
    } catch (err) {
        console.log("Mongoose Err >>", err);
    }

    app.get('/', (req, res) => res.send('helloooo'));

    //listen to port 4001
    app.listen({ port: 4001 }, () =>
        console.log(`connected`)
    );

}

server();