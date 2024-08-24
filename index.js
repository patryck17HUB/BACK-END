const express = require('express');
const morgan = require('morgan');
const app = express();

//Settings
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
const banco = require('./routes/banco');
const users = require('./routes/users');

//Middlewares
//const auth = require('./middleware/auth');
const notFound = require('./middleware/notFound');
const index = require('./middleware/index');
//const cors = require('./middleware/cors');

app.get('/', index);

app.use("/banco", banco);
app.use("/users", users);

//app.use(auth);

app.use(notFound);

app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port 3000');
});