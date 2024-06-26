import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import { query } from './db.js'; // Import the query function from db.js
import cors from 'cors';
import env from "dotenv";
import memorystore from 'memorystore';
const MemoryStore = memorystore(session);

const router = express.Router();

const app = express();

env.config();

app.use(cors());
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET, // Replace with your secret key
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 86400000 },
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
}));

// Route to handle saving data to database
router.post('/saveData', async (req, res) => {
  try {
    const { formData,userId } = req.body;
    //const userId = req.session.userId; // Assuming user_id is already stored in the session

    // Insert form data into business_common table
    const insertQuery = {
      text: `INSERT INTO business_common (user_id, electricity_usage, water_usage, paper_consumption, waste_generation, fuel_consumption, business_travel) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      values: [
        userId,
        formData.electricityUsage,
        formData.waterUsage,
        formData.paperConsumption,
        formData.wasteGeneration,
        formData.fuelConsumption,
        formData.businessTravel
      ],
    };

    await query(insertQuery.text, insertQuery.values); // Use the query function

    res.status(200).send('Data saved successfully');
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).send('Error saving data');
  }
});

export default router;
