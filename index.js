import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import portalServiceRoutes from './routes/routes.js';
import { configCors, requestLogger } from './midlewares/midleware.js';

const app = express();

app.use(express.json());
app.use(cors());
app.use(configCors)
app.use(requestLogger);
app.use(portalServiceRoutes);

const URL_BASE = process.env.URL_BASE || 'http://localhost';
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`servidor listo en ${URL_BASE}:${PORT}`);
});
