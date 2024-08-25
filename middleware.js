const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");
module.exports.isLoggedIn = (req,res,next)=>{

if(!req.isAuthenticated()){
  req.session.redirectUrl = req.originalUrl;
    req.flash("error","You are not logged in!");
    res.redirect("/login");
  }
  next();
}

module.exports.saveRedirectUrl = (req,res,next) =>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};
module.exports.isOwner = async (req, res, next) => {
  try {
      let { id } = req.params;
      let listing = await Listing.findById(id);

      if (!listing) {
          req.flash("error", "Listing not found!");
          return res.redirect('/listings');
      }

      // Ensure currUser is defined and check ownership
      if (!res.locals.currUser || !listing.owner.equals(res.locals.currUser._id)) {
          req.flash("error", "You are not the owner of this listing!");
          return res.redirect(`/listings/${id}`);
      }

      next(); // Only call next if the user is the owner
  } catch (err) {
      console.error(err);

      // Prevent setting headers after they've been sent
      if (!res.headersSent) {
          req.flash("error", "Something went wrong!");
          res.redirect('/listings');
      }
  }
};



module.exports.validateListing = (req,res,next) =>{
    let {error} =listingSchema.validate(req.body);
    if(error){
      let errMsg = error.details.map((el)=> el.message).join(",");
      throw new ExpressError(400,errMsg);
    } else{
      next();
    }
}

module.exports.validateReview = (req,res,next)=>{
  let {error} =reviewSchema.validate(req.body);
  if(error){
    let errMsg = error.details.map((el)=> el.message).join(",");
    throw new ExpressError(400,errMsg);
  } else{
    next();
  }
}
module.exports.isReviewAuthor  = async (req, res, next) => {
  try {
      let { id,reviewId } = req.params;
      let review = await Review.findById(reviewId);


      // Ensure currUser is defined and check ownership
      if (!res.locals.currUser || !review.author.equals(res.locals.currUser._id)) {
          req.flash("error", "You did not create this review!");
          return res.redirect(`/listings/${id}`);
      }

      next(); // Only call next if the user is the owner
  } catch (err) {
      console.error(err);

      // Prevent setting headers after they've been sent
      if (!res.headersSent) {
          req.flash("error", "Something went wrong!");
          res.redirect('/listings');
      }
  }
};

