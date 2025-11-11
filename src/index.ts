import express from "express";
import cors from "cors";
import { getAllDivingCenters } from "./services/divingCenterService";
import { getAllFish, getFishById } from "./services/fishService";
import { getAllTemperatureReadings } from "./services/temperatureReadingService";
import {
  startFishSightingUpdates,
  startTemperatureSensorUpdates,
} from "./services/scheduledJobService";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/diving-centers", async (req, res) => {
  try {
    const divingCenters = await getAllDivingCenters();
    res.json(divingCenters);
  } catch (error) {
    console.error("Error fetching diving centers:", error);
    res.status(500).json({ error: "Failed to fetch diving centers" });
  }
});

app.get("/api/fish", async (req, res) => {
  try {
    const fish = await getAllFish();
    res.json(fish);
  } catch (error) {
    console.error("Error fetching fish:", error);
    res.status(500).json({ error: "Failed to fetch fish" });
  }
});

app.get("/api/fish/:id", async (req, res) => {
  try {
    const fish = await getFishById(req.params.id);
    if (!fish) {
      res.status(404).json({ error: "Fish not found" });
      return;
    }
    res.json(fish);
  } catch (error) {
    console.error("Error fetching fish by id:", error);
    res.status(500).json({ error: "Failed to fetch fish" });
  }
});

app.get("/api/temperatures", async (req, res) => {
  try {
    const temperatures = await getAllTemperatureReadings();
    res.json(temperatures);
  } catch (error) {
    console.error("Error fetching temperatures:", error);
    res.status(500).json({ error: "Failed to fetch temperatures" });
  }
});

const server = app.listen(5555, () => {
  console.log("🤿 FishyDex available at http://localhost:5555");
  startFishSightingUpdates();
  startTemperatureSensorUpdates();
});
