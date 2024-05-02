var express = require('express');
var route = express();
var path = require('path');
var duongdan = path.join(__dirname, '../public');

route.post('/', (req, res) => { // Thay đổi đường dẫn API thành '/upload'
    var filepath;
    var fileupload;
    
    if (!req.files) res.status(400).send('Bạn chưa chọn file để tải lên');
    fileupload = req.files.fileanh;
    filepath = duongdan + "/uploads/" + fileupload.name;
    url = "/public/uploads/" + fileupload.name;
    console.log(filepath);
    fileupload.mv(filepath, function(error) {
        if (error) res.status(500).send('Lỗi tải file lên server');
        res.status(200).send({ url: url });
    });
});

module.exports = route;
