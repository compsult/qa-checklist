const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    checkboxes: {},
    notes: {},
    metadata: {
      testDate: '',
      tester: '',
      environment: '',
      browsers: ''
    },
    lastUpdated: new Date().toISOString(),
    lastUpdatedBy: ''
  }, null, 2));
}

// Get all data
app.get('/api/data', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// Update data
app.post('/api/data', (req, res) => {
  try {
    const { checkboxes, notes, metadata, updatedBy } = req.body;
    const currentData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

    const newData = {
      checkboxes: { ...currentData.checkboxes, ...checkboxes },
      notes: { ...currentData.notes, ...notes },
      metadata: { ...currentData.metadata, ...metadata },
      lastUpdated: new Date().toISOString(),
      lastUpdatedBy: updatedBy || 'Anonymous'
    };

    fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2));
    res.json({ success: true, data: newData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Reset all data
app.post('/api/reset', (req, res) => {
  try {
    const emptyData = {
      checkboxes: {},
      notes: {},
      metadata: {
        testDate: '',
        tester: '',
        environment: '',
        browsers: ''
      },
      lastUpdated: new Date().toISOString(),
      lastUpdatedBy: req.body.updatedBy || 'Anonymous'
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(emptyData, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset data' });
  }
});

// Export as CSV
app.get('/api/export', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export data' });
  }
});

app.listen(PORT, () => {
  console.log(`QA Checklist server running on port ${PORT}`);
});
