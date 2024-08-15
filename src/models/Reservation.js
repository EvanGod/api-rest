import { Schema, model } from "mongoose";

const reservationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    table: {
        type: Schema.Types.ObjectId,
        ref: 'Table',
        required: true
    },
    reservationDate: {
        type: Date,
        required: true,
        validate: {
            validator: (value) => value >= new Date(),  // Asegura que la fecha no esté en el pasado
            message: 'La fecha de la reserva no puede estar en el pasado'
        }
    },
    reservationTime: {
        type: String,
        required: true,
        validate: {
            validator: (value) => /^[0-2][0-9]:[0-5][0-9]$/.test(value),  // Valida formato HH:MM
            message: 'El formato de la hora debe ser HH:MM'
        }
    },
    numberOfPeople: {
        type: Number,
        required: true,
        min: [1, 'El número de personas debe ser al menos 1']  // Asegura que haya al menos una persona
    },
    status: {
        type: String,
        enum: ['active', 'cancelled', 'completed'],
        default: 'active'
    }
}, {
    timestamps: true,
    versionKey: false
});

reservationSchema.index({ user: 1, table: 1, reservationDate: 1, reservationTime: 1 });

export default model('Reservation', reservationSchema);
