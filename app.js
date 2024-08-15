import express from 'express';
import tablesRoutes from './src/routes/tables.routes.js';
import authRoutes from './src/routes/auth.routes.js';
import reservationRoutes from './src/routes/reservation.routes.js';
import { createRoles } from './src/libs/initialSetup.js';

const app = express();

createRoles();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Bienvenido a mi API');
});

app.use('/api/tables', tablesRoutes);
app.use('/api/reservation', reservationRoutes);
app.use('/api/auth', authRoutes);

app.use((req, res, next) => {
    res.status(404).send('Ruta no encontrada');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal');
});

export default app;
