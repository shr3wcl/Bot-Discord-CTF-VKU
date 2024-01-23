import { User } from 'discord.js';
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
    category?: String | null,
    idContest?: String | null,
}

export interface Players extends mongoose.Document {
    idUser?: String,
    nameUser?: String,
    point: Number,
    level?: String,
    numberFlags: Number,
    idTeam?: String[],
}

export interface Score extends mongoose.Document {
    idUser?: String,
    flag?: String,
    idChall?: String
}

export interface Team extends mongoose.Document {
    idTeam?: String,
    name?: String,
    description?: String,
    score: Number,
    contests: Contest[],
    members: Players[],
}

export interface ContestParticipant {
    user: mongoose.Schema.Types.ObjectId,
    score: Number,
    flags: Number,
}

export interface SubmitContest extends mongoose.Document {
    idContest?: mongoose.Schema.Types.ObjectId,
    idTeam?: mongoose.Schema.Types.ObjectId,
    idChall?: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
}

export interface TeamContest {
    team: Team,
    score: Number,
}

export interface Contest extends Document {
    idContest?: String,
    nameContest?: String,
    description?: String,
    status?: String,
    startTime?: String,
    endTime?: String,
    teams: TeamContest[],
    submit: SubmitContest[],
    createdBy: String,
    password: String,
    public: Boolean,
    idChannel: String
    url: String,
}

export interface FlagContest extends mongoose.Document {
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