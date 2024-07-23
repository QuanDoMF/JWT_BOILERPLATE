
export const corsOptions = {
  origin: function (origin, callback) {
    return callback(null, true)
  },

  optionsSuccessStatus: 200,
  credentials: true,
}


