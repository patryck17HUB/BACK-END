const db = require('../config/database');

const getAllAccounts = async (req, res, next) => {
    const user_id = req.user.user_id;

    try {
        const query = 'SELECT * FROM accounts WHERE user_id = ?';
        const rows = await db.query(query, [user_id]);

        if (rows.length > 0) {
            return res.status(200).json({ code: 200, message: rows });
        } else {
            return res.status(404).json({ code: 404, message: "No hay cuentas" });
        }
    } catch (error) {
        console.error(error);  // Agregar logging para los errores
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};

const getAccountById = async (req, res, next) => {
    const user_id = req.user.user_id;
    const { account_id } = req.params;  // Usa params en lugar de body para ID
    try {
        const query = 'SELECT * FROM accounts WHERE user_id = ? AND account_id = ?';
        const rows = await db.query(query, [user_id, account_id]);

        if (rows.length > 0) {
            return res.status(200).json({ code: 200, message: rows });
        } else {
            return res.status(404).json({ code: 404, message: "No se encontró la cuenta" });
        }
    } catch (error) {
        console.error(error);  // Agregar logging para los errores
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};

const createAccount = async (req, res, next) => {
    const user_id = req.user.user_id;
    const { account_type, balance } = req.body;

    // Función para generar un número de tarjeta aleatorio con el algoritmo de Luhn
    const generateCardNumber = () => {
        let cardNumber = '400000'; // Simulando que las tarjetas son de un banco que empieza con '400000'

        // Generar los siguientes 9 dígitos aleatoriamente
        for (let i = 0; i < 9; i++) {
            cardNumber += Math.floor(Math.random() * 10);
        }

        // Calcular el dígito de control (algoritmo de Luhn)
        const luhnCheck = (num) => {
            let sum = 0;
            let shouldDouble = false;

            // Recorremos los números de derecha a izquierda
            for (let i = num.length - 1; i >= 0; i--) {
                let digit = parseInt(num[i]);

                if (shouldDouble) {
                    digit *= 2;
                    if (digit > 9) digit -= 9;
                }

                sum += digit;
                shouldDouble = !shouldDouble;
            }

            return sum % 10 === 0 ? 0 : 10 - (sum % 10);
        };

        const checkDigit = luhnCheck(cardNumber);
        cardNumber += checkDigit.toString(); // Añadir el dígito de control

        return cardNumber;
    };

    // Función para verificar si el número de tarjeta ya existe
    const cardNumberExists = async (card_number) => {
        const checkQuery = 'SELECT COUNT(*) AS count FROM accounts WHERE card_number = ?';
        const result = await db.query(checkQuery, [card_number]);
        return result[0].count > 0;
    };

    if (account_type && balance) {
        try {
            let card_number;

            // Generar un número de tarjeta único
            let isUnique = false;
            while (!isUnique) {
                card_number = generateCardNumber();
                isUnique = !(await cardNumberExists(card_number)); // Verificar si ya existe
            }

            // Consulta para insertar la cuenta con el número de tarjeta único
            const query = 'INSERT INTO accounts (user_id, account_type, balance, card_number) VALUES (?, ?, ?, ?)';
            const result = await db.query(query, [user_id, account_type, balance, card_number]);

            if (result.affectedRows === 1) {
                return res.status(201).json({ code: 201, message: "Cuenta creada correctamente", card_number });
            } else {
                return res.status(500).json({ code: 500, message: "Ocurrió un error al crear la cuenta" });
            }
        } catch (error) {
            console.error(error);  // Agregar logging para los errores
            return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
        }
    } else {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }
};


const deleteAccount = async (req, res, next) => {
    const user_id = req.user.user_id;
    const { account_id } = req.params;  // Usa params en lugar de body para ID

    try {
        const query = 'DELETE FROM accounts WHERE user_id = ? AND account_id = ?';
        const result = await db.query(query, [user_id, account_id]);

        if (result.affectedRows === 1) {
            return res.status(200).json({ code: 200, message: "Cuenta eliminada correctamente" });
        } else {
            return res.status(404).json({ code: 404, message: "Cuenta no encontrada" });
        }
    } catch (error) {
        console.error(error);  // Agregar logging para los errores
        return res.status(500).json({ code: 500, message: "Error en el servidor", error: error.message });
    }
};

module.exports = {
    getAllAccounts,
    getAccountById,
    createAccount,
    deleteAccount
};
