import uuid from 'uuid/v4.js';
import { validationResult } from 'express-validator';

import HttpError from '../models/http-error.mjs';
import getCoordsForAddress from '../utils/location.mjs';

let DUMMY_PLACES = [
    {id: 'p1',
    title: 'Empire State Building',
    description: 'I am a building and I am coding, yey!',
    location: {
        lat: 40.7484405,
        lng: -73.9882393
    },
    address: '20 W 34th St., New York, NY 10001, United States',
    creator: 'u1',
}
];

const getPlaceById = (req, res, next) => {

    const placeId = req.params.pid;

    console.log('GET Request in Places');

    const place = DUMMY_PLACES.find(p => {
        return p.id === placeId;
    });

    if (!place) {
        
        return next(new HttpError('Could not find a place for the provided place id.', 404));

    }

    res.json({ place });
};


const getPlacesByUserId = (req, res, next) => {

    const userId = req.params.uid;

    console.log('GET Request in Places');

    const places = DUMMY_PLACES.filter(place => {
        return place.creator === userId;
    });

    if (!places || places.length === 0) {
          
        return next(new Error('Could not find a place for the provided user id.'));
        
    }

    res.json({ places });
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
    

    const createdPlace = {
        id: uuid(),
        title,
        description,
        location: coordinates,
        address,
        creator
    }

    DUMMY_PLACES.push(createdPlace);

    res.status(201)
    .json(createdPlace);

};

const updatePlace = (req,res,next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed', 422));
    }

    const { title, description } = req.body;

    const placeId = req.params.pid;

    const updatedPlace = { ...DUMMY_PLACES.find(place => place.id === placeId)};

    const placeIndex = DUMMY_PLACES.findIndex(place => place.id === placeId);

    updatedPlace.title = title;
    updatedPlace.description = description;

    DUMMY_PLACES[placeIndex] = updatedPlace;

    res.status(200)
    .json({place: updatedPlace});

};

const deletePlace = (req,res,next) => {

    const placeId = req.params.pid;

    if(!DUMMY_PLACES.filter(place => place.id !== placeId)) {
        return next(new HttpError('Could not find a place for that id', 404));
    }

    DUMMY_PLACES = DUMMY_PLACES.filter(place => place.id !== placeId);

    res.status(200)
    .json({message: 'Deleted succesfully.'});

};



export { getPlaceById };

export { getPlacesByUserId };

export { createPlace };

export { updatePlace };

export { deletePlace };