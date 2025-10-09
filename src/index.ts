import express from 'express';
import {getAllDivingCenters} from './services/divingCenterService';
import {getAllFish, getFishById} from './services/fishService';

const app = express();

app.use(express.json());

app.get('/api/diving-centers', async (req, res) => {
    try {
        const divingCenters = await getAllDivingCenters();
        res.json(divingCenters);
    } catch (error) {
        console.error('Error fetching diving centers:', error);
        res.status(500).json({error: 'Failed to fetch diving centers'});
    }
});

app.get('/api/fish', async (req, res) => {
    try {
        const fish = await getAllFish();
        res.json(fish);
    } catch (error) {
        console.error('Error fetching fish:', error);
        res.status(500).json({error: 'Failed to fetch fish'});
    }
});

app.get('/api/fish/:id', async (req, res) => {
    try {
        const fish = await getFishById(req.params.id);
        if (!fish) {
            res.status(404).json({error: 'Fish not found'});
            return;
        }
        res.json(fish);
    } catch (error) {
        console.error('Error fetching fish by id:', error);
        res.status(500).json({error: 'Failed to fetch fish'});
    }
});

const server = app.listen(3000, () =>
    console.log("🚀 Server ready at: http://localhost:3000")
)