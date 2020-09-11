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
  return mongoose.model('User', UserSchema);
};
