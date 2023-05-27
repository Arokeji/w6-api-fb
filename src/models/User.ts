import validator from "validator";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const validGender = ["MUJER, HOMBRE, PERSONALIZADO"]

export interface IUser {
  name: string;
  lastname: string;
  email: string;
  phoneNumber: number;
  password?: string;
  dateOfBirth: number;
  gender: string;

}

// Creacion del esquema del usuario
const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
    minLength: [3, "No se ha alcanzado el minimo de caracteres"],
    maxLength: [50, "Se ha superado el maximo de caracteres"],
  },
  lastname: {
    type: String,
    required: true,
    trim: true,
    minLength: [3, "No se ha alcanzado el minimo de caracteres"],
    maxLength: [50, "Se ha superado el maximo de caracteres"],
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    required: true,
    validate: {
      validator: (text: string) => validator.isEmail(text),
      message: "El usuario debe ser un email.",
    },
  },
  phoneNumber: {
    type: Number,
    trim: true,
    unique: true,
    required: true,
    validate: {
      validator: (value: number) => validator.isMobilePhone(value.toString(), ["es-ES"]),
      message: "Debe ser un numero de teléfono móvil.",
    },
  },
  password: {
    type: String,
    trim: true,
    minLength: [8, "La contraseña debe contener un minimo de 8 caracteres"],
    select: false, // Indica que no se muestra en las consultas
    required: true,
  },

  dateOfBirth: {
    type: Number,
    trim: true,
    unique: true,
    required: true,
    validate: {
      validator: (value: number) => validator.isDate(value.toString()),
      message: "Debe ser un numero fecha valida.",
    },
  },
  gender: {
    type: String,
    required: false,
    trim: true,
    uppercase: true,
    enum: validGender,
  },

});

// Encriptado de la contraseña antes de que guarde
// Usamos function en vez de una arrow para que pueda leer el this fuera de esta
userSchema.pre("save", async function (next) {
  try {
    // Si la contraseña ya estaba encriptada no la encripta de nuevo
    if (this.isModified("password")) {
      const saltRounds = 10; // Dureza del ecriptado
      const hash = await bcrypt.hash(this.password as string, saltRounds);
      this.password = hash;
    }

    next();
  } catch (error: any) {
    next(error);
  }
});

// Creacion del modelo en si con un nombre y la configuracion del esquema
export const User = mongoose.model<IUser>("User", userSchema);
