var express = require('express');
var router = express.Router();
var connection = require('../service/dataconnect');

//GetAll
router.get('/getall', function(req, res) {
    var query = 'SELECT * FROM nhasanxuat';
    connection.query(query, function(error, result) {
        if (error) res.send('Lổi thao tác csdl');
        res.json(result);
    });
});



//GetdatabyID
router.get('/getdatabyID/:MaNhaSanXuat', function(req, res) {
    var query = 'SELECT * FROM nhasanxuat WHERE MaNhaSanXuat=' + req.params.MaNhaSanXuat;
    connection.query(query, function(error, result) {
        if (error) res.send('Lỗi thao tác csdl');
        res.json(result);
    });
});

//Edit
router.post('/edit/:MaNhaSanXuat', function(req, res) {
    if (!req.body || !Array.isArray(req.body) || req.body.length === 0) {
        res.status(400).send('Invalid request body');
        return;
    }

    console.log(req.body);

    var query = "UPDATE nhasanxuat SET TenNhaSanXuat=?,  MoTa=?, updated_at=NOW() WHERE MaNhaSanXuat=?";
    var values = [req.body[0].TenNhaSanXuat, req.body[0].MoTa, req.params.MaNhaSanXuat];
    
    connection.query(query, values, function(error, result) {
        if (error) {
            console.error(error);
            res.status(500).send('Lỗi thao tác csdl: ' + error.message); // Sending the error message to the client
        } else {
            res.json(result);
        }
    });
});


//Create
router.post('/add', function(req, res) {
    var trangthai = parseInt(req.body.TrangThai);

    var query = "INSERT INTO nhasanxuat(TenNhaSanXuat, MoTa) VALUES (?, ?)";
    var values = [req.body.TenNhaSanXuat, req.body.MoTa]; 

    connection.query(query, values, function(error, result) {
        if (error) {
            console.error('Lỗi thao tác csdl:', error);
            res.send('Lỗi thao tác csdl');
        } else {
            console.log('Dữ liệu đã được thêm:', result);
            res.json(result);
        }
    });
});

//Delete
router.delete('/delete/:MaNhaSanXuat', function(req, res) {
    var query = "DELETE FROM nhasanxuat WHERE MaNhaSanXuat = ?";
    var MaNhaSanXuat = req.params.MaNhaSanXuat; // Capture the parameter

    connection.query(query, [MaNhaSanXuat], function(error, result) {
        if (error) {
            console.error('Error executing query:', error);
            return res.status(500).send('Lỗi thao tác csdl');
        }
        
        res.json(result);
    });
});

//Search
router.get('/search', function(req, res) {
    const keyword = req.query.keyword;

    if (!keyword) {
        return res.status(400).json({ error: 'Missing keyword parameter' });
    }
    const query = `SELECT * FROM nhasanxuat WHERE TenNhaSanXuat LIKE ?; `;

    connection.query(query, [`%${keyword}%`], function(error, results) {
        if (error) {
            console.error('Error executing query', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        console.log(results);

        res.json(results);
    });
});



module.exports = router;