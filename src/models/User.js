import { Schema, model } from "mongoose";
import bcrypt from 'bcryptjs';

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,  // Establece una longitud mínima para el nombre de usuario
        maxlength: 50 // Establece una longitud máxima para el nombre de usuario
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true, // Convierte el correo electrónico a minúsculas
        validate: {
            validator: function(value) {
                // Expresión regular para validar el formato del correo electrónico
                return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(value);
            },
            message: 'El correo electrónico no es válido'
        }
    },
    roles: [{
        ref: "Role",
        type: Schema.Types.ObjectId
    }]
}, {
    timestamps: true,
    versionKey: false
});

// Método estático para encriptar la contraseña
userSchema.statics.encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Método estático para comparar la contraseña
userSchema.statics.comparePassword = async (password, receivedPassword) => {
    return await bcrypt.compare(password, receivedPassword);
};

userSchema.index({ email: 1 });

export default model('User', userSchema);
