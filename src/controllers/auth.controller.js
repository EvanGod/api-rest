import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import Role from "../models/Role.js";

dotenv.config();

const SECRET = process.env.SECRET;

// Función para firmar el token JWT
const signToken = (userId) => {
    const payload = {
        id: userId,
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // Expira en 1 hora
    };
    return jwt.sign(payload, SECRET);
};

// Función para verificar el token JWT
const verifyToken = (token) => {
    return jwt.verify(token, SECRET);
};

// Función para manejar errores
const handleError = (res, message, status = 500) => {
    console.error(message);
    res.status(status).json({ message });
};

export const signUp = async (req, res) => {
    const { username, email, password, roles } = req.body;

    if (!username || !email || !password) {
        return handleError(res, "Faltan campos requeridos", 400);
    }

    try {
        const userExists = await User.findOne({ $or: [{ username }, { email }] });
        if (userExists) {
            return handleError(res, "El nombre de usuario o correo electrónico ya están en uso", 400);
        }

        const hashedPassword = await User.encryptPassword(password);
        const newUser = new User({ username, email, password: hashedPassword });

        if (roles) {
            const foundRoles = await Role.find({ name: { $in: roles } });
            if (foundRoles.length === 0) {
                return handleError(res, "Uno o más roles especificados no existen", 400);
            }
            newUser.roles = foundRoles.map(role => role._id);
        } else {
            const role = await Role.findOne({ name: "user" });
            if (!role) {
                return handleError(res, "El rol 'user' no existe", 500);
            }
            newUser.roles = [role._id];
        }

        const savedUser = await newUser.save();
        const token = signToken(savedUser._id);

        res.status(201).json({ token });
    } catch (error) {
        handleError(res, "Error al registrar el usuario: " + error.message);
    }
};

export const signIn = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return handleError(res, "Faltan campos requeridos", 400);
    }

    try {
        const userFound = await User.findOne({ email }).populate("roles");
        if (!userFound) return handleError(res, "Usuario no encontrado", 404);

        const matchPassword = await User.comparePassword(password, userFound.password);
        if (!matchPassword) return handleError(res, "Contraseña inválida", 401);

        const token = signToken(userFound._id);
        res.status(200).json({ token });
    } catch (error) {
        handleError(res, "Error al iniciar sesión: " + error.message);
    }
};
