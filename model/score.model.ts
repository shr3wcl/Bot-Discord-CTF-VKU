import * as mongoose from 'mongoose';
import { Score } from '../interface/model.interface';


const ScoreSchema = new mongoose.Schema<Score>({
    idChall: {
        type: String,
        required: true
    },

    idUser: {
        type: String,
        required: true,
    },
    
    flag: {
        type: String,
        required: true,
    },
}, { timestamps: true });

export default mongoose.model<Score>("Score", ScoreSchema);