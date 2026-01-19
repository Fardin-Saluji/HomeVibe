const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// ---------------- INDEX ----------------
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

// ---------------- NEW FORM ----------------
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// ---------------- SHOW ----------------
module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

// ---------------- CREATE ----------------
module.exports.createListing = async (req, res) => {
  // 🌍 Geocode location
  const geoResponse = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  if (!geoResponse.body.features.length) {
    req.flash("error", "Location not found. Please enter a valid location.");
    return res.redirect("/listings/new");
  }

  const newListing = new Listing(req.body.listing);

  // ✅ Save geometry (MAP FIX)
  newListing.geometry = geoResponse.body.features[0].geometry;

  // ✅ Save image safely
  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  newListing.owner = req.user._id;

  await newListing.save();

  req.flash("success", "New Listing Created!");
  res.redirect(`/listings/${newListing._id}`);
};

// ---------------- EDIT FORM ----------------
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  const originalImageUrl = listing.image.url.replace(
    "/upload",
    "/upload/w_250"
  );

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// ---------------- UPDATE ----------------
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true }
  );

  // 🔁 Optional: re-geocode if location changed
  if (req.body.listing.location) {
    const geoResponse = await geocodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
      .send();

    if (geoResponse.body.features.length) {
      listing.geometry = geoResponse.body.features[0].geometry;
    }
  }

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  await listing.save();

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

// ---------------- DELETE ----------------
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
