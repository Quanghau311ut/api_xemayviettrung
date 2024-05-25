var express = require('express');
var router = express.Router();
var connection = require('../service/dataconnect');

//GetAll
router.get('/get-all', function(req, res) {
    var query = 'SELECT * FROM quanlydanhmucxemay';
    connection.query(query, function(error, result) {
        if (error) res.send('Lổi thao tác csdl');
        res.json(result);
    });
});
//phân trang
router.get('/get-all-page', function(req, res) {
    // Get page and pageSize from query parameters, set default values if not provided
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize;

    // Query to get total number of records
    const countQuery = 'SELECT COUNT(*) AS total FROM quanlydanhmucxemay';

    // Query to get paginated records
    const dataQuery = `SELECT * FROM quanlydanhmucxemay LIMIT ${pageSize} OFFSET ${offset}`;

    connection.query(countQuery, function(countError, countResult) {
        if (countError) {
            console.error('Lỗi thao tác csdl:', countError);
            return res.status(500).send('Lỗi thao tác csdl');
        }

        const totalRecords = countResult[0].total;
        const totalPages = Math.ceil(totalRecords / pageSize);

        connection.query(dataQuery, function(dataError, dataResult) {
            if (dataError) {
                console.error('Lỗi thao tác csdl:', dataError);
                return res.status(500).send('Lỗi thao tác csdl');
            }

            res.json({
                data: dataResult,
                currentPage: page,
                totalPages: totalPages,
                totalRecords: totalRecords
            });
        });
    });
});


//get-one
router.get('/get-one/:id_danh_muc', function(req, res) {
    var id_danh_muc = req.params.id_danh_muc;
    var query = 'SELECT * FROM quanlydanhmucxemay WHERE id_danh_muc = ?';

    connection.query(query, id_danh_muc, function(error, result) {
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

    // Kiểm tra xem trường ten_danh_muc có tồn tại không
    if (!req.body || !req.body.ten_danh_muc) {
        return res.status(400).send('Yêu cầu thiếu thông tin');
    }

    var query = "INSERT INTO quanlydanhmucxemay (ten_danh_muc, created_at, updated_at) VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
    var values = [req.body.ten_danh_muc];

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
router.post('/edit/:id_danh_muc', function(req, res) {
    console.log("Dữ liệu nhận được:", req.body); // Kiểm tra dữ liệu nhận được từ client

    // Kiểm tra xem các trường id_danh_muc và ten_danh_muc có tồn tại không
    if (!req.body || !req.body.ten_danh_muc) {
        return res.status(400).send('Yêu cầu thiếu thông tin');
    }

    var id_danh_muc = req.params.id_danh_muc;
    var query = "UPDATE quanlydanhmucxemay SET ten_danh_muc = ?, updated_at = CURRENT_TIMESTAMP WHERE id_danh_muc = ?";
    var values = [req.body.ten_danh_muc, id_danh_muc];

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
router.delete('/delete/:id_danh_muc', function(req, res) {
    var id_danh_muc = req.params.id_danh_muc;
    var query = "DELETE FROM quanlydanhmucxemay WHERE id_danh_muc = ?";

    connection.query(query, id_danh_muc, function(error, result) {
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

    var query = "SELECT * FROM quanlydanhmucxemay WHERE ten_danh_muc LIKE ?";
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