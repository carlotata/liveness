import pool from "../db.js";

export async function createAdmin(
  username,
  passwordHash,
  firstName,
  lastName,
  email,
) {
  const result = await pool.query(
    'INSERT INTO admins (username, password_hash, first_name, last_name, email) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, first_name as "firstName", last_name as "lastName", email, subscription_tier as "subscriptionTier", created_at',
    [username, passwordHash, firstName, lastName, email],
  );
  return result.rows[0];
}

export async function findAdminByUsername(username) {
  const result = await pool.query("SELECT * from admins WHERE username = $1", [
    username,
  ]);
  return result.rows[0];
}

export async function findAdminByEmail(email) {
  const result = await pool.query("SELECT * FROM admins WHERE email = $1", [
    email,
  ]);
  return result.rows[0];
}

export async function addToken(adminId, expiresAt, token_hash) {
  const result = await pool.query(
    "INSERT INTO password_reset_tokens(admin_id, expires_at, token_hash) VALUES($1, $2, $3)",
    [adminId, expiresAt, token_hash],
  );
  return result;
}

export async function findValidResetToken(tokenHash) {
  const result = await pool.query(
    "SELECT id, admin_id, expires_at, used_at FROM password_reset_tokens WHERE token_hash = $1",
    [tokenHash],
  );
  return result.rows[0];
}

export async function markTokenUsed(tokenId) {
  await pool.query(
    "UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1",
    [tokenId],
  );
}

export async function updateAdminPassword(adminId, passwordHash) {
  await pool.query("UPDATE admins SET password_hash = $1 WHERE id = $2", [
    passwordHash,
    adminId,
  ]);
}

export async function changePassword(adminId, newPasswordHashed) {
  const result = await pool.query(
    "UPDATE admins SET password_hash = $1 WHERE id = $2",
    [newPasswordHashed, adminId],
  );
  return result.rowCount;
}

export async function findAdminById(adminId) {
  const result = await pool.query(
    "SELECT id, password_hash FROM admins WHERE id = $1",
    [adminId],
  );
  return result.rows[0];
}