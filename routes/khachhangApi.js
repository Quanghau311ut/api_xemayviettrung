var express = require('express');
var router = express.Router();
var connection = require('../service/dataconnect');

//getall
router.get('/get-all', function(req, res) {
    var query = 'SELECT * FROM quanlykhachhang';

    connection.query(query, function(error, results) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            res.json(results);
        }
    });
});


//get-one
router.get('/get-one/:id_khach_hang', function(req, res) {
    var id_khach_hang = req.params.id_khach_hang;
    var query = 'SELECT * FROM quanlykhachhang WHERE id_khach_hang = ?';

    connection.query(query, id_khach_hang, function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            if (result.length === 0) {
                res.status(404).send('Không tìm thấy khách hàng');
            } else {
                res.json(result[0]);
            }
        }
    });
});


//add
router.post('/add', function(req, res) {
    console.log("Dữ liệu nhận được:", req.body); // Kiểm tra dữ liệu nhận được từ client

    // Kiểm tra xem tất cả các trường cần thiết đã được cung cấp chưa
    if (!req.body || !req.body.ten_khach_hang || !req.body.so_dien_thoai || !req.body.email || !req.body.dia_chi || !req.body.matkhau) {
        return res.status(400).send('Yêu cầu thiếu thông tin');
    }

    var query = "INSERT INTO quanlykhachhang (ten_khach_hang, so_dien_thoai, email, dia_chi, matkhau, created_at, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
    var values = [req.body.ten_khach_hang, req.body.so_dien_thoai, req.body.email, req.body.dia_chi, req.body.matkhau];

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
router.put('/edit/:id_khach_hang', function(req, res) {
    console.log("Dữ liệu nhận được:", req.body); // Kiểm tra dữ liệu nhận được từ client

    // Kiểm tra xem tất cả các trường cần thiết đã được cung cấp chưa
    if (!req.params.id_khach_hang || !req.body.ten_khach_hang || !req.body.so_dien_thoai || !req.body.email || !req.body.dia_chi || !req.body.matkhau) {
        return res.status(400).send('Yêu cầu thiếu thông tin');
    }

    var query = "UPDATE quanlykhachhang SET ten_khach_hang = ?, so_dien_thoai = ?, email = ?, dia_chi = ?, matkhau = ?, updated_at = CURRENT_TIMESTAMP WHERE id_khach_hang = ?";
    var values = [req.body.ten_khach_hang, req.body.so_dien_thoai, req.body.email, req.body.dia_chi, req.body.matkhau, req.params.id_khach_hang];

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
router.delete('/delete/:id_khach_hang', function(req, res) {
    var id_khach_hang = req.params.id_khach_hang;
    var query = 'DELETE FROM quanlykhachhang WHERE id_khach_hang = ?';

    connection.query(query, id_khach_hang, function(error, result) {
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
router.get('/search', function(req, res) {
    const keyword = req.query.keyword;
    if (!keyword) {
        return res.status(400).send('Yêu cầu thiếu từ khóa tìm kiếm');
    }

    var query = 'SELECT * FROM quanlykhachhang WHERE ten_khach_hang LIKE ? OR so_dien_thoai LIKE ?';
    var values = [`%${keyword}%`, `%${keyword}%`];

    connection.query(query, values, function(error, results) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            res.json(results);
        }
    });
});






module.exports = router;