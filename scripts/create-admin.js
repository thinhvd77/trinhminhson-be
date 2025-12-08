#!/usr/bin/env node

const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createAdminUser() {
  const email = process.env.ADMIN_EMAIL || "admin@blog.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Admin User";

  console.log("🔧 Creating admin user...");
  console.log(`Email: ${email}`);
  console.log(`Name: ${name}`);
  console.log("");

  try {
    // Check if user already exists
    const checkResult = await pool.query(
      "SELECT id, email FROM users WHERE email = $1",
      [email]
    );

    if (checkResult.rows.length > 0) {
      console.log("⚠️  User already exists!");
      console.log(`User ID: ${checkResult.rows[0].id}`);
      console.log(`Email: ${checkResult.rows[0].email}`);
      console.log("");
      console.log("To update password, delete the user first or use a different email.");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (email, name, password, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, email, name, is_active`,
      [email, name, hashedPassword, true]
    );

    const user = result.rows[0];

    console.log("✅ Admin user created successfully!");
    console.log("");
    console.log("User Details:");
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Active: ${user.is_active}`);
    console.log("");
    console.log("Login Credentials:");
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    console.log("");
    console.log("⚠️  IMPORTANT: Change the password after first login!");

  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createAdminUser();
