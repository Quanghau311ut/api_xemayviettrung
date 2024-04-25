var express = require('express');
var router = express.Router();
var connection = require('../service/dataconnect');

//getall
router.get('/get-all', function(req, res) {
    var query = `
        SELECT 
            hd.id_hoa_don_nhap,
            hd.id_nha_cung_cap,
            hd.tong_gia AS tong_gia_hoa_don,
            hd.ngay AS ngay_hoa_don,
            cthd.id_chi_tiet_hoa_don_nhap,
            cthd.id_xe,
            cthd.so_luong,
            cthd.gia_ban,
            cthd.tong_gia AS tong_gia_chi_tiet,
            cthd.created_at AS created_at_chi_tiet,
            cthd.updated_at AS updated_at_chi_tiet
        FROM 
            quanlyhoadonnhap hd
        JOIN 
            chitiethoadonnhap cthd ON hd.id_hoa_don_nhap = cthd.id_hoa_don_nhap
    `;

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
router.get('/get-one/:id', function(req, res) {
    var hoaDonNhapId = req.params.id;
    var query = `
        SELECT 
            hd.id_hoa_don_nhap,
            hd.id_nha_cung_cap,
            hd.tong_gia AS tong_gia_hoa_don,
            hd.ngay AS ngay_hoa_don,
            cthd.id_chi_tiet_hoa_don_nhap,
            cthd.id_xe,
            cthd.so_luong,
            cthd.gia_ban,
            cthd.tong_gia AS tong_gia_chi_tiet,
            cthd.created_at AS created_at_chi_tiet,
            cthd.updated_at AS updated_at_chi_tiet
        FROM 
            quanlyhoadonnhap hd
        JOIN 
            chitiethoadonnhap cthd ON hd.id_hoa_don_nhap = cthd.id_hoa_don_nhap
        WHERE
            hd.id_hoa_don_nhap = ?
    `;

    connection.query(query, [hoaDonNhapId], function(error, results) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            res.json(results);
        }
    });
});



//add
const moment = require('moment');

router.post('/add', function(req, res) {
    var hoaDonNhap = req.body.hoaDonNhap; // Thông tin của hóa đơn nhập
    var chiTietHoaDonNhap = req.body.chiTietHoaDonNhap; // Thông tin chi tiết của hóa đơn nhập

    // Tính tổng giá từ các chi tiết hóa đơn nhập
    var tongGia = 0;
    chiTietHoaDonNhap.forEach(function(chiTiet) {
        var tongTien = chiTiet.so_luong * chiTiet.gia_ban;
        tongGia += tongTien;
        chiTiet.tong_tien = tongTien;
    });

    // Lấy ngày hiện tại
    var ngayHienTai = moment().format('YYYY-MM-DD');

    // Cập nhật tổng giá vào thông tin của hóa đơn nhập
    hoaDonNhap.tong_gia = tongGia;
    hoaDonNhap.ngay = ngayHienTai;

    connection.beginTransaction(function(err) {
        if (err) {
            console.error('Lỗi khởi tạo giao dịch:', err);
            res.status(500).send('Lỗi khởi tạo giao dịch');
            return;
        }

        // Thêm hóa đơn nhập
        connection.query('INSERT INTO quanlyhoadonnhap SET ?', hoaDonNhap, function(error, result) {
            if (error) {
                connection.rollback(function() {
                    console.error('Lỗi khi thêm hóa đơn nhập:', error);
                    res.status(500).send('Lỗi khi thêm hóa đơn nhập');
                });
                return;
            }

            var hoaDonNhapId = result.insertId;

            // Thêm thông tin chi tiết của hóa đơn nhập
            var chiTietValues = chiTietHoaDonNhap.map(function(chiTiet) {
                return [hoaDonNhapId, chiTiet.id_xe, chiTiet.so_luong, chiTiet.gia_ban, chiTiet.tong_tien];
            });

            connection.query('INSERT INTO chitiethoadonnhap (id_hoa_don_nhap, id_xe, so_luong, gia_ban, tong_tien) VALUES ?', [chiTietValues], function(err, result) {
                if (err) {
                    connection.rollback(function() {
                        console.error('Lỗi khi thêm thông tin chi tiết hóa đơn nhập:', err);
                        res.status(500).send('Lỗi khi thêm thông tin chi tiết hóa đơn nhập');
                    });
                    return;
                }

                // Commit giao dịch nếu mọi thứ thành công
                connection.commit(function(err) {
                    if (err) {
                        connection.rollback(function() {
                            console.error('Lỗi khi commit giao dịch:', err);
                            res.status(500).send('Lỗi khi commit giao dịch');
                        });
                        return;
                    }
                    console.log('Thêm hóa đơn nhập và thông tin chi tiết thành công!');
                    res.status(200).send('Thêm hóa đơn nhập và thông tin chi tiết thành công!');
                });
            });
        });
    });
});






module.exports = router;