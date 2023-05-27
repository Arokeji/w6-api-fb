import express, { type NextFunction, type Request, type Response } from "express";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token";
import { isAuth } from "../middleware/usuario.middleware";

// Modelos
import { Post } from "../models/Post";
import { User } from "../models/User";
import { Group } from "../models/Group";

// Export de rutas
export const postRoutes = express.Router();

// Rutas
// CRUD: Read
postRoutes.get("/", (req: Request, res: Response, next: NextFunction) => {
  // Ejemplo de request con parametros http://localhost:3000/post/?page=2&limit=10
  console.log("🧭 Recogida de parametros en ruta /post en marcha.");

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

postRoutes.get("/", async (req: Request, res: Response, next: NextFunction) => {
  console.log("🧭 Lógica de /post en marcha.");
  try {
    // Lectura de query parameters
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);
    const posts = await Post.find()
      .limit(limit)
      .skip((page - 1) * limit);

    // Conteo del total de elementos
    const totalElements = await Post.countDocuments();

    const response = {
      totalItems: totalElements,
      totalPages: Math.ceil(totalElements / limit),
      currentPage: page,
      data: posts,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// CRUD: Create
postRoutes.post("/", async (req: Request, res: Response, next: NextFunction) => {
  console.log("Creando un nuevo post");
  try {
    const post = new Post({
      user: req.body.user,
      text: req.body.text,
      attachedFile: req.body.attachedFile,
      group: req.body.group,
    });

    const groupExists = await Group.findById(req.body.group);
    if (groupExists) {
      const createdPost = await post.save();
      return res.status(200).json(createdPost);
    } else {
      return res.status(404).json("Group does not exist.");
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: Read
postRoutes.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;

  try {
    const post = await Post.findById(id);

    if (post) {
      res.json(post);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

// No CRUD. Busqueda personalizada para texto
postRoutes.get("/text/:text", async (req: Request, res: Response, next: NextFunction) => {
  const text = req.params.text;

  try {
    const post = await Post.find({ name: new RegExp("^" + text.toLowerCase(), "i") });
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: Delete con el middleware isAuth
postRoutes.delete("/:id", isAuth, async (req: any, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    console.log(req.user.user);
    if (req.user.id !== id && req.user.name !== "superadmin") {
      return res.status(401).json({ error: "No tienes permisos para realizar esta operacion." });
    }

    const postDeleted = await Post.findByIdAndDelete(id);
    if (postDeleted) {
      res.json(postDeleted);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: Put con el middleware isAuth
postRoutes.put("/:id", isAuth, async (req: any, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    if (req.user.id !== id && req.user.name !== "superadmin") {
      return res.status(401).json({ error: "No tienes permisos para realizar esta operacion." });
    }
    const postToUpdate = await Post.findById(id);
    if (postToUpdate) {
      Object.assign(postToUpdate, req.body); // Le asigna todo del body a la const
      await postToUpdate.save();
      // Eliminamos el password del objeto user
      const userPasswordFiltered = req.user.toObject();
      delete userPasswordFiltered.password;
      res.json(postToUpdate);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

// Login de usuarios
postRoutes.post("/login", async (req: any, res: Response, next: NextFunction) => {
  try {
    // Declaracion de dos const con el mismo nombre que los campos que queremos del body
    const { id, password } = req.body;

    // Comprueba si hay usuario y contraseña
    if (!id || !password) {
      res.status(400).send("Falta el id o la contraseña del usuario.");
      return;
    }

    // Busca el usuario, seleccionando tambien el campo password
    const userFound = await User.findOne({ id }).select("+password");
    if (!userFound) {
      return res.status(401).json({ error: "Combinacion de usuario y password incorrecta" });
    }

    // Compara el password recibido con el guardado previamente encriptado
    const passwordMatches = await bcrypt.compare(password, userFound.password as string);
    if (passwordMatches) {
      // Eliminamos el password del objeto que devuelve
      const userPasswordFiltered = userFound.toObject();
      delete userPasswordFiltered.password;

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
