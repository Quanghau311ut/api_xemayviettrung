var express = require('express');
var router = express.Router();
var connection = require('../service/dataconnect');

//getall
router.get('/get-all', function(req, res) {
    var query = 'SELECT * FROM anhchitiet';

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

router.get('/get-one/:id_anh_chi_tiet', function(req, res) {
    var id_anh_chi_tiet = req.params.id_anh_chi_tiet;
    var query = 'SELECT * FROM anhchitiet WHERE id_anh_chi_tiet = ?';

    connection.query(query, id_anh_chi_tiet, function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            if (result.length === 0) {
                res.status(404).send('Không tìm thấy hình ảnh chi tiết');
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
    if (!req.body || !req.body.id_xe || !req.body.duong_dan_anh) {
        return res.status(400).send('Yêu cầu thiếu thông tin');
    }

    var query = "INSERT INTO anhchitiet (id_xe, duong_dan_anh, created_at, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
    var values = [req.body.id_xe, req.body.duong_dan_anh];

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
router.post('/edit/:id_anh_chi_tiet', function(req, res) {
    console.log("Dữ liệu nhận được:", req.body); // Kiểm tra dữ liệu nhận được từ client

    // Kiểm tra xem các trường thông tin cần thiết đã được cung cấp chưa
    if (!req.body || !req.body.id_xe || !req.body.duong_dan_anh) {
        return res.status(400).send('Yêu cầu thiếu thông tin');
    }

    var id_anh_chi_tiet = req.params.id_anh_chi_tiet;
    var query = "UPDATE anhchitiet SET id_xe = ?, duong_dan_anh = ?, updated_at = CURRENT_TIMESTAMP WHERE id_anh_chi_tiet = ?";
    var values = [req.body.id_xe, req.body.duong_dan_anh, id_anh_chi_tiet];

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
router.delete('/delete/:id_anh_chi_tiet', function(req, res) {
    var id_anh_chi_tiet = req.params.id_anh_chi_tiet;
    var query = 'DELETE FROM anhchitiet WHERE id_anh_chi_tiet = ?';

    connection.query(query, id_anh_chi_tiet, function(error, result) {
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
    var query = 'SELECT * FROM anhchitiet WHERE duong_dan_anh LIKE ?';

    // Thêm ký tự đại diện '%' vào từ khóa để tìm kiếm các bản ghi có đường dẫn ảnh chứa từ khóa
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