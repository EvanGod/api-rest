import app from '../app.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI no está definido en las variables de entorno');
  process.exit(1); 
}

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Conectado a la base de datos'))
  .catch((error) => {
    console.error('Error al conectar a la base de datos:', error);
    process.exit(1); 
  });


const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
