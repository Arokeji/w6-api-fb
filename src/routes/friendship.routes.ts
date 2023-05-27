import express, { type NextFunction, type Request, type Response } from "express";

// Modelos
import { User } from "../models/User";
import { Friendship } from "../models/Friendship";

// Export de rutas
export const friendshipRoutes = express.Router();

friendshipRoutes.get("/", (req: Request, res: Response, next: NextFunction) => {
  console.log("Estamos en el middleware /friendship que comprueba parámetros");

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

friendshipRoutes.get("/", async (req: Request, res: Response, next: NextFunction) => {
  console.log("🧭 Lógica de /friendship en marcha.");
  try {
    // Lectura de query parameters
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);
    const friendships = await Friendship.find()
      .limit(limit)
      .skip((page - 1) * limit);

    // Conteo del total de elementos
    const totalElements = await Friendship.countDocuments();

    const response = {
      totalItems: totalElements,
      totalPages: Math.ceil(totalElements / limit),
      currentPage: page,
      data: friendships,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

friendshipRoutes.post("/send-request", async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId } = req.body;

    // Check if the sender and receiver exist in the User model
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: "Sender or receiver not found" });
    }

    // Create a new friendship document with the sender and receiver IDs
    const friendship = new Friendship({ sender: senderId, receiver: receiverId, status: "pending" });

    // Save the friendship document to the database
    await friendship.save();

    res.json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

friendshipRoutes.put("/respond-request", async (req: Request, res: Response) => {
  try {
    const { friendshipId, response } = req.body;

    // Find the friendship document by ID
    const friendship = await Friendship.findById(friendshipId);

    if (!friendship) {
      return res.status(404).json({ message: "Friendship not found" });
    }

    // Check if the friendship is already accepted or denied
    if (friendship.status !== "pending") {
      return res.status(400).json({ message: "Friendship request has already been responded to" });
    }

    if (response === "accept") {
      // Update the friendship status to "accepted"
      friendship.status = "accepted";
    } else if (response === "deny") {
      // Update the friendship status to "denied"
      friendship.status = "denied";
    } else {
      return res.status(400).json({ message: "Invalid response" });
    }

    // Save the updated friendship document
    await friendship.save();

    res.json({ message: "Friendship request responded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});
