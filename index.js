import * as dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import express from 'express';
import portalServiceRoutes from './routes/routes.js';
import { reportarConsulta } from './midlewares/midleware.js';

const app = express();

app.use(express.json());
app.use(cors());
app.use(reportarConsulta);
app.use(portalServiceRoutes);

const PORT = process.env.PORT || 3000;
const URL_BASE = process.env.URL_BASE || 'http://localhost:3000';

app.listen(PORT, () => {
  console.log('servidor listo en', URL_BASE);
});
