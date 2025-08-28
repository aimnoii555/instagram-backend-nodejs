import bcrypt from 'bcrypt';

export async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plain, salt);
}

export function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}
