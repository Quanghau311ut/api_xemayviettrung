var express = require('express');
var router = express.Router();
var connection = require('../service/dataconnect');

//getall
router.get('/get-all', function(req, res) {
    var query = 'SELECT * FROM quanlybaiviet';

    connection.query(query, function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            res.json(result);
        }
    });
});



//get-one
router.get('/get-one/:id_bai_viet', function(req, res) {
    var id_bai_viet = req.params.id_bai_viet;
    var query = 'SELECT * FROM quanlybaiviet WHERE id_bai_viet = ?';

    connection.query(query, id_bai_viet, function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            if (result.length === 0) {
                res.status(404).send('Không tìm thấy bài viết');
            } else {
                res.json(result[0]);
            }
        }
    });
});



//add
router.post('/add', function(req, res) {
    console.log("Dữ liệu nhận được:", req.body); // Kiểm tra dữ liệu nhận được từ client

    // Kiểm tra xem các trường cần thiết có được cung cấp không
    if (!req.body.id_danh_muc_tin || !req.body.tieu_de || !req.body.noi_dung || !req.body.anh_dai_dien || !req.body.ngay_dang) {
        return res.status(400).send('Yêu cầu thiếu thông tin');
    }

    var query = "INSERT INTO quanlybaiviet (id_danh_muc_tin, tieu_de, noi_dung, anh_dai_dien, ngay_dang, created_at, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
    var values = [req.body.id_danh_muc_tin, req.body.tieu_de, req.body.noi_dung, req.body.anh_dai_dien, req.body.ngay_dang];

    connection.query(query, values, function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            console.log('Thêm thành công bài viết mới:', result);
            res.json(result);
        }
    });
});


//edit
router.post('/edit/:id_bai_viet', function(req, res) {
    console.log("Dữ liệu nhận được:", req.body); // Kiểm tra dữ liệu nhận được từ client

    // Kiểm tra xem các trường cần thiết có được cung cấp không
    if (!req.body.id_danh_muc_tin || !req.body.tieu_de || !req.body.noi_dung || !req.body.anh_dai_dien || !req.body.ngay_dang) {
        return res.status(400).send('Yêu cầu thiếu thông tin');
    }

    var id_bai_viet = req.params.id_bai_viet;
    var query = "UPDATE quanlybaiviet SET id_danh_muc_tin = ?, tieu_de = ?, noi_dung = ?, anh_dai_dien = ?, ngay_dang = ?, updated_at = CURRENT_TIMESTAMP WHERE id_bai_viet = ?";
    var values = [req.body.id_danh_muc_tin, req.body.tieu_de, req.body.noi_dung, req.body.anh_dai_dien, req.body.ngay_dang, id_bai_viet];

    connection.query(query, values, function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            console.log('Chỉnh sửa thành công bài viết:', result);
            res.json(result);
        }
    });
});



//delete    
router.delete('/delete/:id_bai_viet', function(req, res) {
    var id_bai_viet = req.params.id_bai_viet;
    var query = 'DELETE FROM quanlybaiviet WHERE id_bai_viet = ?';

    connection.query(query, id_bai_viet, function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            console.log('Xóa thành công bài viết:', result);
            res.json(result);
        }
    });
});




//search
router.get('/search', function(req, res) {
    var keyword = req.query.keyword;

    if (!keyword) {
        return res.status(400).send('Yêu cầu thiếu từ khóa tìm kiếm');
    }

    var query = "SELECT * FROM quanlybaiviet WHERE tieu_de LIKE ? OR noi_dung LIKE ?";
    var values = ['%' + keyword + '%', '%' + keyword + '%'];

    connection.query(query, values, function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            console.log('Kết quả tìm kiếm:', result);
            res.json(result);
        }
    });
});






module.exports = router;