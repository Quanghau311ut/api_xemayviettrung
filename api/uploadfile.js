var express = require('express');
var route = express();
var path = require('path');
var duongdan = path.join(__dirname, '../public');

route.post('/', (req, res) => {
    var filepath;
    var fileupload;
    if (!req.files) res.status(400).send('ban chua chon file gui');
    fileupload = req.files.fileanh;
    filepath = duongdan + "/uploads/" + fileupload.name;
    url = "/public/uploads/" + fileupload.name;
    console.log(filepath);
    fileupload.mv(filepath, function(error) {
        if (error) res.status(500).send('Loi upload file len server');
        res.status(200).send({ url: url });
    });
});

module.exports = route;