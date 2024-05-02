var express = require('express');
var router = express.Router();
var connection = require('../service/dataconnect');

//GetAll
router.get('/get-all', function(req, res) {
    var query = 'SELECT * FROM quanlyslide';
    connection.query(query, function(error, result) {
        if (error) res.send('Lổi thao tác csdl');
        res.json(result);
    });
});

//get-one
router.get('/get-one/:id_slide', function(req, res) {
    var id_slide = req.params.id_slide;
    var query = 'SELECT * FROM quanlyslide WHERE id_slide = ?';

    connection.query(query, id_slide, function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            if (result.length === 0) {
                res.status(404).send('Không tìm thấy slide');
            } else {
                res.json(result[0]);
            }
        }
    });
});



//add
router.post('/add', function(req, res) {
    console.log("Dữ liệu nhận được:", req.body); // Kiểm tra dữ liệu nhận được từ client

    // Kiểm tra xem các trường cần thiết có tồn tại không
    if (!req.body || !req.body.tieu_de || !req.body.mo_ta || !req.body.hinh_anh || !req.body.link || !req.body.thu_tu || req.body.trang_thai === undefined) {
        return res.status(400).send('Yêu cầu thiếu thông tin');
    }

    var query = "INSERT INTO quanlyslide (tieu_de, mo_ta, hinh_anh, link, thu_tu, trang_thai, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
    var values = [req.body.tieu_de, req.body.mo_ta, req.body.hinh_anh, req.body.link, req.body.thu_tu, req.body.trang_thai];

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
router.post('/edit/:id_slide', function(req, res) {
    console.log("Dữ liệu nhận được:", req.body); // Kiểm tra dữ liệu nhận được từ client

    // Kiểm tra xem các trường cần thiết có tồn tại không
    if (!req.params.id_slide || !req.body.tieu_de || !req.body.mo_ta || !req.body.hinh_anh || !req.body.link || !req.body.thu_tu || req.body.trang_thai === undefined) {
        return res.status(400).send('Yêu cầu thiếu thông tin');
    }

    var query = "UPDATE quanlyslide SET tieu_de = ?, mo_ta = ?, hinh_anh = ?, link = ?, thu_tu = ?, trang_thai = ?, updated_at = CURRENT_TIMESTAMP WHERE id_slide = ?";
    var values = [req.body.tieu_de, req.body.mo_ta, req.body.hinh_anh, req.body.link, req.body.thu_tu, req.body.trang_thai, req.params.id_slide];

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
router.delete('/delete/:id_slide', function(req, res) {
    var id_slide = req.params.id_slide;
    var query = "DELETE FROM quanlyslide WHERE id_slide = ?";

    connection.query(query, id_slide, function(error, result) {
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
    const keyword = req.query.keyword;
    if (!keyword) {
        return res.status(400).send('Yêu cầu thiếu từ khóa tìm kiếm');
    }

    var query = 'SELECT * FROM quanlyslide WHERE tieu_de LIKE ? OR mo_ta LIKE ?';
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