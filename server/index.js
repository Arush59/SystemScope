const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { simulateSystem } = require('./services/SimulationEngine');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/systemscope')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error. Ignoring for now:', err.message));

const authRoutes = require('./routes/authRoutes');
const designRoutes = require('./routes/designRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/designs', designRoutes);

app.post('/api/simulate', (req, res) => {
  try {
    const { nodes = [], edges = [], rps = 100, duration = 60 } = req.body;
    
    if (!nodes || nodes.length === 0) {
      return res.status(400).json({ error: 'Nodes array is empty.' });
    }
    
    const results = simulateSystem(nodes, edges, rps, duration);
    res.json(results);
  } catch (err) {
    console.error('Simulation Error:', err);
    res.status(500).json({ error: err.message || 'Simulation failed' });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
