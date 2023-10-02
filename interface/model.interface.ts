import * as mongoose from 'mongoose';

export interface Flags extends mongoose.Document {
    idChall?: String,
    nameAuthor?: String,
    nameChall?: String,
    point: Number,
    level?: String,
    description?: String,
    flag?: String,
    mode?: Boolean,
    url?: String | null
}

export interface Players extends mongoose.Document {
    idUser?: String,
    nameUser?: String,
    point: Number,
    level?: String,
    numberFlags: Number,
}

export interface Score extends mongoose.Document {
    idUser?: String,
    flag?: String,
    idChall?: String
}