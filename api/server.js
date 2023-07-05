const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const SessionStore = require("connect-session-knex")(session);
//session'ı sakladığımız store. bu store connect-session-knex kütüphanesini import edecek, session da parametre
/**
  Kullanıcı oturumlarını desteklemek için `express-session` paketini kullanın!
  Kullanıcıların gizliliğini ihlal etmemek için, kullanıcılar giriş yapana kadar onlara cookie göndermeyin. 
  'saveUninitialized' öğesini false yaparak bunu sağlayabilirsiniz
  ve `req.session` nesnesini, kullanıcı giriş yapana kadar değiştirmeyin.

  Kimlik doğrulaması yapan kullanıcıların sunucuda kalıcı bir oturumu ve istemci tarafında bir cookiesi olmalıdır,
  Cookienin adı "cikolatacips" olmalıdır.

  Oturum memory'de tutulabilir (Production ortamı için uygun olmaz)
  veya "connect-session-knex" gibi bir oturum deposu kullanabilirsiniz.
 */

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

const authRouter = require("./auth/auth-router");
const userRouter = require("./users/users-router");

server.use(
  session({
    name: "cikolatacips",
    secret: "secret_cikolatacips", //istediğimiz isim
    cookie: {
      maxAge: 1000 * 60 * 60, //1 saat cookinin ömrü
      secure: false,
      httpOnly: true,
    },
    resave: true, //tekrar üstüne kaydetsin
    saveUninitialized: false, //kendisi yaratmasın ben istediğimde yaratsın
    store: new SessionStore({
      knex: require("../data/db-config"),
      tableName: "sessions", //kendisi bu tabloyu yarattı
      sidFieldName: "sid",
      createTable: true,
      clearInterval: 1000 * 60 * 60, //1 saat
    }),
  })
);
server.use("/api/auth",authRouter);
server.use("/api/users",userRouter);

server.get("/", (req, res) => {
  res.json({ api: "up" });
});

server.use((err, req, res, next) => {
  // eslint-disable-line
  res.status(err.status || 500).json({
    message: err.message,
    stack: err.stack,
  });
});

module.exports = server;
