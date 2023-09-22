const dotenv = require("dotenv");  //require dotenv package
dotenv.config({ path: "./config.env" }); //import config.env file
const quizRoutes = require('./routes/quizRoutes');
const database = process.env.DATABASE_URL;
const Port = process.env.PORT;


const express = require('express');
const mongoose = require('mongoose');

mongoose
    .connect(database, {
        usenewurlparser: true,
        useunifiedtopology: true,
    })
    .then(() => {
        console.log("Successfully connected ");
    })
    .catch((error) => {
        console.log(`can not connect to database, ${error}`);
    });

app = express();
app.use(express.json());


app.use('/api/v1/quiz', quizRoutes);




app.listen(Port, () => {
    console.log(`Server Started at ${3000}`)
})