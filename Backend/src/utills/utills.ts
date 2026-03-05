import * as bcrypt from 'bcrypt';

export async function hashedPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  const hash: string = await bcrypt.hash(password, salt);
  return hash;
}

export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  const isMatch: boolean = await bcrypt.compare(password, hash);
  return isMatch;
};
