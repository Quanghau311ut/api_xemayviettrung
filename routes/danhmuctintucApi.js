var express = require('express');
var router = express.Router();
var connection = require('../service/dataconnect');

//getall
router.get('/get-all', function(req, res) {
    var query = 'SELECT * FROM quanlydanhmuctin';

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
router.get('/get-one/:id_danh_muc_tin', function(req, res) {
    var id_danh_muc_tin = req.params.id_danh_muc_tin;
    var query = 'SELECT * FROM quanlydanhmuctin WHERE id_danh_muc_tin = ?';

    connection.query(query, id_danh_muc_tin, function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            if (result.length === 0) {
                res.status(404).send('Không tìm thấy danh mục tin');
            } else {
                res.json(result[0]);
            }
        }
    });
});



//add
router.post('/add', function(req, res) {
    console.log("Dữ liệu nhận được:", req.body); // Kiểm tra dữ liệu nhận được từ client

    // Kiểm tra xem tên danh mục tin đã được cung cấp chưa
    if (!req.body || !req.body.ten_danh_muc_tin) {
        return res.status(400).send('Yêu cầu thiếu thông tin');
    }

    var query = "INSERT INTO quanlydanhmuctin (ten_danh_muc_tin, created_at, updated_at) VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
    var values = [req.body.ten_danh_muc_tin];

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
router.put('/edit/:id_danh_muc_tin', function(req, res) {
    console.log("Dữ liệu nhận được:", req.body); // Kiểm tra dữ liệu nhận được từ client

    // Kiểm tra xem tên danh mục tin đã được cung cấp chưa
    if (!req.body || !req.body.ten_danh_muc_tin) {
        return res.status(400).send('Yêu cầu thiếu thông tin');
    }

    var id_danh_muc_tin = req.params.id_danh_muc_tin;
    var query = "UPDATE quanlydanhmuctin SET ten_danh_muc_tin = ?, updated_at = CURRENT_TIMESTAMP WHERE id_danh_muc_tin = ?";
    var values = [req.body.ten_danh_muc_tin, id_danh_muc_tin];

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
router.delete('/delete/:id_danh_muc_tin', function(req, res) {
    var id_danh_muc_tin = req.params.id_danh_muc_tin;
    var query = 'DELETE FROM quanlydanhmuctin WHERE id_danh_muc_tin = ?';

    connection.query(query, id_danh_muc_tin, function(error, result) {
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
    var query = 'SELECT * FROM quanlydanhmuctin WHERE ten_danh_muc_tin LIKE ?';

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