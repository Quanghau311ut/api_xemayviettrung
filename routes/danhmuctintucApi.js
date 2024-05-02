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

// router.get('/get-all', function(req, res) {
//     var query = `
//         SELECT 
//             hd.id_hoa_don_nhap,
//             hd.id_nha_cung_cap,
//             hd.tong_gia AS tong_gia_hoa_don,
//             hd.ngay AS ngay_hoa_don,
//             cthd.id_chi_tiet_hoa_don_nhap,
//             cthd.id_xe,
//             cthd.so_luong,
//             cthd.gia_ban,
//             cthd.tong_gia AS tong_gia_chi_tiet,
//             cthd.created_at AS created_at_chi_tiet,
//             cthd.updated_at AS updated_at_chi_tiet
//         FROM 
//             quanlyhoadonnhap hd
//         JOIN 
//             chitiethoadonnhap cthd ON hd.id_hoa_don_nhap = cthd.id_hoa_don_nhap
//     `;

//     connection.query(query, function(error, results) {
//         if (error) {
//             console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
//             res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
//         } else {
//             res.json(results);
//         }
//     });
// });


//get-one
router.get('/get-one/:id_danh_muc_tin', function(req, res) {
    // Extract the id from the request parameters
    const id = req.params.id_danh_muc_tin;

    // SQL query to select one record based on id
    const query = 'SELECT * FROM quanlydanhmuctin WHERE id_danh_muc_tin = ?';

    // Execute the query with id parameter
    connection.query(query, [id], function(error, results) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            // Check if record exists
            if (results.length > 0) {
                // Return the record
                res.json(results[0]);
            } else {
                // If record not found, return 404
                res.status(404).send('Không tìm thấy bản ghi');
            }
        }
    });
});

// router.get('/get-one/:id', function(req, res) {
//     var hoaDonNhapId = req.params.id;
//     var query = `
//         SELECT 
//             hd.id_hoa_don_nhap,
//             hd.id_nha_cung_cap,
//             hd.tong_gia AS tong_gia_hoa_don,
//             hd.ngay AS ngay_hoa_don,
//             cthd.id_chi_tiet_hoa_don_nhap,
//             cthd.id_xe,
//             cthd.so_luong,
//             cthd.gia_ban,
//             cthd.tong_gia AS tong_gia_chi_tiet,
//             cthd.created_at AS created_at_chi_tiet,
//             cthd.updated_at AS updated_at_chi_tiet
//         FROM 
//             quanlyhoadonnhap hd
//         JOIN 
//             chitiethoadonnhap cthd ON hd.id_hoa_don_nhap = cthd.id_hoa_don_nhap
//         WHERE
//             hd.id_hoa_don_nhap = ?
//     `;

//     connection.query(query, [hoaDonNhapId], function(error, results) {
//         if (error) {
//             console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
//             res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
//         } else {
//             res.json(results);
//         }
//     });
// });



//add
const moment = require('moment');

// router.post('/add', function(req, res) {
//     var hoaDonNhap = req.body.hoaDonNhap; // Thông tin của hóa đơn nhập
//     var chiTietHoaDonNhap = req.body.chiTietHoaDonNhap; // Thông tin chi tiết của hóa đơn nhập

//     // Tính tổng giá từ các chi tiết hóa đơn nhập
//     var tongGia = 0;
//     chiTietHoaDonNhap.forEach(function(chiTiet) {
//         var tongTien = chiTiet.so_luong * chiTiet.gia_ban;
//         tongGia += tongTien;
//         chiTiet.tong_tien = tongTien;
//     });

//     // Lấy ngày hiện tại
//     var ngayHienTai = moment().format('YYYY-MM-DD');

//     // Cập nhật tổng giá vào thông tin của hóa đơn nhập
//     hoaDonNhap.tong_gia = tongGia;
//     hoaDonNhap.ngay = ngayHienTai;

//     connection.beginTransaction(function(err) {
//         if (err) {
//             console.error('Lỗi khởi tạo giao dịch:', err);
//             res.status(500).send('Lỗi khởi tạo giao dịch');
//             return;
//         }

//         // Thêm hóa đơn nhập
//         connection.query('INSERT INTO quanlyhoadonnhap SET ?', hoaDonNhap, function(error, result) {
//             if (error) {
//                 connection.rollback(function() {
//                     console.error('Lỗi khi thêm hóa đơn nhập:', error);
//                     res.status(500).send('Lỗi khi thêm hóa đơn nhập');
//                 });
//                 return;
//             }

//             var hoaDonNhapId = result.insertId;

//             // Thêm thông tin chi tiết của hóa đơn nhập
//             var chiTietValues = chiTietHoaDonNhap.map(function(chiTiet) {
//                 return [hoaDonNhapId, chiTiet.id_xe, chiTiet.so_luong, chiTiet.gia_ban, chiTiet.tong_tien];
//             });

//             connection.query('INSERT INTO chitiethoadonnhap (id_hoa_don_nhap, id_xe, so_luong, gia_ban, tong_tien) VALUES ?', [chiTietValues], function(err, result) {
//                 if (err) {
//                     connection.rollback(function() {
//                         console.error('Lỗi khi thêm thông tin chi tiết hóa đơn nhập:', err);
//                         res.status(500).send('Lỗi khi thêm thông tin chi tiết hóa đơn nhập');
//                     });
//                     return;
//                 }

//                 // Commit giao dịch nếu mọi thứ thành công
//                 connection.commit(function(err) {
//                     if (err) {
//                         connection.rollback(function() {
//                             console.error('Lỗi khi commit giao dịch:', err);
//                             res.status(500).send('Lỗi khi commit giao dịch');
//                         });
//                         return;
//                     }
//                     console.log('Thêm hóa đơn nhập và thông tin chi tiết thành công!');
//                     res.status(200).send('Thêm hóa đơn nhập và thông tin chi tiết thành công!');
//                 });
//             });
//         });
//     });
// });


router.post('/add', function(req, res) {
    // Extract data from the request body
    const { ten_danh_muc_tin } = req.body;

    // Validate if required fields are present
    if (!ten_danh_muc_tin) {
        return res.status(400).send('Yêu cầu thiếu thông tin');
    }

    // SQL query to insert a new record
    const query = 'INSERT INTO quanlydanhmuctin (ten_danh_muc_tin) VALUES (?)';

    // Execute the query with the provided data
    connection.query(query, [ten_danh_muc_tin], function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            // Return the ID of the newly inserted record
            res.json({ id: result.insertId, message: 'Thêm bản ghi thành công' });
        }
    });
});

router.post('/edit/:id_danh_muc_tin', function(req, res) {
    // Extract data from the request body
    const { ten_danh_muc_tin } = req.body;
    // Extract the id from the request parameters
    const id = req.params.id_danh_muc_tin;

    // Validate if required fields are present
    if (!ten_danh_muc_tin) {
        return res.status(400).send('Yêu cầu thiếu thông tin');
    }

    // SQL query to update the record
    const query = 'UPDATE quanlydanhmuctin SET ten_danh_muc_tin = ? WHERE id_danh_muc_tin = ?';

    // Execute the query with the provided data and id
    connection.query(query, [ten_danh_muc_tin, id], function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            // Check if any record was updated
            if (result.affectedRows > 0) {
                // Return success message
                res.send('Chỉnh sửa bản ghi thành công');
            } else {
                // If no record was updated, return 404
                res.status(404).send('Không tìm thấy bản ghi');
            }
        }
    });
});


router.delete('/delete/:id_danh_muc_tin', function(req, res) {
    // Extract the id from the request parameters
    const id = req.params.id_danh_muc_tin;

    // SQL query to delete the record
    const query = 'DELETE FROM quanlydanhmuctin WHERE id_danh_muc_tin = ?';

    // Execute the query with the provided id
    connection.query(query, [id], function(error, result) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            // Check if any record was deleted
            if (result.affectedRows > 0) {
                // Return success message
                res.send('Xóa bản ghi thành công');
            } else {
                // If no record was deleted, return 404
                res.status(404).send('Không tìm thấy bản ghi');
            }
        }
    });
});



router.get('/search', function(req, res) {
    // Extract the keyword from the query parameters
    const keyword = req.query.keyword;

    // SQL query to search for records containing the keyword
    const query = 'SELECT * FROM quanlydanhmuctin WHERE ten_danh_muc_tin LIKE ?';

    // Execute the query with the provided keyword
    connection.query(query, [`%${keyword}%`], function(error, results) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            // Return the search results
            res.json(results);
        }
    });
});


module.exports = router;