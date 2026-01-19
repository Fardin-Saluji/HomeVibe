const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// 🔥 Listing Schema
const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  image: {
    url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    },
    filename: String,
  },

  price: {
    type: Number,
    required: true,
    min: 0,
  },

  location: {
    type: String,
    required: true,
  },

  country: {
    type: String,
    required: true,
  },

  // 🔥🔥 MOST IMPORTANT PART (MAPBOX)
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
  },

  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

module.exports = mongoose.model("Listing", listingSchema);