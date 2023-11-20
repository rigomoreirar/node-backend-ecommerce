import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import placesRoutes from './routes/places-routes.mjs';
import usersRoutes from './routes/users-routes.mjs';
import HttpError from './models/http-error.mjs';

const app = express();

app.use(bodyParser.json());

app.use('/api/places', placesRoutes);

app.use('/api/users/', usersRoutes);

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404);
    return next(error);
});

app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res
    .status(error.code || 500)
    .json({message: error.message || 'An unkown error ocurred!'});
});

mongoose.connect(`mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@mongodb-service.database-space.svc.cluster.local:27017/places`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));
