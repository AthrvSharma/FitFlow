import jwt from "jsonwebtoken";
import type { IUser } from "../models/User";

const { JWT_SECRET = "super-secret-key", JWT_EXPIRES_IN = "7d" } = process.env;

export const generateToken = (user: IUser) => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

type DecodedToken = {
  sub: string;
  email: string;
  iat: number;
  exp: number;
};

export const verifyToken = (token: string): DecodedToken => {
  return jwt.verify(token, JWT_SECRET) as DecodedToken;
};
