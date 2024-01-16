import * as mongoose from 'mongoose';
import { Contest, Players, Team } from '../interface/model.interface';

const TeamSchema = new mongoose.Schema<Team>({
    idTeam: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    score: {
        type: Number,
        default: 0
    },
    contests: {
        type: Array<Contest>(),
        default: [],
    },
    members: {
        type: Array<Players>(),
        default: [],
    }
}, { timestamps: true });

export default mongoose.model<Team>("Team", TeamSchema);