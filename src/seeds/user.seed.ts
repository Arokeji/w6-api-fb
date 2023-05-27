import mongoose from "mongoose";
import { connect } from "../db.js";
import { User } from "../models/User";
// import faker = require("@faker-js/faker");

const userSeed = async (): Promise <void> => {
  try {
    // Conexion
    await connect();
    console.log("Conexion desde el seed satisfactoria");

    // Borrado de datos
    await User.collection.drop();
    console.log("Limpieza de la coleccion Author realizada");

    const userList = [
      { email: "gabri@gmail.com", password: "12345678", phoneNumber: "611111111", name: "Gabriel", lastname: "García Márquez", gender: "HOMBRE", dateOfBirth: "2005/5/10" },
      { email: "jane@gmail.com", password: "12345678", phoneNumber: "622222222", name: "Jane", lastname: "Austen", gender: "MUJER", dateOfBirth: "2005/5/11" },
      { email: "leo@gmail.com", password: "12345678", phoneNumber: "63333333", name: "Leo", lastname: "Tolstoy", gender: "HOMBRE", dateOfBirth: "2005/5/12" },
      { email: "virginia@gmail.com", password: "12345678", phoneNumber: "644444444", name: "Virginia", lastname: "Woolf", gender: "MUJER", dateOfBirth: "2005/5/13" },
      { email: "ernest@gmail.com", password: "12345678", phoneNumber: "655555555", name: "Ernest", lastname: "Hemingway", gender: "HOMBRE", dateOfBirth: "2005/5/14" },
      { email: "jorge@gmail.com", password: "12345678", phoneNumber: "6666666666", name: "Jorge Luis", lastname: "Borges", gender: "HOMBRE", dateOfBirth: "2005/5/15" },
      { email: "franz@gmail.com", password: "12345678", phoneNumber: "677777777", name: "Franz", lastname: "Kafka", gender: "PERSONALIZADO", dateOfBirth: "2005/5/16" },
      { email: "toni@gmail.com", password: "12345678", phoneNumber: "688888888", name: "Toni", lastname: "Morrison", gender: "HOMBRE", dateOfBirth: "2005/5/17" },
      { email: "haruki@gmail.com", password: "12345678", phoneNumber: "619999999", name: "Haruki", lastname: "Murakami", gender: "HOMBRE", dateOfBirth: "2005/5/18" },
      { email: "chinua@gmail.com", password: "12345678", phoneNumber: "623456789", name: "Chinua", lastname: "Achebe", gender: "HOMBRE", dateOfBirth: "2005/5/19" },
    ];

    // GENERACION DE AUTORES ALEATORIOS
    // for (let i = 0; i < 5; i++) {
    //   let newAuthor = {};
    //   try {
    //     newAuthor = {
    //       name: faker.lorem.words(2),
    //       country: faker.address.country()
    //     };
    //   } catch (error) {
    //     console.error(error);
    //     console.log(error);
    //   }
    //   authorList.push(newAuthor);
    // }

    // Insercion de usuarios
    const documents = userList.map((user) => new User(user));
    // Encriptado de contraseñas de los usuarios del seed
    for (let i = 0; i < documents.length; i++) {
      const document = documents[i];
      await document.save();
    }
    // await Author.insertMany(documents); No ponemos este porque el hash de encriptado lo hace mediante Save
    console.log("Datos insertados correctamente");
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
};

void userSeed();
