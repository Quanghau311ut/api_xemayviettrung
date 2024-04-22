var express = require('express');
var router = express.Router();
var connection = require('../service/dataconnect');

//GetAll
router.get('/getall', function(req, res) {
    var query = 'SELECT * FROM quanlymenu';
    connection.query(query, function(error, result) {
        if (error) res.send('Lổi thao tác csdl');
        res.json(result);
    });
});



//GetdatabyID
router.get('/getdatabyID/:MaMenu', function(req, res) {
    var query = 'SELECT * FROM menu WHERE MaMenu=' + req.params.MaMenu;
    connection.query(query, function(error, result) {
        if (error) res.send('Lỗi thao tác csdl');
        res.json(result);
    });
});

//Edit


router.post('/edit/:MaMenu', function(req, res) {
   var query = "UPDATE menu SET TenMenu=?, MoTa=?, TrangThai=?, updated_at=NOW() WHERE MaMenu=?";
   var values = [req.body.TenMenu, req.body.MoTa, req.body.TrangThai, req.params.MaMenu];
   
   values[2] = values[2] === 'true' || values[2] === true ? true : false;

   connection.query(query, values, function(error, result) {
       if (error) {
           console.error(error);
           res.status(500).send('Lỗi thao tác csdl: ' + error.message);
       } else {
           res.json(result);
       }
   });
});



//Create
router.post('/add', function(req, res) {
    var trangthai = parseInt(req.body.TrangThai);

    var query = "INSERT INTO menu(TenMenu, MoTa,TrangThai) VALUES (?, ?,?)";
    var values = [req.body.TenMenu, req.body.MoTa,trangthai]; 

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
router.delete('/delete/:MaMenu', function(req, res) {
    var query = "DELETE FROM menu WHERE MaMenu = ?";
    var MaMenu = req.params.MaMenu; 

    connection.query(query, [MaMenu], function(error, result) {
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