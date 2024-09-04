require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5500;
const router = require('./routes');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// example to show how to use branch in github

main().
then(()=>{
    console.log("connection successful");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.DB_URL);
}
const corsOption = {
    credentials:true,
    origin:process.env.REACT_APP_API_URL,
};
app.use(cors(corsOption));
app.use(cookieParser());

app.use(express.json({ limit: '8mb' })); // size of file
app.use(router);

// Middleware to parse JSON bodies
app.use(express.json());

// Define a basic route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});