import express from 'express';
var app = express();

app.use('/test',express.static('./tep'));
app.listen(80);