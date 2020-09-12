/**
 * 用户表
 */
const bcrypt = require("bcrypt")
// 加密权重
const SALT_WORK_FACTOR = 10

module.exports = app => {
  const mongoose = app.mongoose;
  const UserSchema = new mongoose.Schema({
    role: {
      type: String,
      default: 'user'
    },
    uuid: String,
    username: String,
    password: String,
    meta: {
      createdAt: {
        type: Date,
        default: Date.now()
      },
      updateAt: {
        type: Date,
        default: Date.now()
      }
    }
  })

  // 中间件
  UserSchema.pre('save', function (next) {
    if (this.isNew) {
      this.meta.createdAt = this.meta.updateAt = Date.now()
    } else {
      this.meta.updateAt = Date.now()
    }
    next()
  })

  UserSchema.pre('save', function (next) {
    let user = this
    if(!user.isModified('password')) {
      return next()
    }

    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
      if (err) return next(err)
      bcrypt.hash(user.password, salt, (error, hash) => {
        if (error) return next(error)

        user.password = hash

        next()
      })
    })
    
  })

  // 静态方法
  UserSchema.methods = {
    comparePassword: function (_password, password) {
      return new Promise((resolve, reject) => {
        bcrypt.compare(_password, password, function (err, isMatch) {
          if(!err) {
            resolve(isMatch)
          } else {
            reject(err)
          }
        })
      })
    }
  }

  return mongoose.model('User', UserSchema);
};
