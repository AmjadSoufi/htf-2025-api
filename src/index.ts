import express from 'express';
import {getAllDivingCenters} from './services/divingCenterService';

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

const server = app.listen(3000, () =>
    console.log("🚀 Server ready at: http://localhost:3000")
)