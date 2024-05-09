var express = require('express');
var router = express.Router();
var connection = require('../service/dataconnect');

//getall
router.get('/get-all', function(req, res) {
    var query = 'SELECT * FROM quanlyxemay';

    connection.query(query, function(error, results) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            // Lặp qua kết quả để lấy thông tin từng xe máy
            var xeMayData = results.map((xe) => {
                return new Promise((resolve, reject) => {
                    var thongSoKyThuatQuery = 'SELECT * FROM thongsokythuat WHERE id_xe = ?';
                    var anhChiTietQuery = 'SELECT * FROM anhchitiet WHERE id_xe = ?';
                    
                    // Lấy thông số kỹ thuật của xe máy
                    connection.query(thongSoKyThuatQuery, xe.id_xe, function(errorThongSoKyThuat, resultThongSoKyThuat) {
                        if (errorThongSoKyThuat) {
                            reject(errorThongSoKyThuat);
                        } else {
                            // Lấy ảnh chi tiết của xe máy
                            connection.query(anhChiTietQuery, xe.id_xe, function(errorAnhChiTiet, resultAnhChiTiet) {
                                if (errorAnhChiTiet) {
                                    reject(errorAnhChiTiet);
                                } else {
                                    // Kết hợp thông tin của xe máy, thông số kỹ thuật và ảnh chi tiết
                                    var xeMay = {
                                        xe: xe,
                                        thongSoKyThuat: resultThongSoKyThuat,
                                        anhChiTiet: resultAnhChiTiet
                                    };
                                    resolve(xeMay);
                                }
                            });
                        }
                    });
                });
            });

            // Chờ tất cả các Promise hoàn thành
            Promise.all(xeMayData)
                .then((data) => {
                    res.json(data);
                })
                .catch((error) => {
                    console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
                    res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
                });
        }
    });
});


//get-one
router.get('/get-one/:id_xe', function(req, res) {
    var id_xe = req.params.id_xe;
    var queryXe = 'SELECT * FROM quanlyxemay WHERE id_xe = ?';
    var queryThongSoKyThuat = 'SELECT * FROM thongsokythuat WHERE id_xe = ?';
    var queryAnhChiTiet = 'SELECT * FROM anhchitiet WHERE id_xe = ?';

    connection.query(queryXe, id_xe, function(errorXe, resultXe) {
        if (errorXe) {
            console.error('Lỗi thao tác với cơ sở dữ liệu (xe):', errorXe);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu (xe)');
        } else {
            if (resultXe.length === 0) {
                res.status(404).send('Không tìm thấy xe máy');
            } else {
                // Lấy thông số kỹ thuật
                connection.query(queryThongSoKyThuat, id_xe, function(errorThongSoKyThuat, resultThongSoKyThuat) {
                    if (errorThongSoKyThuat) {
                        console.error('Lỗi thao tác với cơ sở dữ liệu (thông số kỹ thuật):', errorThongSoKyThuat);
                        res.status(500).send('Lỗi thao tác với cơ sở dữ liệu (thông số kỹ thuật)');
                    } else {
                        // Lấy chi tiết ảnh
                        connection.query(queryAnhChiTiet, id_xe, function(errorAnhChiTiet, resultAnhChiTiet) {
                            if (errorAnhChiTiet) {
                                console.error('Lỗi thao tác với cơ sở dữ liệu (ảnh chi tiết):', errorAnhChiTiet);
                                res.status(500).send('Lỗi thao tác với cơ sở dữ liệu (ảnh chi tiết)');
                            } else {
                                // Gửi kết quả về cho client
                                res.json({
                                    xe: resultXe[0],
                                    thongSoKyThuat: resultThongSoKyThuat,
                                    anhChiTiet: resultAnhChiTiet
                                });
                            }
                        });
                    }
                });
            }
        }
    });
});

// router.get('/get-one/:id_xe', function(req, res) {
//     var id_xe = req.params.id_xe;
//     var query = 'SELECT * FROM quanlyxemay WHERE id_xe = ?';

//     connection.query(query, id_xe, function(error, result) {
//         if (error) {
//             console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
//             res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
//         } else {
//             if (result.length === 0) {
//                 res.status(404).send('Không tìm thấy xe máy');
//             } else {
//                 res.json(result[0]);
//             }
//         }
//     });
// });



//add
// router.post('/add', function(req, res) {
//     console.log("Dữ liệu nhận được:", req.body); // Kiểm tra dữ liệu nhận được từ client

//     // Kiểm tra xem các trường thông tin cần thiết đã được cung cấp chưa
//     if (!req.body || !req.body.id_thuong_hieu || !req.body.id_danh_muc || !req.body.ten_xe || !req.body.model || !req.body.mau_sac || !req.body.nam_san_xuat || !req.body.gia || !req.body.so_luong) {
//         return res.status(400).send('Yêu cầu thiếu thông tin');
//     }

//     var query = "INSERT INTO quanlyxemay (id_thuong_hieu, id_danh_muc, ten_xe, model, mau_sac, nam_san_xuat, gia, so_luong, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
//     var values = [req.body.id_thuong_hieu, req.body.id_danh_muc, req.body.ten_xe, req.body.model, req.body.mau_sac, req.body.nam_san_xuat, req.body.gia, req.body.so_luong];

//     connection.query(query, values, function(error, result) {
//         if (error) {
//             console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
//             res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
//         } else {
//             console.log('Thêm thành công bản ghi:', result);
//             res.json(result);
//         }
//     });
// });

router.post('/add', function(req, res) {
    console.log("Dữ liệu nhận được:", req.body); // Kiểm tra dữ liệu nhận được từ client

    // Kiểm tra xem các trường thông tin cần thiết đã được cung cấp chưa
    if (!req.body || !req.body.xe || !req.body.anhChiTiet || !req.body.thongSoKyThuat || !req.body.xe.anh_dai_dien) {
        return res.status(400).send('Yêu cầu thiếu thông tin hoặc trường anh_dai_dien không được tải lên');
    }

    // Bắt đầu một transaction để đảm bảo tính nhất quán của cơ sở dữ liệu
    connection.beginTransaction(function(err) {
        if (err) { 
            console.error('Lỗi bắt đầu transaction:', err);
            return res.status(500).send('Lỗi bắt đầu transaction');
        }

        // Thêm thông tin xe vào bảng quanlyxemay
        var queryXe = "INSERT INTO quanlyxemay (id_thuong_hieu, id_danh_muc, ten_xe, model, mau_sac, nam_san_xuat, gia, so_luong, anh_dai_dien, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
        var valuesXe = [req.body.xe.id_thuong_hieu, req.body.xe.id_danh_muc, req.body.xe.ten_xe, req.body.xe.model, req.body.xe.mau_sac, req.body.xe.nam_san_xuat, req.body.xe.gia, req.body.xe.so_luong, req.body.xe.anh_dai_dien];

        connection.query(queryXe, valuesXe, function(errorXe, resultXe) {
            if (errorXe) {
                console.error('Lỗi thêm thông tin xe:', errorXe);
                return connection.rollback(function() {
                    res.status(500).send('Lỗi thêm thông tin xe');
                });
            }

            // Thêm thông tin ảnh chi tiết vào bảng anhchitiet
            var queryAnhChiTiet = "INSERT INTO anhchitiet (id_xe, duong_dan_anh, created_at, updated_at) VALUES ?";
            var valuesAnhChiTiet = req.body.anhChiTiet.map(image => [resultXe.insertId, image.duong_dan_anh, new Date(), new Date()]);

            connection.query(queryAnhChiTiet, [valuesAnhChiTiet], function(errorAnhChiTiet, resultAnhChiTiet) {
                if (errorAnhChiTiet) {
                    console.error('Lỗi thêm thông tin ảnh chi tiết:', errorAnhChiTiet);
                    return connection.rollback(function() {
                        res.status(500).send('Lỗi thêm thông tin ảnh chi tiết');
                    });
                }

                // Thêm thông tin thông số kỹ thuật vào bảng thongsokythuat
                var queryThongSoKyThuat = "INSERT INTO thongsokythuat (id_xe, dung_tich_xilanh, cong_suat_toi_da, momen_xoan_toi_da, tieu_hao_nhien_lieu, hop_so, trong_luong, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
                var valuesThongSoKyThuat = [resultXe.insertId, req.body.thongSoKyThuat.dung_tich_xilanh, req.body.thongSoKyThuat.cong_suat_toi_da, req.body.thongSoKyThuat.momen_xoan_toi_da, req.body.thongSoKyThuat.tieu_hao_nhien_lieu, req.body.thongSoKyThuat.hop_so, req.body.thongSoKyThuat.trong_luong];

                connection.query(queryThongSoKyThuat, valuesThongSoKyThuat, function(errorThongSoKyThuat, resultThongSoKyThuat) {
                    if (errorThongSoKyThuat) {
                        console.error('Lỗi thêm thông tin thông số kỹ thuật:', errorThongSoKyThuat);
                        return connection.rollback(function() {
                            res.status(500).send('Lỗi thêm thông tin thông số kỹ thuật');
                        });
                    }

                    // Commit transaction sau khi thêm thành công
                    connection.commit(function(err) {
                        if (err) {
                            console.error('Lỗi commit transaction:', err);
                            return connection.rollback(function() {
                                res.status(500).send('Lỗi commit transaction');
                            });
                        }

                        console.log('Thêm thành công xe, ảnh chi tiết và thông số kỹ thuật');

                        // Trả về kết quả cho client
                        res.json({
                            xe: resultXe,
                            anhChiTiet: resultAnhChiTiet,
                            thongSoKyThuat: resultThongSoKyThuat
                        });
                    });
                });
            });
        });
    });
});


//edit
// router.post('/edit/:id_xe', function(req, res) {
//     console.log("Dữ liệu nhận được:", req.body); // Kiểm tra dữ liệu nhận được từ client

//     // Kiểm tra xem các trường thông tin cần thiết đã được cung cấp chưa
//     if (!req.body || !req.body.id_thuong_hieu || !req.body.id_danh_muc || !req.body.ten_xe || !req.body.model || !req.body.mau_sac || !req.body.nam_san_xuat || !req.body.gia || !req.body.so_luong) {
//         return res.status(400).send('Yêu cầu thiếu thông tin');
//     }

//     var id_xe = req.params.id_xe;
//     var thongSoKyThuat = req.body.thongSoKyThuat; // Dữ liệu thông số kỹ thuật từ client
//     var anhChiTiet = req.body.anhChiTiet; // Dữ liệu ảnh chi tiết từ client

//     var queryXe = "UPDATE quanlyxemay SET id_thuong_hieu = ?, id_danh_muc = ?, ten_xe = ?, model = ?, mau_sac = ?, nam_san_xuat = ?, gia = ?, so_luong = ?, updated_at = CURRENT_TIMESTAMP WHERE id_xe = ?";
//     var valuesXe = [req.body.id_thuong_hieu, req.body.id_danh_muc, req.body.ten_xe, req.body.model, req.body.mau_sac, req.body.nam_san_xuat, req.body.gia, req.body.so_luong, id_xe];

//     connection.query(queryXe, valuesXe, function(error, resultXe) {
//         if (error) {
//             console.error('Lỗi thao tác với cơ sở dữ liệu (xe):', error);
//             return res.status(500).send('Lỗi thao tác với cơ sở dữ liệu (xe)');
//         } else {
//             console.log('Sửa thành công thông tin xe:', resultXe);

//             // Nếu có dữ liệu thông số kỹ thuật
//             if (thongSoKyThuat) {
//                 var queryThongSoKyThuat = "UPDATE thongsokythuat SET dung_tich_xilanh = ?, cong_suat_toi_da = ?, momen_xoan_toi_da = ?, tieu_hao_nhien_lieu = ?, hop_so = ?, trong_luong = ?, updated_at = CURRENT_TIMESTAMP WHERE id_xe = ?";
//                 var valuesThongSoKyThuat = [thongSoKyThuat.dung_tich_xilanh, thongSoKyThuat.cong_suat_toi_da, thongSoKyThuat.momen_xoan_toi_da, thongSoKyThuat.tieu_hao_nhien_lieu, thongSoKyThuat.hop_so, thongSoKyThuat.trong_luong, id_xe];

//                 connection.query(queryThongSoKyThuat, valuesThongSoKyThuat, function(error, resultThongSoKyThuat) {
//                     if (error) {
//                         console.error('Lỗi thao tác với cơ sở dữ liệu (thông số kỹ thuật):', error);
//                         return res.status(500).send('Lỗi thao tác với cơ sở dữ liệu (thông số kỹ thuật)');
//                     } else {
//                         console.log('Sửa thành công thông số kỹ thuật:', resultThongSoKyThuat);
//                     }
//                 });
//             }

//             // Nếu có dữ liệu ảnh chi tiết
//             if (anhChiTiet) {
//                 // Xóa tất cả ảnh chi tiết cũ của xe
//                 var queryDeleteAnhChiTiet = "DELETE FROM anhchitiet WHERE id_xe = ?";
//                 connection.query(queryDeleteAnhChiTiet, [id_xe], function(error, resultDeleteAnhChiTiet) {
//                     if (error) {
//                         console.error('Lỗi khi xóa ảnh chi tiết cũ:', error);
//                         return res.status(500).send('Lỗi khi xóa ảnh chi tiết cũ');
//                     } else {
//                         console.log('Xóa thành công các ảnh chi tiết cũ:', resultDeleteAnhChiTiet);

//                         // Thêm ảnh chi tiết mới
//                         var queryInsertAnhChiTiet = "INSERT INTO anhchitiet (id_xe, duong_dan_anh) VALUES ?";
//                         var valuesInsertAnhChiTiet = anhChiTiet.map(image => [id_xe, image.duong_dan_anh]);

//                         connection.query(queryInsertAnhChiTiet, [valuesInsertAnhChiTiet], function(error, resultInsertAnhChiTiet) {
//                             if (error) {
//                                 console.error('Lỗi khi thêm ảnh chi tiết mới:', error);
//                                 return res.status(500).send('Lỗi khi thêm ảnh chi tiết mới');
//                             } else {
//                                 console.log('Thêm thành công các ảnh chi tiết mới:', resultInsertAnhChiTiet);
//                             }
//                         });
//                     }
//                 });
//             }

//             return res.json(resultXe);
//         }
//     });
// });

router.post('/edit/:id_xe', async function(req, res) {
    console.log("Dữ liệu nhận được:", req.body); // Kiểm tra dữ liệu nhận được từ client

    // Kiểm tra xem các trường thông tin cần thiết đã được cung cấp chưa
    if (!req.body || !req.body.id_thuong_hieu || !req.body.id_danh_muc || !req.body.ten_xe || !req.body.model || !req.body.mau_sac || !req.body.nam_san_xuat || !req.body.gia || !req.body.so_luong) {
        return res.status(400).send('Yêu cầu thiếu thông tin');
    }

    var id_xe = req.params.id_xe;
    var thongSoKyThuat = req.body.thongSoKyThuat; // Dữ liệu thông số kỹ thuật từ client
    var anhChiTiet = req.body.anhChiTiet; // Dữ liệu ảnh chi tiết từ client

    try {
        // Thực hiện truy vấn SQL để cập nhật thông tin xe máy
        await connection.execute(
            'UPDATE quanlyxemay SET id_thuong_hieu = ?, id_danh_muc = ?, ten_xe = ?, model = ?, mau_sac = ?, nam_san_xuat = ?, gia = ?, so_luong = ?, updated_at = CURRENT_TIMESTAMP WHERE id_xe = ?',
            [req.body.id_thuong_hieu, req.body.id_danh_muc, req.body.ten_xe, req.body.model, req.body.mau_sac, req.body.nam_san_xuat, req.body.gia, req.body.so_luong, id_xe]
        );

        console.log('Sửa thành công thông tin xe');

        // Nếu có dữ liệu thông số kỹ thuật
        if (thongSoKyThuat) {
            // Thực hiện truy vấn SQL để cập nhật thông số kỹ thuật
            await connection.execute(
                'UPDATE thongsokythuat SET dung_tich_xilanh = ?, cong_suat_toi_da = ?, momen_xoan_toi_da = ?, tieu_hao_nhien_lieu = ?, hop_so = ?, trong_luong = ?, updated_at = CURRENT_TIMESTAMP WHERE id_xe = ?',
                [thongSoKyThuat.dung_tich_xilanh, thongSoKyThuat.cong_suat_toi_da, thongSoKyThuat.momen_xoan_toi_da, thongSoKyThuat.tieu_hao_nhien_lieu, thongSoKyThuat.hop_so, thongSoKyThuat.trong_luong, id_xe]
            );

            console.log('Sửa thành công thông số kỹ thuật');
        }

        // Nếu có dữ liệu ảnh chi tiết
        if (anhChiTiet) {
            // Thực hiện truy vấn SQL để xóa tất cả các ảnh chi tiết cũ của xe
            await connection.execute('DELETE FROM anhchitiet WHERE id_xe = ?', [id_xe]);

            // Thực hiện truy vấn SQL để thêm các ảnh chi tiết mới vào cơ sở dữ liệu
            for (const image of anhChiTiet) {
                await connection.execute(
                    'INSERT INTO anhchitiet (id_xe, duong_dan_anh) VALUES (?, ?)',
                    [id_xe, image.duong_dan_anh]
                );
            }

            console.log('Thêm thành công các ảnh chi tiết mới');
        }

        return res.status(200).json({ message: 'Cập nhật thành công' });
    } catch (error) {
        console.error('Lỗi:', error);
        return res.status(500).send('Lỗi server');
    }
});




//delete    
router.delete('/delete/:id_xe', function(req, res) {
    var id_xe = req.params.id_xe;
    
    // Xóa thông số kỹ thuật của xe
    var queryDeleteThongSoKyThuat = "DELETE FROM thongsokythuat WHERE id_xe = ?";
    connection.query(queryDeleteThongSoKyThuat, [id_xe], function(error, resultDeleteThongSoKyThuat) {
        if (error) {
            console.error('Lỗi khi xóa thông số kỹ thuật:', error);
            return res.status(500).send('Lỗi khi xóa thông số kỹ thuật');
        } else {
            console.log('Xóa thành công thông số kỹ thuật:', resultDeleteThongSoKyThuat);

            // Xóa ảnh chi tiết của xe
            var queryDeleteAnhChiTiet = "DELETE FROM anhchitiet WHERE id_xe = ?";
            connection.query(queryDeleteAnhChiTiet, [id_xe], function(error, resultDeleteAnhChiTiet) {
                if (error) {
                    console.error('Lỗi khi xóa ảnh chi tiết:', error);
                    return res.status(500).send('Lỗi khi xóa ảnh chi tiết');
                } else {
                    console.log('Xóa thành công ảnh chi tiết:', resultDeleteAnhChiTiet);

                    // Xóa xe từ bảng quản lý xe máy
                    var queryDeleteXe = 'DELETE FROM quanlyxemay WHERE id_xe = ?';
                    connection.query(queryDeleteXe, id_xe, function(error, resultDeleteXe) {
                        if (error) {
                            console.error('Lỗi khi xóa xe:', error);
                            return res.status(500).send('Lỗi khi xóa xe');
                        } else {
                            console.log('Xóa thành công xe:', resultDeleteXe);
                            res.json(resultDeleteXe);
                        }
                    });
                }
            });
        }
    });
});

// get sản phẩm theo danh mục xe
router.get('/LayDuLieuXeMayTheoDanhMuc/:id_danh_muc', function(req, res) {
    var id_danh_muc = req.params.id_danh_muc;
    var queryXe = 'SELECT * FROM quanlyxemay WHERE id_danh_muc = ?';
    var queryThongSoKyThuat = 'SELECT * FROM thongsokythuat WHERE id_xe IN (SELECT id_xe FROM quanlyxemay WHERE id_danh_muc = ?)';
    var queryAnhChiTiet = 'SELECT * FROM anhchitiet WHERE id_xe IN (SELECT id_xe FROM quanlyxemay WHERE id_danh_muc = ?)';

    connection.query(queryXe, id_danh_muc, function(errorXe, resultXe) {
        if (errorXe) {
            console.error('Lỗi khi truy vấn sản phẩm (xe):', errorXe);
            return res.status(500).json({ error: 'Lỗi khi truy vấn sản phẩm (xe)' });
        }

        if (resultXe.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm nào trong danh mục này' });
        }

        // Lấy thông số kỹ thuật
        connection.query(queryThongSoKyThuat, id_danh_muc, function(errorThongSoKyThuat, resultThongSoKyThuat) {
            if (errorThongSoKyThuat) {
                console.error('Lỗi khi truy vấn thông số kỹ thuật:', errorThongSoKyThuat);
                return res.status(500).json({ error: 'Lỗi khi truy vấn thông số kỹ thuật' });
            }

            // Lấy chi tiết ảnh
            connection.query(queryAnhChiTiet, id_danh_muc, function(errorAnhChiTiet, resultAnhChiTiet) {
                if (errorAnhChiTiet) {
                    console.error('Lỗi khi truy vấn chi tiết ảnh:', errorAnhChiTiet);
                    return res.status(500).json({ error: 'Lỗi khi truy vấn chi tiết ảnh' });
                }

                // Gửi kết quả về cho client
                res.json({
                    xe: resultXe,
                    thongSoKyThuat: resultThongSoKyThuat,
                    anhChiTiet: resultAnhChiTiet
                });
            });
        });
    });
});


//lọc xe máy theo khoảng giá

router.get('/LocSanPhamTheoKhoangGia/:minPrice/:maxPrice', function(req, res) {
    var minPrice = req.params.minPrice;
    var maxPrice = req.params.maxPrice;

    var query = `
        SELECT 
            qx.id_xe,
            qx.ten_xe,
            qx.model,
            qx.mau_sac,
            qx.nam_san_xuat,
            qx.gia,
            qx.so_luong,
            qx.anh_dai_dien,
            ts.dung_tich_xilanh,
            ts.cong_suat_toi_da,
            ts.momen_xoan_toi_da,
            ts.tieu_hao_nhien_lieu,
            ts.hop_so,
            ts.trong_luong,
            ac.duong_dan_anh
        FROM 
            quanlyxemay qx
        JOIN 
            thongsokythuat ts ON qx.id_xe = ts.id_xe
        JOIN 
            anhchitiet ac ON qx.id_xe = ac.id_xe
        WHERE 
            qx.gia BETWEEN ? AND ?
    `;

    connection.query(query, [minPrice, maxPrice], function(error, results) {
        if (error) {
            console.error('Lỗi khi lọc sản phẩm theo khoảng giá:', error);
            return res.status(500).json({ error: 'Lỗi khi lọc sản phẩm theo khoảng giá' });
        }

        // Kiểm tra nếu không có sản phẩm nào thỏa mãn điều kiện, trả về thông báo
        if (results.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm nào trong khoảng giá này' });
        }

        // Gửi kết quả về cho client
        res.json(results);
    });
});


// sắp xếp giá tăng dần
router.get('/Sap-Xep-Gia-Tang-Dan', function(req, res) {
    var query = `
        SELECT 
            qx.id_xe,
            qx.ten_xe,
            qx.model,
            qx.mau_sac,
            qx.nam_san_xuat,
            qx.gia,
            qx.so_luong,
            qx.anh_dai_dien,
            ts.dung_tich_xilanh,
            ts.cong_suat_toi_da,
            ts.momen_xoan_toi_da,
            ts.tieu_hao_nhien_lieu,
            ts.hop_so,
            ts.trong_luong,
            ac.duong_dan_anh
        FROM 
            quanlyxemay qx
        JOIN 
            thongsokythuat ts ON qx.id_xe = ts.id_xe
        JOIN 
            anhchitiet ac ON qx.id_xe = ac.id_xe
        ORDER BY 
            qx.gia ASC
    `;

    connection.query(query, function(error, results) {
        if (error) {
            console.error('Lỗi khi lấy dữ liệu và sắp xếp theo giá bán tăng dần:', error);
            return res.status(500).json({ error: 'Lỗi khi lấy dữ liệu và sắp xếp theo giá bán tăng dần' });
        }

        // Kiểm tra nếu không có sản phẩm nào, trả về thông báo
        if (results.length === 0) {
            return res.status(404).json({ message: 'Không có sản phẩm nào được tìm thấy' });
        }

        // Gửi kết quả về cho client
        res.json(results);
    });
});


//sắp xếp giá giảm dần
router.get('/Sap-Xep-Gia-Giam-Dan', function(req, res) {
    var query = `
        SELECT 
            qx.id_xe,
            qx.ten_xe,
            qx.model,
            qx.mau_sac,
            qx.nam_san_xuat,
            qx.gia,
            qx.so_luong,
            qx.anh_dai_dien,
            ts.dung_tich_xilanh,
            ts.cong_suat_toi_da,
            ts.momen_xoan_toi_da,
            ts.tieu_hao_nhien_lieu,
            ts.hop_so,
            ts.trong_luong,
            ac.duong_dan_anh
        FROM 
            quanlyxemay qx
        JOIN 
            thongsokythuat ts ON qx.id_xe = ts.id_xe
        JOIN 
            anhchitiet ac ON qx.id_xe = ac.id_xe
        ORDER BY 
            qx.gia DESC
    `;

    connection.query(query, function(error, results) {
        if (error) {
            console.error('Lỗi khi lấy dữ liệu và sắp xếp theo giá bán giảm dần:', error);
            return res.status(500).json({ error: 'Lỗi khi lấy dữ liệu và sắp xếp theo giá bán giảm dần' });
        }

        // Kiểm tra nếu không có sản phẩm nào, trả về thông báo
        if (results.length === 0) {
            return res.status(404).json({ message: 'Không có sản phẩm nào được tìm thấy' });
        }

        // Gửi kết quả về cho client
        res.json(results);
    });
});



//search
router.get('/search', function(req, res) {
    var keyword = req.query.keyword;
    var query = `
        SELECT 
            qx.id_xe,
            qx.ten_xe,
            qx.model,
            qx.mau_sac,
            qx.nam_san_xuat,
            qx.gia,
            qx.so_luong,
            qx.anh_dai_dien,
            ts.dung_tich_xilanh,
            ts.cong_suat_toi_da,
            ts.momen_xoan_toi_da,
            ts.tieu_hao_nhien_lieu,
            ts.hop_so,
            ts.trong_luong,
            ac.duong_dan_anh
        FROM 
            quanlyxemay qx
        JOIN 
            thongsokythuat ts ON qx.id_xe = ts.id_xe
        JOIN 
            anhchitiet ac ON qx.id_xe = ac.id_xe
        JOIN
            quanlydanhmucxemay dm ON qx.id_danh_muc = dm.id_danh_muc
        WHERE 
            qx.ten_xe LIKE ?
            OR qx.model LIKE ?
            OR qx.mau_sac LIKE ?
            OR dm.ten_danh_muc LIKE ?
    `;

    // Thêm ký tự đại diện '%' vào từ khóa để tìm kiếm các bản ghi có tên chứa từ khóa
    var keywordWithWildcard = '%' + keyword + '%';

    connection.query(query, [keywordWithWildcard, keywordWithWildcard, keywordWithWildcard, keywordWithWildcard], function(error, results) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            res.json(results);
        }
    });
});






module.exports = router;