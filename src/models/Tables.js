import { Schema, model } from 'mongoose';

const tableSchema = new Schema({
    number: {
        type: Number,
        required: true,
        unique: true,
        min: [1, 'El número de la mesa debe ser al menos 1'], // Valida que el número sea positivo
        validate: {
            validator: Number.isInteger,
            message: 'El número de la mesa debe ser un número entero'
        }
    },
    capacity: {
        type: Number,
        required: true,
        min: [1, 'La capacidad debe ser al menos 1'],  // Asegura que la capacidad sea un número positivo
        validate: {
            validator: Number.isInteger,  // Asegura que la capacidad sea un entero
            message: 'La capacidad debe ser un número entero'
        }
    }
}, {
    versionKey: false,
    timestamps: true
});

tableSchema.index({ number: 1 });

export default model('Table', tableSchema);
