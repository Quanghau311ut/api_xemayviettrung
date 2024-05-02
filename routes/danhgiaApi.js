var express = require('express');
var router = express.Router();
var connection = require('../service/dataconnect');

//getall
router.get('/get-all', function(req, res) {
    // Truy vấn SQL để lấy tất cả đánh giá từ bảng quanlydanhgia
    const query = `
        SELECT * 
        FROM quanlydanhgia;
    `;

    connection.query(query, function(error, results) {
        if (error) {
            console.error('Lỗi khi lấy đánh giá:', error);
            res.status(500).send('Lỗi khi lấy đánh giá');
        } else {
            console.log('Lấy đánh giá thành công!');
            res.status(200).json(results);
        }
    });
});

//get-one
// GET Route for Retrieving a Single Review by ID
router.get('/get-one/:id_danh_gia', function(req, res) {
    // Lấy ID của đánh giá từ request parameters
    const reviewId = req.params.id_danh_gia;

    // Truy vấn SQL để lấy đánh giá dựa trên ID
    const query = `
        SELECT * 
        FROM quanlydanhgia 
        WHERE id_danh_gia = ?;
    `;

    connection.query(query, [reviewId], function(error, results) {
        if (error) {
            console.error('Lỗi khi lấy đánh giá:', error);
            res.status(500).send('Lỗi khi lấy đánh giá');
        } else {
            // Kiểm tra xem có dữ liệu trả về hay không
            if (results.length === 0) {
                res.status(404).send('Không tìm thấy đánh giá');
            } else {
                console.log('Lấy đánh giá thành công!');
                res.status(200).json(results[0]);
            }
        }
    });
});


//add


// POST Route for Adding a Review
router.post('/add', function(req, res) {
    // Lấy dữ liệu đánh giá từ body của request
    const reviewData = req.body;

    // Thực hiện truy vấn SQL để thêm đánh giá vào cơ sở dữ liệu
    const query = `
        INSERT INTO quanlydanhgia 
        SET ?;
    `;

    connection.query(query, reviewData, function(error, result) {
        if (error) {
            console.error('Lỗi khi thêm đánh giá:', error);
            res.status(500).send('Lỗi khi thêm đánh giá');
        } else {
            console.log('Thêm đánh giá thành công!');
            res.status(200).send('Thêm đánh giá thành công!');
        }
    });
});



//delete
router.delete('/delete/:id_danh_gia', function(req, res) {
    // Lấy ID của đánh giá từ request parameters
    const reviewId = req.params.id_danh_gia;

    // Truy vấn SQL để xóa đánh giá dựa trên ID
    const query = `
        DELETE FROM quanlydanhgia 
        WHERE id_danh_gia = ?;
    `;

    connection.query(query, [reviewId], function(error, result) {
        if (error) {
            console.error('Lỗi khi xóa đánh giá:', error);
            res.status(500).send('Lỗi khi xóa đánh giá');
        } else {
            // Kiểm tra xem có đánh giá nào được xóa hay không
            if (result.affectedRows === 0) {
                res.status(404).send('Không tìm thấy đánh giá để xóa');
            } else {
                console.log('Xóa đánh giá thành công!');
                res.status(200).send('Xóa đánh giá thành công!');
            }
        }
    });
});




module.exports = router;