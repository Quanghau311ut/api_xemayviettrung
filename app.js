var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyparser = require('body-parser');
//thu vien upload file
var fileupload = require('express-fileupload');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');




// var apiloaispAPI = require('./api/apiloaisp');
// var apisanphamAPI = require('./api/apisanpham');

// var apinccAPI = require('./api/apincc');
// var apiNhaSanXuat=require('./api/nhasanxuat');
// var apiMenu=require('./api/menu');
// var apiPhanHoi=require('./api/apiPhanHoi');
// var apiSlide= require('./api/apiSlide');
// var apiLoaiTin=require('./api/tintuc');
// var apiBaiViet=require('./api/baiviet');
// var apiChiTietSanPham=require('./api/chitietsanpham');
// var apiChiTietAnhSP=require('./api/chitietanhSP');
// var apiGioHang=require('./api/donhang');
// var apiAcount=require('./api/taikhoan');


var uploadfileAPI = require('./routes/uploadfile')

var routerMenu= require('./routes/menuApi');
var routerDanhmucxe=require('./routes/danhmucxeApi');
var routerSlide=require('./routes/slideApi');
var routerThuonghieu= require('./routes/thuonghieuApi');
var routerKhachhang= require('./routes/khachhangApi');
var routerNhacungcap=require('./routes/nhacungcapApi');
var routerDanhmuctintuc=require('./routes/danhmuctintucApi');
var routerXemay=require('./routes/xemayApi');
var routerAnhchitietxe=require('./routes/anhchitietxe');
var routerThongSoKyThuat=require('./routes/thongsokythuatApi');
var routerBinhLuan= require('./routes/binhluanApi');
var routerBaiviet=require('./routes/baivietApi');


var routerHoaDonNhap =require('./routes/hoadonnhapAPI');


var app = express();

const cors = require('cors');
    //
app.use(cors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    optionsSuccessStatus:200
}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.set('view engine', 'hbs');
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileupload());

app.use('/', indexRouter);
app.use('/users', usersRouter);
// app.use('/loaisp', apiloaispAPI);
// app.use('/sanpham', apisanphamAPI);

// app.use("/nhacungcap", apinccAPI);
// app.use("/nhasanxuat",apiNhaSanXuat);
// app.use("/menu",apiMenu);
// app.use("/phanhoi",apiPhanHoi);
// app.use("/slide",apiSlide);
// app.use("/loaiTin",apiLoaiTin);
// app.use("/baiviet",apiBaiViet);
// app.use("/ThongSoKyThuat",apiChiTietSanPham);
// app.use("/chitietanhSP",apiChiTietAnhSP);
// app.use("/donhang",apiGioHang);
// app.use("/taikhoan",apiAcount);


app.use("/menu",routerMenu);
app.use("/danh-muc-xe",routerDanhmucxe);
app.use("/slide",routerSlide);
app.use("/thuong-hieu",routerThuonghieu);
app.use("/khach-hang",routerKhachhang);
app.use("/nha-cung-cap",routerNhacungcap);
app.use("/danh-muc-tin-tuc",routerDanhmuctintuc);
app.use("/san-pham-xe-may",routerXemay);
app.use("/anh-chi-tiet-xe",routerAnhchitietxe);
app.use("/thong-so-ky-thuat",routerThongSoKyThuat);
app.use("/binh-luan",routerBinhLuan);
app.use("/bai-viet",routerBaiviet);
app.use("/hoa-don-nhap",routerHoaDonNhap);



app.use("/upload", uploadfileAPI);


app.use("/public/uploads/", express.static("public/uploads/"))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});



module.exports = app;