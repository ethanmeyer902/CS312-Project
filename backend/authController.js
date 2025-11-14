import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "./db/db.js"; // adjust path if needed

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if email already exists
        const existing = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // Hash the password
        const hashed = await bcrypt.hash(password, 10);

        // Insert new user
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash) 
             VALUES ($1, $2, $3)
             RETURNING user_id, name, email`,
            [name, email, hashed]
        );

        res.json({
            message: "Signup successful",
            user: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        const user = result.rows[0];
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Compare password
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Create JWT
        const token = jwt.sign(
            { user_id: user.user_id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Signin successful",
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
