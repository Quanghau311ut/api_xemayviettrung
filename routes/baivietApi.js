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
//phân trang
router.get('/get-page', function(req, res) {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const pageSize = parseInt(req.query.pageSize) || 3; // Default page size to 3 if not provided

    const offset = (page - 1) * pageSize;

    // First, get the total count of records
    const totalCountQuery = `SELECT COUNT(*) AS totalRecords FROM quanlybaiviet`;

    connection.query(totalCountQuery, function(error, countResult) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            const totalRecords = countResult[0].totalRecords;

            // Next, fetch the paginated data
            const query = `SELECT * FROM quanlybaiviet LIMIT ?, ?`;
            const values = [offset, pageSize];

            connection.query(query, values, function(error, result) {
                if (error) {
                    console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
                    res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
                } else {
                    const totalPages = Math.ceil(totalRecords / pageSize);

                    // Return paginated data along with total records and total pages count
                    res.json({ data: result, totalRecords, totalPages });
                }
            });
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

// get dữ liệu bài viết theo danh mục tin
router.get('/LayDanhSachBaiVietTheoMaDanhMuc/:id_danh_muc_tin', function(req, res) {
    var id_danh_muc_tin = req.params.id_danh_muc_tin;
    var query = `
        SELECT baiviet.*, danhmuc.ten_danh_muc_tin 
        FROM quanlybaiviet baiviet 
        JOIN quanlydanhmuctin danhmuc ON baiviet.id_danh_muc_tin = danhmuc.id_danh_muc_tin 
        WHERE baiviet.id_danh_muc_tin = ?`;

    connection.query(query, id_danh_muc_tin, function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            if (result.length === 0) {
                res.status(404).send('Không tìm thấy bài viết');
            } else {
                res.json(result);
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

    // Xóa tất cả các bình luận của bài viết
    var queryDeleteComments = 'DELETE FROM quanlybinhluan WHERE id_bai_viet = ?';
    connection.query(queryDeleteComments, [id_bai_viet], function(error, resultDeleteComments) {
        if (error) {
            console.error('Lỗi khi xóa bình luận:', error);
            return res.status(500).send('Lỗi khi xóa bình luận');
        } else {
            console.log('Xóa thành công các bình luận:', resultDeleteComments);

            // Tiếp tục xóa bài viết sau khi xóa bình luận
            var queryDeletePost = 'DELETE FROM quanlybaiviet WHERE id_bai_viet = ?';
            connection.query(queryDeletePost, [id_bai_viet], function(error, resultDeletePost) {
                if (error) {
                    console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
                    res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
                } else {
                    console.log('Xóa thành công bài viết:', resultDeletePost);
                    res.json(resultDeletePost);
                }
            });
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