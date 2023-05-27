import { User } from "../models/Usuario";
import { verifyToken } from "../utils/token";
import { type NextFunction, type Response } from "express";

export const isAuth = async (req: any, res: Response, next: NextFunction): Promise<null> => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new Error("1No estas autorizado a realizar esta operacion");
    }

    // Verificamos y decodificamos el token
    const decodedInfo = verifyToken(token);
    const userFound = await User.findOne({ user: decodedInfo.userUser }).select("+password");
    if (!userFound) {
      throw new Error("2No estas autorizado a realizar esta operacion");
    }

    if (!userFound) {
      throw new Error("3No estas autorizado a realizar esta operacion");
    } else {
      console.log("Usuario encontrado por el middleware");
    }

    req.user = userFound;
    next();
    return null;
  } catch (error) {
    next(error);
    return null;
  }
};
