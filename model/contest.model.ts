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
    }
}, { timestamps: true });

export default mongoose.model<Contest>("Contest", ContestSchema);