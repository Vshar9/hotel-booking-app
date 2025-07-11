import express, { Request, RequestHandler, Response } from "express";
import Hotel from "../models/hotel";
import { BookingType, HotelSearchResponse } from "../shared/types";
import { param, validationResult } from "express-validator";
import Stripe from "stripe";
import verifyToken from "../middleware/auth";

const stripe = new Stripe(process.env.STRIPE_API_KEY as string)
const router = express.Router();

const fetchSingleHotel : RequestHandler = async(req: Request,res: Response)=>{
    const errors =validationResult(req);
    if(!errors.isEmpty()){
        res.status(400).json({errors:errors.array()});
        return;
    }

    const id = req.params.id.toString();
    try{
        const hotel = await Hotel.findById(id);
        res.json(hotel);
        return;
    }
    catch(error){
        res.status(500).json({message: "Error fetching hotel"});
        return;
    }

}

const bookingHandler : RequestHandler = async(req: Request, res: Response)=>{
    try{
        const paymentIntentId = req.body.paymentIntentId;

        const paymentIntent = await stripe.paymentIntents.retrieve(
            paymentIntentId as string
        );

        if(!paymentIntent){
            res.status(400).json({message: "payment intent not found"})
            return;
        }

        if(paymentIntent.metadata.hotelId !== req.params.hotelId ||
            paymentIntent.metadata.userId !== req.userId){
            res.status(400).json({message: "payment intent mismatch"})
            return
        }
        
        if(paymentIntent.status !=="succeeded"){
            res.status(400).json({ message: `payment intent not successful. Status: ${paymentIntent.status}`})
        }

        const newBooking: BookingType = {
            ...req.body,
            userId: req.userId
        }

        const hotel = await Hotel.findOneAndUpdate({_id: req.params.hotelId}, {
            $push: {bookings: newBooking},
        });

        if(!hotel){
            res.status(400).json({message: "hotel not found"})
        }

        await hotel?.save();
        res.status(200).send();
    }catch(error){
        console.log(error);
        res.status(500).json({message: "something went wrong"});
    }
}

router.post("/:hotelId/bookings",verifyToken,bookingHandler)

const constructSearchQuery = (queryParams: any)=>{
    let constructedQuery: any = {};
    if(queryParams.destination){
        constructedQuery.$or = [
            {city: new RegExp(queryParams.destination,"i")},
            {country: new RegExp(queryParams.destination,"i")},
        ];
    }
    if(queryParams.adultCount){
        constructedQuery.adultCount = {
            $gte: parseInt(queryParams.adultCount),
        };
    }
    if(queryParams.childCount){
        constructedQuery.childCount = {
            $gte: parseInt(queryParams.childCount),
        }
    }
    if(queryParams.facilities) {
        constructedQuery.facilities = {
            $all: Array.isArray(queryParams.facilities) ? queryParams.facilities : [queryParams.facilities],
        }
    }
    if(queryParams.types){
        constructedQuery.type = {
            $in: Array.isArray(queryParams.types) ? queryParams.types : [queryParams.types],
        }
    }
    if(queryParams.stars){
        const starRating = Array.isArray(queryParams.stars) ? queryParams.stars.map((star: string)=>parseInt(star)) : parseInt(queryParams.stars);
        constructedQuery.starRating = {$in: starRating};
    }
    if(queryParams.maxPrice){
        constructedQuery.pricePerNight = {
            $lte: parseInt(queryParams.maxPrice),
        }
    }
    return constructedQuery;
}

const searchHandler : RequestHandler = async (req : Request, res: Response)=>{
    try{
        const query = constructSearchQuery(req.query);

        let sortOptions = {};
        switch(req.query.sortOption){
            case "starRating":
                sortOptions = {starRating: -1};
                break;
            case "pricePerNightAsc":
                sortOptions = {pricePerNight: 1};
                break;
            case "pricePerNightDesc":
                sortOptions = {pricePerNight: -1};
                break;
        }
        const pageSize = 6;
        const pageNumber = parseInt(req.query.page ? req.query.page.toString() : "1"
    )
        const skip = (pageNumber-1) * pageSize;

        const hotels = await Hotel.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(pageSize);
        
        const total = await Hotel.countDocuments(query);
        const response : HotelSearchResponse= {
            data: hotels,
            pagination:{
                total,
                page: pageNumber,
                pages: Math.ceil(total/pageSize)
            }
        }
        res.json(response);
    }catch(error){  
        console.log("Error:",error);
        res.status(500).json({
            message: "Something went wrong",
        });
    }
}

router.get("/search",searchHandler)

const latestHotelHandler: RequestHandler = async(req:Request, res:Response)=>{
    try{
        const hotels = await Hotel.find().sort("-lastUpdated")
        res.json(hotels);
    }catch(error){
        console.log("error",error);
        res.status(500).json({ message: "Error fetching hotels"})
    }
}

router.get("/",latestHotelHandler )
router.get("/:id",[
    param("id").notEmpty().withMessage("Hotel ID is required")
],fetchSingleHotel);

const paymentHandler : RequestHandler = async(req: Request,res: Response)=>{
    console.log("Received create payment intent request");
    const { numberOfNights } = req.body;
    const hotelId = req.params.hotelId;

    const hotel = await Hotel.findById(hotelId);
    if(!hotel){
        res.status(400).json({message:"Hotel not found"});
        return;
    }

    const totalCost = hotel.pricePerNight *numberOfNights;

    const paymentIntent = await stripe.paymentIntents.create({
        amount: totalCost*100,
        currency: "inr",
        metadata: {
            hotelId,
            userId: req.userId,
        }
    });

    if(!paymentIntent.client_secret){
        res.status(500).json({message: "Error creating payment intent"});
    }

    const response = {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret?.toString(),
        totalCost
    };
    console.log("Hotel:", hotel);
    console.log("Total cost:", totalCost);
    console.log("PaymentIntent:", paymentIntent);

    res.json(response);
    return;
}

router.post("/:hotelId/bookings/payment-intent", verifyToken, paymentHandler)
export default router;