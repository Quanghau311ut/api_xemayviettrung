var express = require('express');
var router = express.Router();
var connection = require('../service/dataconnect');

// Điểm cuối API để lấy tổng số lượng xe máy trong cửa hàng
router.get('/so-luong-xe-trong-cua-hang', function(req, res) {
    var query = 'SELECT SUM(so_luong) AS `TỔNG SỐ XE TRONG CỬA HÀNG` FROM quanlyxemay';

    connection.query(query, function(error, results) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            const tongSoXeMay = results[0]['TỔNG SỐ XE TRONG CỬA HÀNG'];
            res.json({ so_luong_xe_trong_cua_hang: tongSoXeMay });
        }
    });
});


// Điểm cuối API để lấy số lượng đơn hàng
router.get('/so-luong-don-hang', function(req, res) {
    const query = 'SELECT COUNT(*) AS so_luong_don_hang FROM quanlydonhang';

    connection.query(query, function(error, results) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            const soLuongDonHang = results[0].so_luong_don_hang;
            res.json({ so_luong_don_hang: soLuongDonHang });
        }
    });
});


// Điểm cuối API để lấy các sản phẩm gần hết hàng
router.get('/san-pham-gan-het-hang', function(req, res) {
    const query = 'SELECT * FROM quanlyxemay WHERE so_luong <1';

    connection.query(query, function(error, results) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            res.json(results);
        }
    });
});

// API để tính doanh thu nhập theo tháng
router.get('/doanh-thu-nhap-theo-thang', function(req, res) {
    // Tạo truy vấn SQL để tính tổng doanh thu nhập theo tháng
    const query = `
        SELECT 
            YEAR(ngay) AS nam,
            MONTH(ngay) AS thang,
            SUM(tong_gia) AS tong_tien_nhap
        FROM 
            quanlyhoadonnhap
        GROUP BY 
            YEAR(ngay), MONTH(ngay)
        ORDER BY 
            nam, thang;
    `;

    // Thực thi truy vấn
    connection.query(query, function(error, results) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            res.json(results);
        }
    });
});


//daonh thu xuất theo tháng
router.get('/doanh-thu-xuat-theo-thang', function(req, res) {
    // Tạo truy vấn SQL để tính tổng doanh thu xuất theo tháng
    const query = `
        SELECT 
            YEAR(ngay) AS nam,
            MONTH(ngay) AS thang,
            SUM(tong_gia) AS doanh_thu_xuat
        FROM 
            quanlyhoadonxuat
        GROUP BY 
            YEAR(ngay), MONTH(ngay)
        ORDER BY 
            nam, thang;
    `;

    // Thực thi truy vấn
    connection.query(query, function(error, results) {
        if (error) {
            console.error('Lỗi thao tác với cơ sở dữ liệu:', error);
            res.status(500).send('Lỗi thao tác với cơ sở dữ liệu');
        } else {
            res.json(results);
        }
    });
});



module.exports = router;