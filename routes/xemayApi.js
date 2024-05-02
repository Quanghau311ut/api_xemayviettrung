var express = require('express');
var router = express.Router();
var connection = require('../service/dataconnect');

//getall
router.get('/get-all', function(req, res) {
    var query = 'SELECT * FROM quanlyxemay';

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
router.get('/get-one/:id_xe', function(req, res) {
    var id_xe = req.params.id_xe;
    var query = 'SELECT * FROM quanlyxemay WHERE id_xe = ?';

    connection.query(query, id_xe, function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            if (result.length === 0) {
                res.status(404).send('Không tìm thấy xe máy');
            } else {
                res.json(result[0]);
            }
        }
    });
});



//add
router.post('/add', function(req, res) {
    console.log("Dữ liệu nhận được:", req.body); // Kiểm tra dữ liệu nhận được từ client

    // Kiểm tra xem các trường thông tin cần thiết đã được cung cấp chưa
    if (!req.body || !req.body.id_thuong_hieu || !req.body.id_danh_muc || !req.body.ten_xe || !req.body.model || !req.body.mau_sac || !req.body.nam_san_xuat || !req.body.gia || !req.body.so_luong) {
        return res.status(400).send('Yêu cầu thiếu thông tin');
    }

    var query = "INSERT INTO quanlyxemay (id_thuong_hieu, id_danh_muc, ten_xe, model, mau_sac, nam_san_xuat, gia, so_luong, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
    var values = [req.body.id_thuong_hieu, req.body.id_danh_muc, req.body.ten_xe, req.body.model, req.body.mau_sac, req.body.nam_san_xuat, req.body.gia, req.body.so_luong];

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
router.post('/edit/:id_xe', function(req, res) {
    console.log("Dữ liệu nhận được:", req.body); // Kiểm tra dữ liệu nhận được từ client

    // Kiểm tra xem các trường thông tin cần thiết đã được cung cấp chưa
    if (!req.body || !req.body.id_thuong_hieu || !req.body.id_danh_muc || !req.body.ten_xe || !req.body.model || !req.body.mau_sac || !req.body.nam_san_xuat || !req.body.gia || !req.body.so_luong) {
        return res.status(400).send('Yêu cầu thiếu thông tin');
    }

    var id_xe = req.params.id_xe;
    var query = "UPDATE quanlyxemay SET id_thuong_hieu = ?, id_danh_muc = ?, ten_xe = ?, model = ?, mau_sac = ?, nam_san_xuat = ?, gia = ?, so_luong = ?, updated_at = CURRENT_TIMESTAMP WHERE id_xe = ?";
    var values = [req.body.id_thuong_hieu, req.body.id_danh_muc, req.body.ten_xe, req.body.model, req.body.mau_sac, req.body.nam_san_xuat, req.body.gia, req.body.so_luong, id_xe];

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
router.delete('/delete/:id_xe', function(req, res) {
    var id_xe = req.params.id_xe;
    var query = 'DELETE FROM quanlyxemay WHERE id_xe = ?';

    connection.query(query, id_xe, function(error, result) {
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
    var keyword = req.query.keyword;
    var query = 'SELECT * FROM quanlyxemay WHERE ten_xe LIKE ? OR model LIKE ? OR mau_sac LIKE ?';

    // Thêm ký tự đại diện '%' vào từ khóa để tìm kiếm các bản ghi có tên chứa từ khóa
    var keywordWithWildcard = '%' + keyword + '%';

    connection.query(query, [keywordWithWildcard, keywordWithWildcard, keywordWithWildcard], function(error, results) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            res.json(results);
        }
    });
});






module.exports = router;