const express = require('express');
const mongoose = require('mongoose');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/reviewservice', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use('/api/reviews', reviewRoutes);

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Review service running on port ${PORT}`);
});
