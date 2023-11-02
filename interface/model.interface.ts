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
    url?: String | null,
    category?: String | null
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

export interface Team extends mongoose.Document {
    name?: String;
    description?: String;
    score: Number;
    flags: Flags[];
    members: ContestParticipant[];
}

interface ContestParticipant {
    user: mongoose.Schema.Types.ObjectId;
    score: Number;
    flags: Number;
}

interface Contest extends Document {
    idContest?: String;
    nameContest?: String;
    description?: String;
    status?: Boolean;
    startTime?: String;
    endTime?: String;
    teams: Team[];
}