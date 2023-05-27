import express, { type NextFunction, type Request, type Response } from "express";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token";
import { isAuth } from "../middleware/usuario.middleware";

// Modelos
import { User } from "../models/User";

// Export de rutas
export const userRoutes = express.Router();

// Rutas
// CRUD: Read
// Ejemplo de request con parametros http://localhost:3000/author/?page=2&limit=10
userRoutes.get("/", (req: Request, res: Response, next: NextFunction) => {
  console.log("Estamos en el middleware / user que comprueba parámetros");

  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
      req.query.page = page as any;
      req.query.limit = limit as any;
      next();
    } else {
      console.log("Parámetros no válidos:");
      console.log(JSON.stringify(req.query));
      res.status(400).json({ error: "Params page or limit are not valid" });
    }
  } catch (error) {
    next(error);
  }
});

userRoutes.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Lectura de query parameters
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);
    const users = await User.find()
      .limit(limit)
      .skip((page - 1) * limit);

    // Conteo del total de elementos
    const totalElements = await User.countDocuments();

    const response = {
      totalItems: totalElements,
      totalPages: Math.ceil(totalElements / limit),
      currentPage: page,
      data: users,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// CRUD: Create
userRoutes.post("/", async (req: Request, res: Response, next: NextFunction) => {
  console.log("Creando usuario");
  try {
    const user = new User({
      name: req.body.name,
      lastname: req.body.lastname,
      password: req.body.password,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
    });

    const createdUser = await user.save();
    return res.status(200).json(createdUser);
  } catch (error) {
    next(error);
  }
});

// CRUD: Read
userRoutes.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id);

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

// No CRUD. Busqueda personalizada
userRoutes.get("/name/:name", async (req: Request, res: Response, next: NextFunction) => {
  const name = req.params.name;

  try {
    const user = await User.find({ name: new RegExp("^" + name.toLowerCase(), "i") });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: Delete con el middleware isAuth
userRoutes.delete("/:id", isAuth, async (req: any, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    console.log(req.author.user);
    if (req.user.id !== id && req.user.user !== "admin@gmail.com") {
      return res.status(401).json({ error: "No tienes permisos para realizar esta operacion." });
    }

    const userDeleted = await User.findByIdAndDelete(id);
    if (userDeleted) {
      res.json(userDeleted);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: Put con el middleware isAuth
userRoutes.put("/:id", isAuth, async (req: any, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    if (req.user.id !== id && req.user.user !== "admin@gmail.com") {
      return res.status(401).json({ error: "No tienes permisos para realizar esta operacion." });
    }
    const userToUpdate = await User.findById(id);
    if (userToUpdate) {
      Object.assign(userToUpdate, req.body); // Le asigna todo del body a la const
      await userToUpdate.save();
      // Eliminamos el password del objeto que devuelve
      const authorPasswordFiltered = userToUpdate.toObject();
      delete authorPasswordFiltered.password;
      res.json(userToUpdate);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

// Login de usuarios
userRoutes.post("/login", async (req: any, res: Response, next: NextFunction) => {
  try {
    // Declaracion de dos const con el mismo nombre que los campos que queremos del body
    const { email, password } = req.body;

    // Comprueba si hay usuario y contraseña
    if (!email || !password) {
      res.status(400).send("Falta el usuario o la contraseña.");
      return;
    }

    // Busca el usuario, seleccionando tambien el campo password
    const userFound = await User.findOne({ email }).select("+password");
    if (!userFound) {
      return res.status(401).json({ error: "Combinacion de usuario y password incorrecta" });
    }

    // Compara el password recibido con el guardado previamente encriptado
    const passwordMatches = await bcrypt.compare(password, userFound.password as string);
    if (passwordMatches) {
      // Eliminamos el password del objeto que devuelve
      const authorPasswordFiltered = userFound.toObject();
      delete authorPasswordFiltered.password;

      // Generamos token JWT
      const jwtToken = generateToken(userFound._id.toString(), userFound.name);

      console.log("Login correcto");

      return res.status(200).json({ token: jwtToken });
    } else {
      return res.status(401).json({ error: "Combinacion de usuario y password incorrecta" });
    }
  } catch (err) {
    next(err);
  }
});
