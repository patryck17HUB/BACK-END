const jwt = require('jsonwebtoken');

module.exports = (req,res,next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, "debugkey");
        req.user = decoded;
        const role_name = req.user.role;

        if (role_name !== 'admin') {
            return res.status(403).json({code: 403, message: "Debes ser administrador para ingresar a esta ruta"});
        }
        next();
    }
    catch (error) {
        return res.status(401).json({ code: 401, message: "No tienes permiso :("});

    }
}