import Table from "../models/Tables.js";

// Encuentra la mesa más cercana a la capacidad requerida
export const findBestTableForReservation = async (req, res) => {
    try {
        const { numberOfPeople } = req.body;

        // Verificar que numberOfPeople sea un número positivo
        if (typeof numberOfPeople !== 'number' || numberOfPeople <= 0) {
            return res.status(400).json({ message: "Número de personas inválido" });
        }

        // Busca todas las mesas
        const tables = await Table.find();

        // Encuentra la mesa con la capacidad más cercana y, en caso de empate, con el número más bajo
        let bestTable = null;
        let minDifference = Infinity;

        for (const table of tables) {
            const difference = table.capacity - numberOfPeople;
            if (difference >= 0 && difference < minDifference) {
                minDifference = difference;
                bestTable = table;
            } else if (difference === minDifference && table.number < bestTable.number) {
                bestTable = table;
            }
        }

        if (!bestTable) {
            return res.status(404).json({ message: "No se encontró una mesa adecuada" });
        }

        res.json(bestTable);
    } catch (error) {
        res.status(500).json({ message: "Error al encontrar la mesa: " + error.message });
    }
};

export const getTables = async (req, res) => {
    try {
        const tables = await Table.find();
        res.json(tables);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las mesas: " + error.message });
    }
};

export const addTable = async (req, res) => {
    try {
        const { number, capacity } = req.body;

        if (number === undefined || capacity === undefined) {
            return res.status(400).json({ message: "Faltan campos requeridos" });
        }

        // Verificar que number y capacity sean números
        if (typeof number !== 'number' || typeof capacity !== 'number') {
            return res.status(400).json({ message: "Número y capacidad deben ser valores numéricos" });
        }

        // Verificar que capacity sea un número positivo
        if (capacity <= 0) {
            return res.status(400).json({ message: "La capacidad debe ser un número positivo" });
        }

        // Verificar que el número de mesa sea único
        const existingTable = await Table.findOne({ number });
        if (existingTable) {
            return res.status(400).json({ message: "Ya existe una mesa con el número proporcionado" });
        }

        // Crear una nueva mesa
        const newTable = new Table({ number, capacity });

        // Guardar la mesa en la base de datos
        const tableSave = await newTable.save();
        res.status(201).json(tableSave);
    } catch (error) {
        res.status(500).json({ message: "Error al agregar la mesa: " + error.message });
    }
};

export const getTableById = async (req, res) => {
    try {
        const { tableId } = req.params;
        const table = await Table.findById(tableId);
        if (!table) {
            return res.status(404).json({ message: `Mesa con ID ${tableId} no encontrada` });
        }
        res.json(table);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la mesa: " + error.message });
    }
};

export const updateTableById = async (req, res) => {
    try {
        const { tableId } = req.params;
        const { number, capacity } = req.body;

        if (number === undefined || capacity === undefined) {
            return res.status(400).json({ message: "Faltan campos requeridos" });
        }

        // Verificar que number y capacity sean números
        if (typeof number !== 'number' || typeof capacity !== 'number') {
            return res.status(400).json({ message: "Número y capacidad deben ser valores numéricos" });
        }

        // Verificar que capacity sea un número positivo
        if (capacity <= 0) {
            return res.status(400).json({ message: "La capacidad debe ser un número positivo" });
        }

        // Verificar que el número de mesa no se repita
        const existingTable = await Table.findOne({ number });
        if (existingTable && existingTable._id.toString() !== tableId) {
            return res.status(400).json({ message: "El número de mesa ya está en uso" });
        }

        // Actualizar la mesa en la base de datos
        const updatedTable = await Table.findByIdAndUpdate(
            tableId,
            { number, capacity },
            { new: true }
        );

        if (!updatedTable) {
            return res.status(404).json({ message: `Mesa con ID ${tableId} no encontrada` });
        }

        res.json(updatedTable);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar la mesa: " + error.message });
    }
};


export const deleteTableById = async (req, res) => {
    try {
        const { tableId } = req.params;
        const deletedTable = await Table.findByIdAndDelete(tableId);
        if (!deletedTable) {
            return res.status(404).json({ message: `Mesa con ID ${tableId} no encontrada` });
        }
        res.json({ message: "Mesa eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la mesa: " + error.message });
    }
};
