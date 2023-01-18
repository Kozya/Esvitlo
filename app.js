const express = require('express');
const app = express();
const path = require('path');
const PORT = 3000;
const mongoose = require('mongoose');
const db = 'mongodb+srv://esvitlo:fN6SutYDRmqc41pL@cluster0.oxihjaf.mongodb.net/esvitlo?retryWrites=true&w=majority';
const Marker = require('./models/marker')


mongoose.set("strictQuery", false);
mongoose
    .connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(res => {
        console.log('connect to db')
    })
    .catch(error => {
        console.log(error);
    });

app.set('view-engine', 'ejs');

const createPath = (page) => path.resolve(__dirname, 'ejs-views', `${page}.ejs`);

app.use('/public', express.static('public'));
app.use(express.json());

app.listen(PORT, (error) => {
    error ? console.log(error) : console.log(`listening port ${PORT}`);
})


app.get('/', (req, res) => {
    res.render(createPath('index'))
})
app.get('/agreement', (req, res) => {
    res.render(createPath('agreement'))
})
app.get('/confidentiality', (req, res) => {
    res.render(createPath('confidentiality'))
})
app.post('/add-marker', (req, res) => {
    const { anyLight, lat, lng, date } = req.body;
    const marker = new Marker({ anyLight, lat, lng, date });

    marker
        .save()
        .then((result) => {
            res.send(result);
        })
        .catch((error) => {
            console.log(error);
        })
});
app.get('/get-all-markers', (req, res) => {
    Marker
        .find()
        .then((result) => {
            res.send(result);
        })
        .catch((error) => {
            console.log(error);
        })
});
app.put('/change-marker-status/:id', (req, res) => {

    const { anyLight, lat, lng, date } = req.body;
    const { id } = req.params;
    Marker
        .findByIdAndUpdate(id, { anyLight, lat, lng, date })
        .then((result) => {
            res.send(result);
        })
        .catch((error) => {
            console.log(error);
        })
})


app.use((req, res) => {
    res
        .status(404)
        .render(createPath('error'));
})