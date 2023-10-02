import * as mongoose from 'mongoose';
import { Flags } from '../interface/model.interface';


const FlagsSchema = new mongoose.Schema<Flags>({
    idChall: {
        type: String,
        required: true,
        unique: true,
    },

    nameAuthor: {
        type: String,
        required: true,
    },

    nameChall: {
        type: String,
        required: true,
    },
    point: {
        type: Number,
        required: true,
    },
    level: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    flag: {
        type: String,
        required: true,
    },
    mode: {
        type: Boolean,
        required: true,
        default: false
    },
    url: {
        type: String,
    }

}, { timestamps: true });

export default mongoose.model<Flags>("Flag", FlagsSchema);