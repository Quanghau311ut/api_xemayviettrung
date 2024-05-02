var express = require('express');
var router = express.Router();
var connection = require('../service/dataconnect');

//GetAll
router.get('/get-all', function(req, res) {
    var query = 'SELECT * FROM quanlymenu';
    connection.query(query, function(error, result) {
        if (error) res.send('Lổi thao tác csdl');
        res.json(result);
    });
});

//get-one
router.get('/get-one/:id_menu', function(req, res) {
    var id_menu = req.params.id_menu;
    var query = 'SELECT * FROM quanlymenu WHERE id_menu = ?';

    connection.query(query, id_menu, function(error, result) {
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

    // Kiểm tra xem các trường ten_menu và link có tồn tại không
    if (!req.body || !req.body.ten_menu || !req.body.link) {
        return res.status(400).send('Yêu cầu thiếu thông tin');
    }

    var query = "INSERT INTO qlcuahangxemayviettrung.quanlymenu (ten_menu, link, created_at, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
    var values = [req.body.ten_menu, req.body.link];

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
router.post('/edit/:id_menu', function(req, res) {
    console.log("Dữ liệu nhận được:", req.body); // Kiểm tra dữ liệu nhận được từ client

    // Kiểm tra xem các trường ten_menu và link có tồn tại không
    if (!req.body || !req.body.ten_menu || !req.body.link) {
        return res.status(400).send('Yêu cầu thiếu thông tin');
    }

    var id_menu = req.params.id_menu;
    var query = "UPDATE quanlymenu SET ten_menu = ?, link = ?, updated_at = CURRENT_TIMESTAMP WHERE id_menu = ?";
    var values = [req.body.ten_menu, req.body.link, id_menu];

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
router.delete('/delete/:id_menu', function(req, res) {
    var id_menu = req.params.id_menu;
    var query = 'DELETE FROM quanlymenu WHERE id_menu = ?';

    connection.query(query, id_menu, function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            console.log('Xóa thành công bản ghi:', result);
            res.json(result);
        }
    });
});




//search
// Search
router.get('/search', function(req, res) {
    var searchKeyword = req.query.keyword; // Lấy từ khóa tìm kiếm từ query string
    
    if (!searchKeyword) {
        return res.status(400).send('Yêu cầu thiếu thông tin từ khóa tìm kiếm');
    }

    var query = "SELECT * FROM quanlymenu WHERE ten_menu LIKE ?";
    var searchValue = '%' + searchKeyword + '%'; // Thêm ký tự % để tìm kiếm tất cả các từ có từ khóa

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