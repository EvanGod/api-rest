import Reservation from "../models/Reservation.js";
import Table from "../models/Tables.js";
import User from "../models/User.js";
import mongoose from "mongoose";

const validateNumberOfPeople = (numberOfPeople) => {
    return Number.isInteger(numberOfPeople) && numberOfPeople > 0;
};

const validateId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

const findTableByNumber = async (tableNumber) => {
    return Table.findOne({ number: tableNumber });
};

const findConflictingReservation = async (tableId, reservationDate, reservationTime, excludeId = null) => {
    return Reservation.findOne({
        table: tableId,
        reservationDate,
        reservationTime,
        _id: { $ne: excludeId },
        status: { $ne: 'cancelled' }
    });
};

export const getReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find()
            .populate('user', 'username email')
            .populate('table', 'number');
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las reservas: " + error.message });
    }
};

export const addReservation = async (req, res) => {
    try {
        const { userId, tableNumber, reservationDate, reservationTime, numberOfPeople } = req.body;

        // Verificar que todos los campos estén presentes
        if (!userId || !tableNumber || !reservationDate || !reservationTime || !numberOfPeople) {
            return res.status(400).json({ message: "Faltan campos requeridos" });
        }

        // Validar ID de usuario y número de mesa
        if (!validateId(userId)) {
            return res.status(400).json({ message: "ID de usuario no válido" });
        }

        const table = await findTableByNumber(tableNumber);
        if (!table) {
            return res.status(404).json({ message: `Mesa con número ${tableNumber} no encontrada` });
        }

        // Validar número de personas
        if (!validateNumberOfPeople(numberOfPeople)) {
            return res.status(400).json({ message: "Número de personas debe ser un número entero positivo" });
        }

        // Verificar que el número de personas no exceda la capacidad de la mesa
        if (numberOfPeople > table.capacity) {
            return res.status(400).json({ message: `El número de personas excede la capacidad de la mesa (${table.capacity})` });
        }

        // Verificar existencia de usuario
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: `Usuario con ID ${userId} no encontrado` });
        }

        // Verificar conflictos de reserva
        const conflictingReservation = await findConflictingReservation(table._id, reservationDate, reservationTime);
        if (conflictingReservation) {
            return res.status(400).json({ message: "La mesa está ocupada en la fecha y hora seleccionadas" });
        }

        // Crear nueva reserva
        const newReservation = new Reservation({
            user: user._id,
            table: table._id,
            reservationDate,
            reservationTime,
            numberOfPeople
        });

        const reservationSave = await newReservation.save();
        res.status(201).json(reservationSave);
    } catch (error) {
        res.status(500).json({ message: "Error al agregar la reserva: " + error.message });
    }
};


export const getReservationById = async (req, res) => {
    try {
        const { reservationId } = req.params;

        // Validar el formato del ID de la reserva
        if (!reservationId || reservationId.length !== 24) {
            return res.status(400).json({ message: 'ID de reserva inválido' });
        }

        // Buscar la reserva en la base de datos
        const reservation = await Reservation.findById(reservationId)
            .populate('user', 'username email')
            .populate('table', 'number');

        // Verificar si la reserva existe
        if (!reservation) {
            return res.status(404).json({ message: `Reserva con ID ${reservationId} no encontrada` });
        }

        // Devolver la reserva encontrada
        res.json(reservation);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la reserva: " + error.message });
    }
};


export const getReservationsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!validateId(userId)) {
            return res.status(400).json({ message: "ID de usuario no válido" });
        }

        const reservations = await Reservation.find({ user: userId })
            .populate('user', 'username email')
            .populate('table', 'number');
        if (!reservations.length) {
            return res.status(404).json({ message: `No hay reservas para el usuario con ID ${userId}` });
        }
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las reservas del usuario: " + error.message });
    }
};

export const getReservationsByTableNumber = async (req, res) => {
    try {
        const { tableNumber } = req.params;

        if (!tableNumber) {
            return res.status(400).json({ message: "Número de mesa es requerido" });
        }

        const table = await findTableByNumber(tableNumber);
        if (!table) {
            return res.status(404).json({ message: `Mesa con número ${tableNumber} no encontrada` });
        }
        const reservations = await Reservation.find({ table: table._id })
            .populate('user', 'username email')
            .populate('table', 'number');
        if (!reservations.length) {
            return res.status(404).json({ message: `No hay reservas para la mesa con número ${tableNumber}` });
        }
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las reservas de la mesa: " + error.message });
    }
};

export const updateReservationById = async (req, res) => {
    try {
        const { reservationId } = req.params;
        const { userId, tableNumber, reservationDate, reservationTime, numberOfPeople } = req.body;

        // Verificar que todos los campos estén presentes
        if (!userId || !tableNumber || !reservationDate || !reservationTime || !numberOfPeople) {
            return res.status(400).json({ message: "Faltan campos requeridos" });
        }

        // Validar ID de usuario y número de mesa
        if (!validateId(userId)) {
            return res.status(400).json({ message: "ID de usuario no válido" });
        }
        const table = await findTableByNumber(tableNumber);
        if (!table) {
            return res.status(404).json({ message: `Mesa con número ${tableNumber} no encontrada` });
        }

        // Validar número de personas
        if (!validateNumberOfPeople(numberOfPeople)) {
            return res.status(400).json({ message: "Número de personas debe ser un número entero positivo" });
        }

        // Verificar que el número de personas no exceda la capacidad de la mesa
        if (numberOfPeople > table.capacity) {
            return res.status(400).json({ message: `El número de personas excede la capacidad de la mesa (${table.capacity})` });
        }

        // Verificar existencia de usuario
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: `Usuario con ID ${userId} no encontrado` });
        }

        // Verificar la existencia y estado de la reserva
        const existingReservation = await Reservation.findById(reservationId);
        if (!existingReservation) {
            return res.status(404).json({ message: `Reserva con ID ${reservationId} no encontrada` });
        }

        // Verificar si la reserva está cancelada
        if (existingReservation.status === 'cancelled') {
            return res.status(400).json({ message: "No se puede editar una reserva que ya está cancelada" });
        }

        // Verificar conflictos de reserva, excluyendo la reserva actual
        const conflictingReservation = await findConflictingReservation(table._id, reservationDate, reservationTime, reservationId);
        if (conflictingReservation) {
            return res.status(400).json({ message: "La mesa está ocupada en la fecha y hora seleccionadas" });
        }

        // Actualizar reserva existente
        const updatedReservation = await Reservation.findByIdAndUpdate(
            reservationId,
            {
                user: user._id,
                table: table._id,
                reservationDate,
                reservationTime,
                numberOfPeople
            },
            { new: true }
        );

        if (!updatedReservation) {
            return res.status(404).json({ message: `Reserva con ID ${reservationId} no encontrada` });
        }

        res.json(updatedReservation);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar la reserva: " + error.message });
    }
};



export const cancelReservationById = async (req, res) => {
    try {
        const { reservationId } = req.params;

        // Cambiar el estado de la reserva a 'cancelled'
        const cancelledReservation = await Reservation.findByIdAndUpdate(
            reservationId,
            { status: 'cancelled' },
            { new: true }
        );

        if (!cancelledReservation) {
            return res.status(404).json({ message: `Reserva con ID ${reservationId} no encontrada` });
        }

        res.json({ message: "Reserva cancelada correctamente", cancelledReservation });
    } catch (error) {
        res.status(500).json({ message: "Error al cancelar la reserva: " + error.message });
    }
};

export const deleteReservationById = async (req, res) => {
    try {
        const { reservationId } = req.params;

        // Eliminar la reserva
        const deletedReservation = await Reservation.findByIdAndDelete(reservationId);

        if (!deletedReservation) {
            return res.status(404).json({ message: `Reserva con ID ${reservationId} no encontrada` });
        }

        res.json({ message: "Reserva eliminada correctamente", deletedReservation });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la reserva: " + error.message });
    }
};
