import * as mongoose from 'mongoose';
import { Players } from '../interface/model.interface';


const PlayerSchema = new mongoose.Schema<Players>({
    idUser: {
        type: String,
        required: true
    },

    nameUser: {
        type: String,
        required: true,
    },

    level: {
        type: String,
        default: "Newbie"
    },

    point: {
        type: Number,
        required: true,
    },
    
    numberFlags: {
        type: Number,
        default: 0
    },

    idTeam: {
        type: String,
        default: null
    },

}, { timestamps: true });

export default mongoose.model<Players>("Player", PlayerSchema);