import express, { type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import fs from "fs";

// Modelos
import { Group } from "../models/Group";
import { User } from "../models/User";

// Export de rutas
export const groupRoutes = express.Router();

// Configuracion de Multer para subida de archivos
const upload = multer({ dest: "public" });

// Rutas
// CRUD: Read
// Ejemplo de request con parametros http://localhost:3000/book/?page=2&limit=10
groupRoutes.get("/", (req: Request, res: Response, next: NextFunction) => {
  console.log("Estamos en el middleware /group que comprueba parámetros");

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

groupRoutes.get("/", async (req: Request, res: Response) => {
  try {
    // Lectura de query parameters
    const { page, limit } = req.query as any;
    const groups = await Group.find()
      .limit(limit)
      .skip((page - 1) * limit)
      .populate("users");

    // Conteo del total de elementos
    const totalElements = await Group.countDocuments();

    const response = {
      totalItems: totalElements,
      totalPages: Math.ceil(totalElements / limit),
      currentPage: page,
      data: groups,
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

// CRUD: Create
groupRoutes.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const group = new Group({
      admin: req.body.admin,
      users: req.body.users,
      groupName: req.body.groupName,
      coverImage: req.body.coverImage,
    });
    const createdGroup = await group.save();
    return res.status(200).json(createdGroup);
  } catch (error) {
    next(error);
  }
});

// CRUD: Read
groupRoutes.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;

  try {
    const group = await Group.findById(id).populate("users");

    if (group) {
      const users = await User.findById(group.users); // en vez de { users: id }
      const tempGroup = group.toObject();
      tempGroup.users = users as any;
      res.json(tempGroup);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

// No CRUD. Busqueda personalizada
groupRoutes.get("/title/:title", async (req: Request, res: Response, next: NextFunction) => {
  const title = req.params.title;

  try {
    const group = await Group.find({ title: new RegExp("^" + title.toLowerCase(), "i") }).populate("users");
    if (group) {
      res.json(group);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: Delete
groupRoutes.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const groupDeleted = await Group.findByIdAndDelete(id);
    if (groupDeleted) {
      res.json(groupDeleted);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: Put
groupRoutes.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const groupUpdated = await Group.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (groupUpdated) {
      res.json(groupUpdated);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

groupRoutes.post("/cover-upload", upload.single("cover"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Renombrado de la imagen
    const originalName = req.file?.originalname as string;
    const path = req.file?.path as string;
    const newPath = `${path}_${originalName}`;
    // Asigna a la propiedad path el valor de newPath
    fs.renameSync(path, newPath);

    // Busqueda del libro por ID
    const groupId = req.body.groupId;
    const group = await Group.findById(groupId);

    if (group) {
      group.coverImage = newPath;
      await group.save();
      res.json(group);
      console.log("✅ Cover uploaded and added succesfully.");
    } else {
      // Borra la imagen si no existe el libro
      fs.unlinkSync(newPath);
      res.status(404).send("Group not found. Please specify another Id.");
    }
  } catch (error) {
    next(error);
  }
});
