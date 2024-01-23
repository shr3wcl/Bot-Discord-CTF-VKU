import * as mongoose from 'mongoose';
import { Contest, Team, SubmitContest, TeamContest } from '../interface/model.interface';

const ContestSchema = new mongoose.Schema<Contest>({
    idContest: {
        type: String,
        required: true,
        unique: true
    },
    nameContest: {
        type: String,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    status: {
        type: String,
        default: false
    },
    startTime: {
        type: String,
        default: null
    },
    endTime: {
        type: String,
        default: null
    },
    teams: {
        type: Array<TeamContest>(),
        default: [],
    },
    submit: {
        type: Array<SubmitContest>(),
        default: [],
    },
    createdBy: {
        type: String,
    },
    password: {
        type: String,
        default: null
    },
    public: {
        type: Boolean,
        default: false
    },
    idChannel: {
        type: String,
        default: null
    },
    url: {
        type: String,
        default: null
    },
}, { timestamps: true });

export default mongoose.model<Contest>("Contest", ContestSchema);