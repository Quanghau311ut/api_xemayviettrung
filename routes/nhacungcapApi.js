var express = require('express');
var router = express.Router();
var connection = require('../service/dataconnect');

//getall
router.get('/get-all', function(req, res) {
    var query = 'SELECT * FROM quanlynhacungcap';

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
router.get('/get-one/:id_nha_cung_cap', function(req, res) {
    var id_nha_cung_cap = req.params.id_nha_cung_cap;
    var query = 'SELECT * FROM quanlynhacungcap WHERE id_nha_cung_cap = ?';

    connection.query(query, id_nha_cung_cap, function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            if (result.length === 0) {
                res.status(404).send('Không tìm thấy nhà cung cấp');
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
    if (!req.body || !req.body.ten_nha_cung_cap || !req.body.so_dien_thoai || !req.body.email || !req.body.dia_chi) {
        return res.status(400).send('Yêu cầu thiếu thông tin');
    }

    var query = "INSERT INTO quanlynhacungcap (ten_nha_cung_cap, so_dien_thoai, email, dia_chi, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
    var values = [req.body.ten_nha_cung_cap, req.body.so_dien_thoai, req.body.email, req.body.dia_chi];

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
router.post('/edit/:id_nha_cung_cap', function(req, res) {
    console.log("Dữ liệu nhận được:", req.body); // Kiểm tra dữ liệu nhận được từ client

    // Kiểm tra xem tất cả các trường cần thiết đã được cung cấp chưa
    if (!req.params.id_nha_cung_cap || !req.body.ten_nha_cung_cap || !req.body.so_dien_thoai || !req.body.email || !req.body.dia_chi) {
        return res.status(400).send('Yêu cầu thiếu thông tin');
    }

    var query = "UPDATE quanlynhacungcap SET ten_nha_cung_cap = ?, so_dien_thoai = ?, email = ?, dia_chi = ?, updated_at = CURRENT_TIMESTAMP WHERE id_nha_cung_cap = ?";
    var values = [req.body.ten_nha_cung_cap, req.body.so_dien_thoai, req.body.email, req.body.dia_chi, req.params.id_nha_cung_cap];

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
router.delete('/delete/:id_nha_cung_cap', function(req, res) {
    var id_nha_cung_cap = req.params.id_nha_cung_cap;
    var query = 'DELETE FROM quanlynhacungcap WHERE id_nha_cung_cap = ?';

    connection.query(query, id_nha_cung_cap, function(error, result) {
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
    var query = 'SELECT * FROM quanlynhacungcap WHERE ten_nha_cung_cap LIKE ?';

    // Thêm ký tự đại diện '%' vào từ khóa để tìm kiếm các bản ghi có tên chứa từ khóa
    var keywordWithWildcard = '%' + keyword + '%';

    connection.query(query, keywordWithWildcard, function(error, results) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            res.json(results);
        }
    });
});







module.exports = router;