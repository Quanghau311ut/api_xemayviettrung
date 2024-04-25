var express = require('express');
var router = express.Router();
var connection = require('../service/dataconnect');

//getall
// Get all Orders with Details
router.get('/get-all', function(req, res) {
    // Query to retrieve all orders with their details
    var query = `
        SELECT
            o.*,
            GROUP_CONCAT(
                JSON_OBJECT(
                    'id_chi_tiet_don_hang', ch.id_chi_tiet_don_hang,
                    'id_xe', ch.id_xe,
                    'so_luong', ch.so_luong,
                    'gia_ban', ch.gia_ban,
                    'tong_gia', ch.tong_gia
                )
            ) AS chi_tiet_don_hang
        FROM
            quanlydonhang o
        LEFT JOIN
            chitietdonhang ch ON o.id_don_hang = ch.id_don_hang
        GROUP BY
            o.id_don_hang;
    `;

    // Execute the query
    connection.query(query, function(error, results) {
        if (error) {
            console.error('Lỗi truy vấn dữ liệu:', error);
            return res.status(500).send('Lỗi truy vấn dữ liệu');
        }

        // Parse JSON objects in the result
        results.forEach(function(order) {
            if (order.chi_tiet_don_hang) {
                order.chi_tiet_don_hang = JSON.parse(`[${order.chi_tiet_don_hang}]`);
            }
        });

        // Send the response with the orders and their details
        res.json(results);
    });
});


//get-one
router.get('/get-one/:id_don_hang', function(req, res) {
    var orderId = req.params.id_don_hang;

    // Truy vấn thông tin của đơn hàng từ bảng quanlydonhang
    connection.query('SELECT * FROM quanlydonhang WHERE id_don_hang = ?', orderId, function(error, results) {
        if (error) {
            console.error('Lỗi truy vấn thông tin đơn hàng:', error);
            return res.status(500).send('Lỗi truy vấn thông tin đơn hàng');
        }

        if (results.length === 0) {
            return res.status(404).send('Không tìm thấy đơn hàng');
        }

        var orderData = results[0];

        // Truy vấn chi tiết đơn hàng từ bảng chitietdonhang
        connection.query('SELECT * FROM chitietdonhang WHERE id_don_hang = ?', orderId, function(error, results) {
            if (error) {
                console.error('Lỗi truy vấn chi tiết đơn hàng:', error);
                return res.status(500).send('Lỗi truy vấn chi tiết đơn hàng');
            }

            // Gán chi tiết đơn hàng vào dữ liệu đơn hàng
            orderData.chitietdonhang = results;

            // Trả về dữ liệu của đơn hàng cùng với chi tiết
            res.json(orderData);
        });
    });
});





//add
const moment = require('moment');

// Add an Order
// Add an Order
router.post('/add', function(req, res) {
    // Validate request body
    if (!req.body || !req.body.id_khach_hang || !req.body.chi_tiet_don_hang) {
        return res.status(400).send('Yêu cầu thiếu thông tin');
    }

    // Calculate total price of the order
    var totalOrderPrice = 0;
    req.body.chi_tiet_don_hang.forEach(function(detail) {
        totalOrderPrice += detail.so_luong * detail.gia_ban;
    });

    // Create the order object
    var orderData = {
        id_khach_hang: req.body.id_khach_hang,
        ngay_dat: moment().format('YYYY-MM-DD'), // Current date
        tong_gia: totalOrderPrice,
        trang_thai: 1 // Default status: Đang chờ xác nhận
    };

    // Insert the order into the database
    connection.query('INSERT INTO quanlydonhang SET ?', orderData, function(error, result) {
        if (error) {
            console.error('Lỗi thêm đơn hàng:', error);
            return res.status(500).send('Lỗi thêm đơn hàng');
        }

        // Insert order details
        var orderID = result.insertId;
        var orderDetails = req.body.chi_tiet_don_hang.map(function(detail) {
            return [
                orderID,
                detail.id_xe,
                detail.so_luong,
                detail.gia_ban,
                detail.so_luong * detail.gia_ban // Calculate total price of order detail
            ];
        });
        connection.query('INSERT INTO chitietdonhang (id_don_hang, id_xe, so_luong, gia_ban, tong_gia) VALUES ?', [orderDetails], function(error, result) {
            if (error) {
                console.error('Lỗi thêm chi tiết đơn hàng:', error);
                return res.status(500).send('Lỗi thêm chi tiết đơn hàng');
            }

            res.json({ message: 'Đã thêm đơn hàng và chi tiết đơn hàng thành công' });
        });
    });
});


//cập nhật trạng thái đơn hàng
router.put('/trang-thai-don-hang/:id_don_hang', function(req, res) {
    var orderId = req.params.id_don_hang;
    var newStatus = req.body.trang_thai;

    // Xác minh thông tin yêu cầu
    if (!newStatus) {
        return res.status(400).send('Thiếu thông tin trạng thái mới');
    }

    // Bắt đầu transaction
    connection.beginTransaction(function(err) {
        if (err) { 
            console.error('Lỗi bắt đầu transaction:', err);
            return res.status(500).send('Lỗi bắt đầu transaction');
        }

        // Cập nhật trạng thái của đơn hàng
        connection.query('UPDATE quanlydonhang SET trang_thai = ? WHERE id_don_hang = ?', [newStatus, orderId], function(error, result) {
            if (error) {
                return connection.rollback(function() {
                    console.error('Lỗi cập nhật trạng thái đơn hàng:', error);
                    res.status(500).send('Lỗi cập nhật trạng thái đơn hàng');
                });
            }

            // Thêm dữ liệu vào bảng trangthaidonhang
            connection.query('INSERT INTO trangthaidonhang (id_don_hang, ten_trang_thai) VALUES (?, ?)', [orderId, newStatus], function(error, result) {
                if (error) {
                    return connection.rollback(function() {
                        console.error('Lỗi thêm trạng thái đơn hàng:', error);
                        res.status(500).send('Lỗi thêm trạng thái đơn hàng');
                    });
                }

                // Commit transaction
                connection.commit(function(err) {
                    if (err) { 
                        return connection.rollback(function() {
                            console.error('Lỗi commit transaction:', err);
                            res.status(500).send('Lỗi commit transaction');
                        });
                    }

                    // Trả về kết quả
                    res.json({ message: 'Đã cập nhật trạng thái đơn hàng thành công' });
                });
            });
        });
    });
});




//edit


//delete    

router.delete('/delete/:id_don_hang', function(req, res) {
    var orderId = req.params.id_don_hang;

    // Lấy trạng thái của đơn hàng
    connection.query('SELECT trang_thai FROM quanlydonhang WHERE id_don_hang = ?', orderId, function(error, results) {
        if (error) {
            console.error('Lỗi truy vấn trạng thái đơn hàng:', error);
            return res.status(500).send('Lỗi truy vấn trạng thái đơn hàng');
        }

        // Kiểm tra trạng thái của đơn hàng
        var orderStatus = results[0].trang_thai;
        if (orderStatus !== 1) {
            return res.status(400).send('Không thể xóa đơn hàng với trạng thái khác đã xác nhận');
        }

        // Bắt đầu transaction
        connection.beginTransaction(function(err) {
            if (err) { 
                console.error('Lỗi bắt đầu transaction:', err);
                return res.status(500).send('Lỗi bắt đầu transaction');
            }

            // Xóa các chi tiết đơn hàng từ bảng chitietdonhang
            connection.query('DELETE FROM chitietdonhang WHERE id_don_hang = ?', orderId, function(error, result) {
                if (error) {
                    return connection.rollback(function() {
                        console.error('Lỗi xóa chi tiết đơn hàng:', error);
                        res.status(500).send('Lỗi xóa chi tiết đơn hàng');
                    });
                }

                // Xóa đơn hàng từ bảng quanlydonhang
                connection.query('DELETE FROM quanlydonhang WHERE id_don_hang = ?', orderId, function(error, result) {
                    if (error) {
                        return connection.rollback(function() {
                            console.error('Lỗi xóa đơn hàng:', error);
                            res.status(500).send('Lỗi xóa đơn hàng');
                        });
                    }

                    // Commit transaction
                    connection.commit(function(err) {
                        if (err) { 
                            return connection.rollback(function() {
                                console.error('Lỗi commit transaction:', err);
                                res.status(500).send('Lỗi commit transaction');
                            });
                        }

                        // Trả về kết quả
                        res.json({ message: 'Đã xóa đơn hàng thành công' });
                    });
                });
            });
        });
    });
});


//search







module.exports = router;