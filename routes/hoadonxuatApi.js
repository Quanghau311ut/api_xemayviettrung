var express = require('express');
var router = express.Router();
var connection = require('../service/dataconnect');

//getall
router.get('/get-all', function(req, res) {
    // Truy vấn thông tin của tất cả hóa đơn xuất từ bảng quanlyhoadonxuat
    connection.query('SELECT * FROM quanlyhoadonxuat', function(error, hoaDonXuatResults) {
        if (error) {
            console.error('Lỗi truy vấn thông tin hóa đơn xuất:', error);
            return res.status(500).send('Lỗi truy vấn thông tin hóa đơn xuất');
        }

        // Truy vấn thông tin chi tiết hóa đơn xuất từ bảng chitiethoadonxuat
        connection.query('SELECT * FROM chitiethoadonxuat', function(error, chiTietHoaDonXuatResults) {
            if (error) {
                console.error('Lỗi truy vấn thông tin chi tiết hóa đơn xuất:', error);
                return res.status(500).send('Lỗi truy vấn thông tin chi tiết hóa đơn xuất');
            }

            // Gom thông tin chi tiết hóa đơn xuất vào mỗi hóa đơn xuất
            var hoaDonXuatData = hoaDonXuatResults.map(function(hoaDonXuat) {
                var chiTietHoaDonXuat = chiTietHoaDonXuatResults.filter(function(chiTiet) {
                    return chiTiet.id_hoa_don_xuat === hoaDonXuat.id_hoa_don_xuat;
                });
                return { hoaDonXuat: hoaDonXuat, chiTietHoaDonXuat: chiTietHoaDonXuat };
            });

            // Trả về dữ liệu của tất cả hóa đơn xuất cùng với chi tiết
            res.json(hoaDonXuatData);
        });
    });
});


//get-one
router.get('/get-one/:id_hoa_don_xuat', function(req, res) {
    var hoaDonXuatId = req.params.id_hoa_don_xuat;

    // Truy vấn thông tin của hóa đơn xuất từ bảng quanlyhoadonxuat
    connection.query('SELECT * FROM quanlyhoadonxuat WHERE id_hoa_don_xuat = ?', hoaDonXuatId, function(error, hoaDonXuatResults) {
        if (error) {
            console.error('Lỗi truy vấn thông tin hóa đơn xuất:', error);
            return res.status(500).send('Lỗi truy vấn thông tin hóa đơn xuất');
        }

        if (hoaDonXuatResults.length === 0) {
            return res.status(404).send('Không tìm thấy hóa đơn xuất');
        }

        var hoaDonXuatData = hoaDonXuatResults[0];

        // Truy vấn thông tin chi tiết hóa đơn xuất từ bảng chitiethoadonxuat
        connection.query('SELECT * FROM chitiethoadonxuat WHERE id_hoa_don_xuat = ?', hoaDonXuatId, function(error, chiTietHoaDonXuatResults) {
            if (error) {
                console.error('Lỗi truy vấn thông tin chi tiết hóa đơn xuất:', error);
                return res.status(500).send('Lỗi truy vấn thông tin chi tiết hóa đơn xuất');
            }

            // Gán thông tin chi tiết vào dữ liệu của hóa đơn xuất
            hoaDonXuatData.chiTietHoaDonXuat = chiTietHoaDonXuatResults;

            // Trả về dữ liệu của hóa đơn xuất cùng với chi tiết
            res.json(hoaDonXuatData);
        });
    });
});



//add
router.post('/add', function(req, res) {
    var hoaDonXuat = req.body.hoaDonXuat; // Thông tin của hóa đơn xuất
    var chiTietHoaDonXuat = req.body.chiTietHoaDonXuat; // Thông tin chi tiết của hóa đơn xuất

    // Tính tổng giá từ các chi tiết hóa đơn xuất
    var tongGia = chiTietHoaDonXuat.reduce(function(total, chiTiet) {
        return total + (chiTiet.gia_ban * chiTiet.so_luong);
    }, 0);

    // Gán tổng giá cho trường tong_gia của hóa đơn xuất
    hoaDonXuat.tong_gia = tongGia;

    connection.beginTransaction(function(err) {
        if (err) {
            console.error('Lỗi khởi tạo giao dịch:', err);
            res.status(500).send('Lỗi khởi tạo giao dịch');
            return;
        }

        // Thêm hóa đơn xuất
        connection.query('INSERT INTO quanlyhoadonxuat SET ?', hoaDonXuat, function(error, result) {
            if (error) {
                connection.rollback(function() {
                    console.error('Lỗi khi thêm hóa đơn xuất:', error);
                    res.status(500).send('Lỗi khi thêm hóa đơn xuất');
                });
                return;
            }

            var hoaDonXuatId = result.insertId;

            // Thêm thông tin chi tiết của hóa đơn xuất
            var chiTietValues = chiTietHoaDonXuat.map(function(chiTiet) {
                return [hoaDonXuatId, chiTiet.id_xe, chiTiet.so_luong, chiTiet.gia_ban, chiTiet.so_luong * chiTiet.gia_ban];
            });
            
            connection.query('INSERT INTO chitiethoadonxuat (id_hoa_don_xuat, id_xe, so_luong, gia_ban, tong_gia) VALUES ?', [chiTietValues], function(err, result) {
                if (err) {
                    connection.rollback(function() {
                        console.error('Lỗi khi thêm thông tin chi tiết hóa đơn xuất:', err);
                        res.status(500).send('Lỗi khi thêm thông tin chi tiết hóa đơn xuất');
                    });
                    return;
                }

                // Cập nhật số lượng trong bảng quanlyxemay
                var updatePromises = chiTietHoaDonXuat.map(function(chiTiet) {
                    return new Promise(function(resolve, reject) {
                        connection.query('UPDATE quanlyxemay SET so_luong = so_luong - ? WHERE id_xe = ?', [chiTiet.so_luong, chiTiet.id_xe], function(err, result) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    });
                });

                Promise.all(updatePromises)
                    .then(function() {
                        // Commit giao dịch nếu mọi thứ thành công
                        connection.commit(function(err) {
                            if (err) {
                                connection.rollback(function() {
                                    console.error('Lỗi khi commit giao dịch:', err);
                                    res.status(500).send('Lỗi khi commit giao dịch');
                                });
                                return;
                            }
                            console.log('Thêm hóa đơn xuất và thông tin chi tiết thành công!');
                            res.status(200).send('Thêm hóa đơn xuất và thông tin chi tiết thành công!');
                        });
                    })
                    .catch(function(err) {
                        connection.rollback(function() {
                            console.error('Lỗi khi cập nhật số lượng xe máy:', err);
                            res.status(500).send('Lỗi khi cập nhật số lượng xe máy');
                        });
                    });
            });
        });
    });
});



//edit


//delete    
router.delete('/delete/:id_hoa_don_xuat', function(req, res) {
    var idHoaDonXuat = req.params.id_hoa_don_xuat;

    connection.beginTransaction(function(err) {
        if (err) {
            console.error('Lỗi khởi tạo giao dịch:', err);
            res.status(500).send('Lỗi khởi tạo giao dịch');
            return;
        }

        // Lấy thông tin số lượng của từng chi tiết hóa đơn xuất
        var selectChiTietQuery = 'SELECT id_xe, so_luong FROM chitiethoadonxuat WHERE id_hoa_don_xuat = ?';
        connection.query(selectChiTietQuery, idHoaDonXuat, function(error, results) {
            if (error) {
                connection.rollback(function() {
                    console.error('Lỗi khi truy vấn thông tin chi tiết hóa đơn xuất:', error);
                    res.status(500).send('Lỗi khi truy vấn thông tin chi tiết hóa đơn xuất');
                });
                return;
            }

            // Cập nhật số lượng trong bảng quanlyxemay
            var updatePromises = results.map(function(chiTiet) {
                return new Promise(function(resolve, reject) {
                    connection.query('UPDATE quanlyxemay SET so_luong = so_luong + ? WHERE id_xe = ?', [chiTiet.so_luong, chiTiet.id_xe], function(err, result) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            });

            // Xóa thông tin chi tiết hóa đơn xuất
            var deleteChiTietQuery = 'DELETE FROM chitiethoadonxuat WHERE id_hoa_don_xuat = ?';
            connection.query(deleteChiTietQuery, idHoaDonXuat, function(error, result) {
                if (error) {
                    connection.rollback(function() {
                        console.error('Lỗi khi xóa thông tin chi tiết hóa đơn xuất:', error);
                        res.status(500).send('Lỗi khi xóa thông tin chi tiết hóa đơn xuất');
                    });
                    return;
                }

                // Xóa hóa đơn xuất
                var deleteHoaDonQuery = 'DELETE FROM quanlyhoadonxuat WHERE id_hoa_don_xuat = ?';
                connection.query(deleteHoaDonQuery, idHoaDonXuat, function(error, result) {
                    if (error) {
                        connection.rollback(function() {
                            console.error('Lỗi khi xóa hóa đơn xuất:', error);
                            res.status(500).send('Lỗi khi xóa hóa đơn xuất');
                        });
                        return;
                    }

                    // Commit giao dịch nếu mọi thứ thành công
                    Promise.all(updatePromises)
                        .then(function() {
                            connection.commit(function(err) {
                                if (err) {
                                    connection.rollback(function() {
                                        console.error('Lỗi khi commit giao dịch:', err);
                                        res.status(500).send('Lỗi khi commit giao dịch');
                                    });
                                    return;
                                }
                                console.log('Xóa hóa đơn xuất và cập nhật số lượng xe máy thành công!');
                                res.status(200).send('Xóa hóa đơn xuất và cập nhật số lượng xe máy thành công!');
                            });
                        })
                        .catch(function(err) {
                            connection.rollback(function() {
                                console.error('Lỗi khi cập nhật số lượng xe máy:', err);
                                res.status(500).send('Lỗi khi cập nhật số lượng xe máy');
                            });
                        });
                });
            });
        });
    });
});


//search





module.exports = router;