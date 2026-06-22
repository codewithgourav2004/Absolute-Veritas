const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
  happyClients: { type: Number, default: 500 },
  projectsCompleted: { type: Number, default: 1200 },
  yearsOfJourney: { type: Number, default: 15 },
  brandsServed: { type: Number, default: 200 },
}, { timestamps: true });

module.exports = mongoose.model('Stats', statsSchema);
