var express = require('express');
var router = express.Router();
var connection = require('../service/dataconnect');

//GetAll
router.get('/get-all', function(req, res) {
    var query = 'SELECT * FROM quanlythuonghieu';
    connection.query(query, function(error, result) {
        if (error) res.send('Lổi thao tác csdl');
        res.json(result);
    });
});

//get-one
router.get('/get-one/:id_thuong_hieu', function(req, res) {
    var id_thuong_hieu = req.params.id_thuong_hieu;
    var query = 'SELECT * FROM quanlythuonghieu WHERE id_thuong_hieu = ?';

    connection.query(query, id_thuong_hieu, function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            res.json(result);
        }
    });
});


//add
router.post('/add', function(req, res) {
    console.log("Dữ liệu nhận được:", req.body); // Kiểm tra dữ liệu nhận được từ client

    // Kiểm tra xem các trường cần thiết có tồn tại không
    if (!req.body || !req.body.ten_thuong_hieu) {
        return res.status(400).send('Yêu cầu thiếu thông tin');
    }

    var query = "INSERT INTO quanlythuonghieu (ten_thuong_hieu, created_at, updated_at) VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
    var values = [req.body.ten_thuong_hieu];

    connection.query(query, values, function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            console.log('Thêm thành công bản ghi:', result);
            res.json(result);
        }
    });
});





//edit
router.post('/edit/:id_thuong_hieu', function(req, res) {
    console.log("Dữ liệu nhận được:", req.body); // Kiểm tra dữ liệu nhận được từ client

    // Kiểm tra xem các trường id_danh_muc và ten_danh_muc có tồn tại không
    if (!req.body || !req.body.ten_thuong_hieu) {
        return res.status(400).send('Yêu cầu thiếu thông tin');
    }

    var id_thuong_hieu = req.params.id_thuong_hieu;
    var query = "UPDATE quanlythuonghieu SET ten_thuong_hieu = ?, updated_at = CURRENT_TIMESTAMP WHERE id_thuong_hieu = ?";
    var values = [req.body.ten_thuong_hieu, id_thuong_hieu]; // Fixed typo here

    connection.query(query, values, function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            console.log('Sửa thành công bản ghi:', result);
            res.json(result);
        }
    });
});





//delete
router.delete('/delete/:id_thuong_hieu', function(req, res) {
    var id_thuong_hieu = req.params.id_thuong_hieu;
    var query = "DELETE FROM quanlythuonghieu WHERE id_thuong_hieu = ?";

    connection.query(query, id_thuong_hieu, function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            console.log('Xóa thành công bản ghi:', result);
            res.json(result);
        }
    });
});






// Search
router.get('/search', function(req, res) {
    var keyword = req.query.keyword; // Lấy từ khóa tìm kiếm từ query string

    if (!keyword) {
        return res.status(400).send('Yêu cầu thiếu từ khóa tìm kiếm');
    }

    var query = "SELECT * FROM quanlythuonghieu WHERE ten_thuong_hieu LIKE ?";
    var searchValue = '%' + keyword + '%'; // Thêm ký tự % để tìm kiếm tất cả các từ có từ khóa

    connection.query(query, searchValue, function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            res.json(result);
        }
    });
});







module.exports = router;