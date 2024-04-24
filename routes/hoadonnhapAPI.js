var express = require('express');
var router = express.Router();
var connection = require('../service/dataconnect');

//getall
router.get('/get-all', function(req, res) {
    var query = `
        SELECT *
        FROM quanlyhoadonnhap
        INNER JOIN chitiethoadonnhap ON quanlyhoadonnhap.id_hoa_don_nhap = chitiethoadonnhap.id_hoa_don_nhap
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
    var id = req.params.id;
    var query = `
        SELECT *
        FROM quanlyhoadonnhap
        INNER JOIN chitiethoadonnhap ON quanlyhoadonnhap.id_hoa_don_nhap = chitiethoadonnhap.id_hoa_don_nhap
        WHERE quanlyhoadonnhap.id_hoa_don_nhap = ?
    `;

    connection.query(query, [id], function(error, results) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            if (results.length > 0) {
                res.json(results[0]);
            } else {
                res.status(404).send('Không tìm thấy hóa đơn nhập với ID đã cho');
            }
        }
    });
});


//add
router.post('/add', function(req, res) {
    console.log("Dữ liệu hóa đơn nhập nhận được:", req.body); // Kiểm tra dữ liệu nhận được từ client

    // Kiểm tra xem tất cả các trường cần thiết đã được cung cấp chưa
    if (!req.body || !req.body.id_nha_cung_cap || !req.body.chi_tiet_hoa_don_nhap) {
        return res.status(400).send('Yêu cầu thiếu thông tin');
    }

    // Bắt đầu một transaction
    connection.beginTransaction(function(err) {
        if (err) {
            console.error('Lỗi bắt đầu transaction:', err);
            return res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        }

        var tongTienHoaDonNhap = 0;
        var chiTietHoaDonNhap = req.body.chi_tiet_hoa_don_nhap;

        // Thêm hóa đơn nhập
        var queryInsertHoaDonNhap = "INSERT INTO quanlyhoadonnhap (id_nha_cung_cap, ngay, created_at, updated_at) VALUES (?, CURDATE(), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
        var valuesHoaDonNhap = [req.body.id_nha_cung_cap];

        connection.query(queryInsertHoaDonNhap, valuesHoaDonNhap, function(error, resultHoaDonNhap) {
            if (error) {
                return connection.rollback(function() {
                    console.error('Lỗi thao tác với cơ sở dữ liệu (Hóa đơn nhập):', error);
                    res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
                });
            }

            console.log('Thêm thành công hóa đơn nhập:', resultHoaDonNhap);

            // Lấy ID của hóa đơn nhập vừa được thêm
            var idHoaDonNhap = resultHoaDonNhap.insertId;

            // Thêm chi tiết hóa đơn nhập
            var queryInsertChiTietHoaDonNhap = "INSERT INTO chitiethoadonnhap (id_hoa_don_nhap, id_xe, so_luong, gia_ban, tong_gia, created_at, updated_at) VALUES ?";
            var valuesChiTietHoaDonNhap = [];

            chiTietHoaDonNhap.forEach(function(item) {
                var tongGia = item.so_luong * item.gia_ban;
                tongTienHoaDonNhap += tongGia; // Tính tổng tiền của hóa đơn nhập
                valuesChiTietHoaDonNhap.push([idHoaDonNhap, item.id_xe, item.so_luong, item.gia_ban, tongGia, new Date(), new Date()]);
            });

            connection.query(queryInsertChiTietHoaDonNhap, [valuesChiTietHoaDonNhap], function(error, resultChiTietHoaDonNhap) {
                if (error) {
                    return connection.rollback(function() {
                        console.error('Lỗi thao tác với cơ sở dữ liệu (Chi tiết hóa đơn nhập):', error);
                        res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
                    });
                }

                console.log('Thêm thành công chi tiết hóa đơn nhập:', resultChiTietHoaDonNhap);

                // Cập nhật số lượng sản phẩm trong bảng quanlyxemay
                var queryUpdateSoLuongXe = "UPDATE quanlyxemay SET so_luong = so_luong + ? WHERE id_xe = ?";
                var valuesUpdateSoLuongXe = [];

                chiTietHoaDonNhap.forEach(function(item) {
                    valuesUpdateSoLuongXe.push(item.so_luong); // Giá trị mới của số lượng
                    valuesUpdateSoLuongXe.push(item.id_xe);    // Điều kiện WHERE
                });

                connection.query(queryUpdateSoLuongXe, valuesUpdateSoLuongXe, function(error, resultUpdateSoLuongXe) {
                    if (error) {
                        return connection.rollback(function() {
                            console.error('Lỗi thao tác với cơ sở dữ liệu (Cập nhật số lượng xe máy):', error);
                            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
                        });
                    }

                    console.log('Cập nhật số lượng xe máy thành công:', resultUpdateSoLuongXe);

                    // Cập nhật tổng tiền của hóa đơn nhập
                    var queryUpdateTongTienHoaDonNhap = "UPDATE quanlyhoadonnhap SET tong_gia = ? WHERE id_hoa_don_nhap = ?";
                    connection.query(queryUpdateTongTienHoaDonNhap, [tongTienHoaDonNhap, idHoaDonNhap], function(error, resultUpdateTongTienHoaDonNhap) {
                        if (error) {
                            return connection.rollback(function() {
                                console.error('Lỗi thao tác với cơ sở dữ liệu (Cập nhật tổng tiền hóa đơn nhập):', error);
                                res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
                            });
                        }

                        console.log('Cập nhật tổng tiền của hóa đơn nhập thành công:', resultUpdateTongTienHoaDonNhap);

                        // Commit transaction
                        connection.commit(function(err) {
                            if (err) {
                                return connection.rollback(function() {
                                    console.error('Lỗi commit transaction:', err);
                                    res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
                                });
                            }
                            console.log('Commit transaction thành công!');
                            res.json({ message: 'Thêm thành công hóa đơn nhập và chi tiết hóa đơn nhập' });
                        });
                    });
                });
            });
        });
    });
});





//edit


//delete    




//search







module.exports = router;