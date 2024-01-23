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
        type: Boolean,
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
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    password: {
        type: String,
        default: null
    },
    public: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

export default mongoose.model<Contest>("Contest", ContestSchema);