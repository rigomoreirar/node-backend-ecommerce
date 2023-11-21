import uuid from 'uuid/v4.js';
import { validationResult } from 'express-validator';

import HttpError from '../models/http-error.mjs';
import getCoordsForAddress from '../utils/location.mjs';
import Place from '../models/place.mjs';

// NO LONGER USEFUL =>

// let DUMMY_PLACES = [
//     {id: 'p1',
//     title: 'Empire State Building',
//     description: 'I am a building and I am coding, yey!',
//     location: {
//         lat: 40.7484405,
//         lng: -73.9882393
//     },
//     address: '20 W 34th St., New York, NY 10001, United States',
//     creator: 'u1',
// }
// ];

const getPlaceById = async (req, res, next) => {

    const placeId = req.params.pid;

    console.log('GET Request in Places');

    let place;

    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find a place.', 500
        );
        return next(error);
    }

    if (!place) {
        return next(new HttpError('Could not find a place for the provided place id.', 404));
    }

    res.json({ place: place.toObject( {getters: true} ) });
};


const getPlacesByUserId = async (req, res, next) => {

    const userId = req.params.uid;

    console.log('GET Request in Places');

    let places;

    try {
         places = await Place.find({ creator: userId });
    } catch (err) {
        const error = new HttpError(
            'Fetching places failed, please try again', 500
        );
        return next(error);
    }

    if (!places || places.length === 0) {
          
        return next((new HttpError('Could not find a place for the user provided.', 404));
        
    }

    res.json({ places: places.toObject( {getters: true} ) });
};

const createPlace = async (req,res,next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed', 422));
    }

    const { title, description, address, creator } = req.body;

    let coordinates;

    try {
        coordinates = await getCoordsForAddress(address);
      } catch (error) {
        return next(error);
      }
    

    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: 'I am an image',
        creator
    });

    try {
        createdPlace.save();
    } catch (err) {
        const error = new HttpError(
            'Creating place failed, please try again', 500
        );
        return next(error);
    }

    res.status(201)
    .json(createdPlace);

};

const updatePlace = async (req,res,next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed', 422));
    }

    const { title, description } = req.body;

    const placeId = req.params.pid;

    let place;

    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, place could not be found.', 500
        );
        return next(error);
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, place could not be found.', 500
        );
        return next(error);
    }

    res.status(200)
    .json({place: place.toObject({ getters: true })});
};

const deletePlace = async (req,res,next) => {

    const placeId = req.params.pid;

    let place;

    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not delete place.', 500
        );
        return next(error);
    }

    try {
        await place.remove();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not delete place.', 500
        );
        return next(error);
    }

    res.status(200)
    .json({message: 'Deleted succesfully.'});

};



export { getPlaceById };

export { getPlacesByUserId };

export { createPlace };

export { updatePlace };

export { deletePlace };