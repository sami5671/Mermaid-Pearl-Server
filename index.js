const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(express.json());
app.use(cors());

// =================================================================

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fmvmv30.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // =========================Creating the database========================================
    const allRoomsCollection = client.db("mermaidHotel").collection("rooms");
    const roomBookingsCollection = client
      .db("mermaidHotel")
      .collection("bookings");
    // =================================================================================================

    // =====================================Get the rooms data============================================================
    app.get("/room", async (req, res) => {
      const cursor = allRoomsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // =======================get a room info=========================================
    app.get("/roomdetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        projection: {
          name: 1,
          description: 1,
          price: 1,
          availability: 1,
          image1: 1,
          image2: 1,
          image3: 1,
          image4: 1,
          specialoffer: 1,
        },
      };
      const result = await allRoomsCollection.findOne(query, options);
      res.send(result);
    });
    // ======================get a book room info==========================================
    app.get("/book/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        projection: {
          name: 1,
          description: 1,
          price: 1,
          availability: 1,
          image1: 1,
          image2: 1,
          image3: 1,
          image4: 1,
          specialoffer: 1,
        },
      };
      const result = await allRoomsCollection.findOne(query, options);
      res.send(result);
    });

    // ================================post booking info =================================================================
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await roomBookingsCollection.insertOne(booking);
      res.send(result);
    });
    // =================================================================================================
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// =================================================================
app.get("/", (req, res) => {
  res.send("Hotel server is Running");
});
app.listen(port, () => {
  console.log(`Hotel Server is running on port ${port}`);
});
