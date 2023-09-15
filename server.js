const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "32DWE0EFLTX456D7";

const { MongoClient, ObjectId } = require("mongodb");
const url =
  "mongodb+srv://urgumandrei:PasS321@cluster0.zbmcns8.mongodb.net/?retryWrites=true&w=majority";
const mongoClient = new MongoClient(url);

const app = express();
const PORT = 3030;

app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("style"));
app.use(express.static("img"));
app.use(express.static("script"));

const createPath = (page) =>
  path.resolve(__dirname, "ejs-views", `${page}.ejs`);

const getProducts = async () => {
  try {
    await mongoClient.connect();
    const db = mongoClient.db("clothes-shop");
    const collection = db.collection("products");
    const results = await collection.find().toArray();
    return results;
  } catch (err) {
    console.log(err);
  } finally {
    await mongoClient.close();
  }
};

const getUsers = async () => {
  try {
    await mongoClient.connect();
    const db = mongoClient.db("clothes-shop");
    const collection = db.collection("users");
    const results = await collection.find().toArray();
    return results;
  } catch (err) {
    console.log(err);
  } finally {
    await mongoClient.close();
  }
};

const addNewUser = async (user) => {
  try {
    await mongoClient.connect();
    const db = mongoClient.db("clothes-shop");
    const collection = db.collection("users");
    const results = await collection.insertOne(user);
    return results;
  } catch (err) {
    console.log(err);
  } finally {
    await mongoClient.close();
  }
};

app.get("/", (req, res) => {
  res.json("Hello world");
});

app.post("/service", (req, res) => {
  getProducts().then((products) => res.send(JSON.stringify(products)));
});

app.post("/find-user", (req, res) => {
  const reqUser = req.body;

  getUsers().then((users) => {
    const findUser = users.filter(
      (user) => user.name === reqUser.name && user.password === reqUser.password
    );
    if (findUser.length === 0) {
      res.send(JSON.stringify({ isFound: false }));
    } else {
      const token = jwt.sign({ name: reqUser.name }, SECRET_KEY);
      res.send(
        JSON.stringify({ isFound: true, user: findUser[0], token: token })
      );
    }
  });
});

app.post("/create-user", (req, res) => {
  const userData = req.body;

  getUsers().then((users) => {
    const checkNameUser = users.filter((user) => user.name === userData.name);
    const checkEmailUser = users.filter(
      (user) => user.email === userData.email
    );

    const response = {};

    if (checkNameUser.length !== 0) {
      response.name = false;
    } else {
      response.name = true;
    }

    if (checkEmailUser.length !== 0) {
      response.email = false;
    } else {
      response.email = true;
    }
    const token = jwt.sign({ name: userData.name }, SECRET_KEY);
    res.send(JSON.stringify({ ...response, token: token }));
  });
});

app.post("/add-user", (req, res) => {
  const newUser = req.body;
  const token = jwt.sign({ name: userData.name }, SECRET_KEY);

  addNewUser({ ...newUser, role: "user", token: token });
});

app.post("/sort", (req, res) => {
  const filterData = req.body;

  if (filterData.length !== 2) {
    getProducts().then((products) => {
      let filteredProducts = products.filter((product) => {
        if (filterData.category === "All") {
          return true;
        }
        return product.category === filterData.category;
      });

      filteredProducts = filteredProducts.filter((product) => {
        if (filterData.brand.length === 0) {
          return true;
        }
        return filterData.brand.includes(product.brand);
      });

      filteredProducts = filteredProducts.filter((product) => {
        if (filterData.for.length === 0) {
          return true;
        }
        return filterData.for.includes(product.for);
      });

      filteredProducts = filteredProducts.filter((product) => {
        if (filterData.size.length === 0) {
          return true;
        }
        return filterData.size.includes(product.size);
      });

      res.send(JSON.stringify(filteredProducts));
    });
  } else {
    getProducts().then((products) => {
      const filteredClothes = products.filter((product) =>
        filterData.includes(product.category)
      );
      console.log(filteredClothes);
      res.send(JSON.stringify(filteredClothes));
    });
  }
});

app.use((req, res) => {
  res.status(404).render(createPath("error"));
});

app.listen(PORT, (err) => {
  err ? console.log(err) : console.log(`Server is listening port ${PORT}`);
});
