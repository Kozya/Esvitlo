const express = require('express');
const app = express();
const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = 3000;

app.set('view-engine', 'ejs');

const createPath = (page) => path.resolve(__dirname, 'ejs-views', `${page}.ejs`);

app.use('/public', express.static('public'));

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
app.use((req, res) => {
    res
        .status(404)
        .render(createPath('error'));
})
