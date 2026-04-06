// if (process.env.NODE_ENV !== "production") {
//     require("dotenv").config();
// }

require("dotenv").config();


// console.log("✅ Key ID:", process.env.RAZORPAY_KEY_ID);
// console.log("✅ Key Secret:", process.env.RAZORPAY_KEY_SECRET);
// console.log(process.env.SECRET)

const express = require("express")
const app = express();
const mongoose = require("mongoose")
const path = require('path');
const methodOverride = require("method-override")
const ejsMate = require('ejs-mate')
const ExpressError = require("./utils/ExpressError.js")
const session = require("express-session")
const MongoStore = require('connect-mongo');
const flash = require("connect-flash")

const lisitngsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js")



const passport = require("passport")
const localStrategy = require('passport-local')
const User = require("./models/user.js")

//let MONGO_URL = 'mongodb://127.0.0.1:27017/wanderer'
const dbUrl = process.env.ATLASDB_URL;

// const instance = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// const processPayment=(req,res)=>{
//     res.status(200).json({
//         success:true
//     })
// }

// app.route("/payment/process").post( processPayment)

main()
    .then(() => {
        console.log('connected to DB');
    })
    .catch((err) => {
        console.log(err);
    })

async function main() {
    await mongoose.connect(dbUrl)
}

// View engine setup
app.set('views', path.join(__dirname, 'views'))
app.set("view engine", 'ejs')
app.engine('ejs', ejsMate);

// Middleware - Body parsing and utilities
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, '/public')))

// Session and MongoStore setup
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
})

store.on("error", () => {
    console.log("ERROR in mongo sesssion Store");
})

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
}

// Session middleware
app.use(session(sessionOptions))
app.use(flash())

// Passport authentication setup
app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// ✅ CRITICAL: Global middleware to set currUser and flash messages in all templates
app.use((req, res, next) => {
    res.locals.success = req.flash("success") || [];  // Default to empty array
    res.locals.error = req.flash("error") || [];      // Default to empty array
    res.locals.currUser = req.user || null;           // Always defined (null if not logged in)
    next();
})




app.use('/listings', lisitngsRouter);
app.use('/listings/:id/reviews', reviewsRouter)
app.use('/', userRouter)


app.all(/^.*$/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!!"))
})

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message })
    // res.status(statusCode).send(message);
});




app.listen(8080, () => {
    console.log("server is listening to port 8080");

})