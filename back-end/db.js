const mongoose = require('mongoose');
mongoose.connect('mongodb://http://127.0.0.1:8000/userInfo');

let db = mongoose.connection;
mongoose.Promise = golbal.Promise;

db.on('error', function() {
    console.log('数据库连接出错');
})

db.on('open', function() {
    console.log('数据库连接成功');
})

const userSchema = mongoose.Schema({
    username: String,
    password: String,
    token: String,
    create_time: Date
})

const User = mongoose.model('User', userSchema)

module.exports = User;