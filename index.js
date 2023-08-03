const express = require('express');
const path = require('path');

const indexRoutes = require('./routes/index');


process.on('uncaughtException', (err) => { console.error('Unhandled Exception:', err); });

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/a', indexRoutes);
app.use('/', indexRoutes);

const port = 5005;
app.listen(port, () => { console.log(`Servidor rodando na porta ${port}`); });