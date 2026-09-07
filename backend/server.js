import 'dotenv/config';
import { connectDB } from './src/config/db.js';
import app from './src/app.js';

const port = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(port, () => console.log(`RC ERP API running on http://localhost:${port}`));
}).catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
