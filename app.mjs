import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

import placesRoutes from './routes/places-routes.mjs';
import usersRoutes from './routes/users-routes.mjs';
import HttpError from './models/http-error.mjs';

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
});

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use('/api/places', placesRoutes);

app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404);
    return next(error);
});

app.use((error, req, res, next) => {
    if (req.file) {
        fs.unlink(req.file.path, err => {
            console.log(err);
        });
    }
    if (res.headerSent) {
        return next(error);
    }
    res
    .status(error.code || 500)
    .json({message: error.message || 'An unkown error ocurred!'});
});

mongoose.connect(
    `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@mongodb-0.mongodb-service.ecommerce.svc.cluster.local:27017/ecommerce-template?replicaSet=rs0&retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB');
    app.listen(5000);
})
.catch(err => console.error('Could not connect to MongoDB', err));




