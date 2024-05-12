var express = require('express');
var router = express.Router();
var connection = require('../service/dataconnect');

//getall
router.get('/get-all', function(req, res) {
    var query = 'SELECT * FROM quanlybinhluan';

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
router.get('/get-one/:id_binh_luan', function(req, res) {
    var id_binh_luan = req.params.id_binh_luan;
    var query = 'SELECT * FROM quanlybinhluan WHERE id_binh_luan = ?';

    connection.query(query, id_binh_luan, function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            if (result.length === 0) {
                res.status(404).send('Không tìm thấy bình luận');
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
    if (!req.body.id_bai_viet || !req.body.ten_nguoi_binh_luan || !req.body.noi_dung_binh_luan || !req.body.ngay_binh_luan) {
        return res.status(400).send('Yêu cầu thiếu thông tin');
    }

    var query = "INSERT INTO quanlybinhluan (id_bai_viet, ten_nguoi_binh_luan, noi_dung_binh_luan, ngay_binh_luan, xac_nhan_binh_luan, created_at, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
    var values = [req.body.id_bai_viet, req.body.ten_nguoi_binh_luan, req.body.noi_dung_binh_luan, req.body.ngay_binh_luan, req.body.xac_nhan_binh_luan || false];

    connection.query(query, values, function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            console.log('Thêm thành công bình luận mới:', result);
            res.json(result);
        }
    });
});



//edit
// API route để chỉnh sửa trường xac_nhan_binh_luan
router.post('/edit/:id_binh_luan', (req, res) => {
    const id_binh_luan = req.params.id_binh_luan;
    const xac_nhan_binh_luan = req.body.xac_nhan_binh_luan;
  
    // Kiểm tra xem các trường bắt buộc có tồn tại không
    if (!id_binh_luan || xac_nhan_binh_luan === undefined) {
      return res.status(400).send('Thiếu thông tin bắt buộc');
    }
  
    // Chuẩn bị truy vấn SQL
    const query = 'UPDATE quanlybinhluan SET xac_nhan_binh_luan = ? WHERE id_binh_luan = ?';
    const values = [xac_nhan_binh_luan, id_binh_luan];
  
    // Thực hiện truy vấn SQL
    connection.query(query, values, (error, results) => {
      if (error) {
        console.error('Lỗi khi cập nhật xác nhận bình luận:', error);
        return res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
      }
  
      console.log('Đã cập nhật xác nhận bình luận thành công:', results);
      res.json({ message: 'Đã cập nhật xác nhận bình luận thành công' });
    });
  });
  
// Route để lấy danh sách bình luận theo id_bai_viet
router.get('/LayDanhSachBinhluanTheoMaBaiViet/:id_bai_viet', (req, res) => {
    const id_bai_viet = req.params.id_bai_viet;

    // Kiểm tra xem id_bai_viet có tồn tại không
    if (!id_bai_viet) {
        return res.status(400).send('Thiếu thông tin bắt buộc');
    }

    // Chuẩn bị truy vấn SQL để lấy bình luận theo id_bai_viet
    const query = 'SELECT * FROM quanlybinhluan WHERE id_bai_viet = ?';
    
    // Thực hiện truy vấn
    connection.query(query, [id_bai_viet], (error, results) => {
        if (error) {
            console.error('Lỗi khi lấy danh sách bình luận:', error);
            return res.status(500).send('Lỗi khi truy vấn CSDL');
        }

        console.log('Danh sách bình luận:', results);
        res.json(results); // Trả về danh sách bình luận
    });
});
//delete    
router.delete('/delete/:id_binh_luan', function(req, res) {
    var id_binh_luan = req.params.id_binh_luan;
    var query = 'DELETE FROM quanlybinhluan WHERE id_binh_luan = ?';

    connection.query(query, id_binh_luan, function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            console.log('Xóa thành công bình luận:', result);
            res.json(result);
        }
    });
});


//search





module.exports = router;