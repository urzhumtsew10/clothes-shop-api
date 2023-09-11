const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

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

app.get("/", (req, res) => {
  res.json("Hello world");
});

app.post("/service", (req, res) => {
  getProducts().then((products) => res.send(JSON.stringify(products)));
});

app.post("/seasonal-clothes", (req, res) => {
  const seasonalClothes = req.body;

  getProducts().then((products) => {
    const filteredProducts = products.filter((product) =>
      seasonalClothes.includes(product.category)
    );
    res.send(JSON.stringify(filteredProducts));
  });
});

app.post("/sort", (req, res) => {
  const filterData = req.body;

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
});

app.use((req, res) => {
  res.status(404).render(createPath("error"));
});

app.listen(PORT, (err) => {
  err ? console.log(err) : console.log(`Server is listening port ${PORT}`);
});
