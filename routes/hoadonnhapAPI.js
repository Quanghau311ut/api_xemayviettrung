var express = require('express');
var router = express.Router();
var connection = require('../service/dataconnect');
const moment = require('moment');

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
        SELECT chitiethoadonnhap.*, quanlyhoadonnhap.id_hoa_don_nhap as hoa_don_id, quanlyhoadonnhap.id_nha_cung_cap, quanlyhoadonnhap.tong_gia, quanlyhoadonnhap.ngay, quanlyhoadonnhap.created_at as hoa_don_created_at, quanlyhoadonnhap.updated_at as hoa_don_updated_at
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
                res.json(results);
            } else {
                res.status(404).send('Không tìm thấy hóa đơn nhập với ID đã cho');
            }
        }
    });
});



//add

// router.post('/add', function(req, res) {
//     var hoaDonNhap = req.body.hoaDonNhap; // Thông tin của hóa đơn nhập
//     var chiTietHoaDonNhap = req.body.chiTietHoaDonNhap; // Thông tin chi tiết của hóa đơn nhập

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
//                 return [hoaDonNhapId, chiTiet.id_xe, chiTiet.so_luong, chiTiet.gia_ban, chiTiet.gia_ban * chiTiet.so_luong];
//             });

//             connection.query('INSERT INTO chitiethoadonnhap (id_hoa_don_nhap, id_xe, so_luong, gia_ban, tong_gia) VALUES ?', [chiTietValues], function(err, result) {
//                 if (err) {
//                     connection.rollback(function() {
//                         console.error('Lỗi khi thêm thông tin chi tiết hóa đơn nhập:', err);
//                         res.status(500).send('Lỗi khi thêm thông tin chi tiết hóa đơn nhập');
//                     });
//                     return;
//                 }

//                 // Cập nhật số lượng trong bảng quanlyxemay
//                 var updatePromises = chiTietHoaDonNhap.map(function(chiTiet) {
//                     return new Promise(function(resolve, reject) {
//                         connection.query('UPDATE quanlyxemay SET so_luong = so_luong + ? WHERE id_xe = ?', [chiTiet.so_luong, chiTiet.id_xe], function(err, result) {
//                             if (err) {
//                                 reject(err);
//                             } else {
//                                 resolve();
//                             }
//                         });
//                     });
//                 });

//                 Promise.all(updatePromises)
//                     .then(function() {
//                         // Commit giao dịch nếu mọi thứ thành công
//                         connection.commit(function(err) {
//                             if (err) {
//                                 connection.rollback(function() {
//                                     console.error('Lỗi khi commit giao dịch:', err);
//                                     res.status(500).send('Lỗi khi commit giao dịch');
//                                 });
//                                 return;
//                             }
//                             console.log('Thêm hóa đơn nhập và thông tin chi tiết thành công!');
//                             res.status(200).send('Thêm hóa đơn nhập và thông tin chi tiết thành công!');
//                         });
//                     })
//                     .catch(function(err) {
//                         connection.rollback(function() {
//                             console.error('Lỗi khi cập nhật số lượng xe máy:', err);
//                             res.status(500).send('Lỗi khi cập nhật số lượng xe máy');
//                         });
//                     });
//             });
//         });
//     });
// });

router.post('/add', (req, res) => {
    const hoaDonNhap = req.body.hoaDonNhap; // Thông tin của hóa đơn nhập
    const chiTietHoaDonNhap = req.body.chiTietHoaDonNhap; // Thông tin chi tiết của hóa đơn nhập

    // Tính tổng giá từ các chi tiết hóa đơn nhập
    const tongGia = chiTietHoaDonNhap.reduce((total, chiTiet) => {
        return total + (chiTiet.gia_ban * chiTiet.so_luong);
    }, 0);

    // Gán tổng giá cho trường tong_gia của hóa đơn nhập
    hoaDonNhap.tong_gia = tongGia;

    connection.beginTransaction((err) => {
        if (err) {
            console.error('Lỗi khởi tạo giao dịch:', err);
            return res.status(500).send('Lỗi khởi tạo giao dịch');
        }

        // Thêm hóa đơn nhập
        connection.query('INSERT INTO quanlyhoadonnhap SET ?', hoaDonNhap, (error, result) => {
            if (error) {
                console.error('Lỗi khi thêm hóa đơn nhập:', error);
                connection.rollback(() => {
                    res.status(500).send('Lỗi khi thêm hóa đơn nhập');
                });
                return;
            }

            const hoaDonNhapId = result.insertId;

            // Thêm thông tin chi tiết của hóa đơn nhập
            const chiTietValues = chiTietHoaDonNhap.map((chiTiet) => {
                return [hoaDonNhapId, chiTiet.id_xe, chiTiet.so_luong, chiTiet.gia_ban, chiTiet.gia_ban * chiTiet.so_luong];
            });

            connection.query('INSERT INTO chitiethoadonnhap (id_hoa_don_nhap, id_xe, so_luong, gia_ban, tong_gia) VALUES ?', [chiTietValues], (err, result) => {
                if (err) {
                    console.error('Lỗi khi thêm thông tin chi tiết hóa đơn nhập:', err);
                    connection.rollback(() => {
                        res.status(500).send('Lỗi khi thêm thông tin chi tiết hóa đơn nhập');
                    });
                    return;
                }

                // Cập nhật số lượng trong bảng quanlyxemay
                const updatePromises = chiTietHoaDonNhap.map((chiTiet) => {
                    return new Promise((resolve, reject) => {
                        connection.query('UPDATE quanlyxemay SET so_luong = so_luong + ? WHERE id_xe = ?', [chiTiet.so_luong, chiTiet.id_xe], (err, result) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    });
                });

                Promise.all(updatePromises)
                    .then(() => {
                        // Commit giao dịch nếu mọi thứ thành công
                        connection.commit((err) => {
                            if (err) {
                                console.error('Lỗi khi commit giao dịch:', err);
                                connection.rollback(() => {
                                    res.status(500).send('Lỗi khi commit giao dịch');
                                });
                                return;
                            }
                            console.log('Thêm hóa đơn nhập và thông tin chi tiết thành công!');
                            res.status(200).send('Thêm hóa đơn nhập và thông tin chi tiết thành công!');
                        });
                    })
                    .catch((err) => {
                        console.error('Lỗi khi cập nhật số lượng xe máy:', err);
                        connection.rollback(() => {
                            res.status(500).send('Lỗi khi cập nhật số lượng xe máy');
                        });
                    });
            });
        });
    });
});

//edit


//delete    
router.delete('/delete/:id', function(req, res) {
    var idHoaDonNhap = req.params.id;

    connection.beginTransaction(function(err) {
        if (err) {
            console.error('Lỗi khởi tạo giao dịch:', err);
            res.status(500).send('Lỗi khởi tạo giao dịch');
            return;
        }

        // Lấy thông tin số lượng của từng chi tiết hóa đơn nhập
        var selectChiTietQuery = 'SELECT id_xe, so_luong FROM chitiethoadonnhap WHERE id_hoa_don_nhap = ?';
        connection.query(selectChiTietQuery, idHoaDonNhap, function(error, results) {
            if (error) {
                connection.rollback(function() {
                    console.error('Lỗi khi truy vấn thông tin chi tiết hóa đơn nhập:', error);
                    res.status(500).send('Lỗi khi truy vấn thông tin chi tiết hóa đơn nhập');
                });
                return;
            }

            // Cập nhật số lượng trong bảng quanlyxemay
            var updatePromises = results.map(function(chiTiet) {
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

            // Xóa thông tin chi tiết hóa đơn nhập
            var deleteChiTietQuery = 'DELETE FROM chitiethoadonnhap WHERE id_hoa_don_nhap = ?';
            connection.query(deleteChiTietQuery, idHoaDonNhap, function(error, result) {
                if (error) {
                    connection.rollback(function() {
                        console.error('Lỗi khi xóa thông tin chi tiết hóa đơn nhập:', error);
                        res.status(500).send('Lỗi khi xóa thông tin chi tiết hóa đơn nhập');
                    });
                    return;
                }

                // Xóa hóa đơn nhập
                var deleteHoaDonQuery = 'DELETE FROM quanlyhoadonnhap WHERE id_hoa_don_nhap = ?';
                connection.query(deleteHoaDonQuery, idHoaDonNhap, function(error, result) {
                    if (error) {
                        connection.rollback(function() {
                            console.error('Lỗi khi xóa hóa đơn nhập:', error);
                            res.status(500).send('Lỗi khi xóa hóa đơn nhập');
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
                                console.log('Xóa hóa đơn nhập và cập nhật số lượng xe máy thành công!');
                                res.status(200).send('Xóa hóa đơn nhập và cập nhật số lượng xe máy thành công!');
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