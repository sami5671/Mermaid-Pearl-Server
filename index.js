const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(cookieParser());
// =================================================================
// ==========================custom middleware =======================================
const logger = (req, res, next) => {
  console.log("log: info: ", req.method, req.url);
  next();
};

const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  // console.log("token in the middlware: ", token);

  // no token available
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};
//================================================================

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

    // ==================================auth apis===============================================================
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .send({ success: true });
    });

    // =================================================================================================

    // =====================================Get the rooms data============================================================
    app.get("/room", async (req, res) => {
      const cursor = allRoomsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // ========================get a booking room info=========================================
    // ===================update a booking room info ==============================================
    app.get("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        projection: {
          CustomerName: 1,
          name: 1,
          email: 1,
          checkIn: 1,
          checkOut: 1,
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
      const result = await roomBookingsCollection.findOne(query, options);
      res.send(result);
    });

    // app.put("/bookings/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const filter = { _id: new ObjectId(id) };
    //   const options = { upsert: true };
    //   const updateBookingRoom = req.body;

    //   console.log("Received id:", id);
    //   console.log("Received update data:", updateBookingRoom);

    //   const BookingRoom = {
    //     $set: {
    //       CustomerName: updateBookingRoom.Cname,
    //       // Add other fields here
    //     },
    //   };

    //   const result = await roomBookingsCollection.updateOne(
    //     filter,
    //     BookingRoom,
    //     options
    //   );

    //   console.log("Update result:", result);

    //   res.send(result);
    // });

    // app.put("/bookings/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const filter = { _id: new ObjectId(id) };
    //   const options = { upsert: true };
    //   const updateBookingRoom = req.body;

    //   const BookingRoom = {
    //     $set: {
    //       CustomerName: updateBookingRoom.Cname,
    //       name: updateBookingRoom.name,
    //       email: updateBookingRoom.email,
    //       checkIn: updateBookingRoom.date1,
    //       checkOut: updateBookingRoom.date2,
    //       price: updateBookingRoom.price,
    //       description: updateBookingRoom.description,
    //       image1: updateBookingRoom.image1,
    //       image2: updateBookingRoom.image2,
    //       image3: updateBookingRoom.image3,
    //       image4: updateBookingRoom.image4,
    //       specialoffer: updateBookingRoom.specialoffer,
    //     },
    //   };
    //   const result = await roomBookingsCollection.updateOne(
    //     filter,
    //     BookingRoom,
    //     options
    //   );
    //   console.log(result);
    //   res.send(result);
    // });
    // =================================================================

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
    // ================================get user specific booking info =================================================================
    app.get("/bookings", logger, verifyToken, async (req, res) => {
      console.log(req.query.email);
      // --------------------------------------
      if (req.user.email !== req.query.email) {
        return res.status(403).send({ message: "Forbidden access" });
      }
      // ---------------------------------
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const cursor = roomBookingsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    // ========================update booking confirmation===============================
    app.patch("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedBooking = req.body;
      console.log(updatedBooking);

      const updateDoc = {
        $set: {
          status: updatedBooking.status,
          checkIn: updatedBooking.date1,
          checkOut: updatedBooking.date2,
        },
      };
      const result = await roomBookingsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // =================delete a booking info================================================
    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roomBookingsCollection.deleteOne(query);
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
