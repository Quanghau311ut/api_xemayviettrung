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
// API route để thêm đánh giá
router.post('/add', (req, res) => {
    const { id_xe, danh_gia, noi_dung_danh_gia, ten_nguoi_danh_gia, email, xac_nhan_danh_gia } = req.body;

    // Kiểm tra xem các trường bắt buộc có tồn tại không
    if (!id_xe || !danh_gia || !noi_dung_danh_gia || !ten_nguoi_danh_gia || !email || xac_nhan_danh_gia === undefined) {
        return res.status(400).send('Thiếu thông tin bắt buộc');
    }

    // Lấy ngày hiện tại
    const ngay_danh_gia = new Date().toISOString().split('T')[0];

    // Chuẩn bị truy vấn SQL
    const query = 'INSERT INTO quanlydanhgia (id_xe, danh_gia, noi_dung_danh_gia, ten_nguoi_danh_gia, email, xac_nhan_danh_gia, ngay_danh_gia) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [id_xe, danh_gia, noi_dung_danh_gia, ten_nguoi_danh_gia, email, xac_nhan_danh_gia, ngay_danh_gia];

    // Thực hiện truy vấn SQL
    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('Lỗi khi thêm đánh giá:', error);
            return res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        }

        console.log('Đã thêm đánh giá thành công:', results);
        res.json({ message: 'Đã thêm đánh giá thành công' });
    });
});



// edit-trường xác nhận đánh giá
router.post('/edit/:id_danh_gia', (req, res) => {
    const id_danh_gia = req.params.id_danh_gia;
    const xac_nhan_danh_gia = req.body.xac_nhan_danh_gia;
  
    // Kiểm tra xem các trường bắt buộc có tồn tại không
    if (!id_danh_gia || xac_nhan_danh_gia === undefined) {
      return res.status(400).send('Thiếu thông tin bắt buộc');
    }
  
    // Chuẩn bị truy vấn SQL
    const query = 'UPDATE quanlydanhgia SET xac_nhan_danh_gia = ? WHERE id_danh_gia = ?';
    const values = [xac_nhan_danh_gia, id_danh_gia];
  
    // Thực hiện truy vấn SQL
    connection.query(query, values, (error, results) => {
      if (error) {
        console.error('Lỗi khi cập nhật xác nhận đánh giá:', error);
        return res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
      }
  
      console.log('Đã cập nhật xác nhận đánh giá thành công:', results);
      res.json({ message: 'Đã cập nhật xác nhận đánh giá thành công' });
    });
});


// lấy danh sách đánh giá theo id_xe
// Route để lấy danh sách đánh giá theo id_xe
router.get('/LayDanhSachDanhGiaTheoIdXe/:id_xe', (req, res) => {
    const id_xe = req.params.id_xe;

    // Kiểm tra xem id_xe có tồn tại không
    if (!id_xe) {
        return res.status(400).send('Thiếu thông tin bắt buộc');
    }

    // Chuẩn bị truy vấn SQL để lấy đánh giá theo id_xe
    const query = 'SELECT * FROM quanlydanhgia WHERE id_xe = ?';
    
    // Thực hiện truy vấn
    connection.query(query, [id_xe], (error, results) => {
        if (error) {
            console.error('Lỗi khi lấy danh sách đánh giá:', error);
            return res.status(500).send('Lỗi khi truy vấn CSDL');
        }

        console.log('Danh sách đánh giá:', results);
        res.json(results); // Trả về danh sách đánh giá
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