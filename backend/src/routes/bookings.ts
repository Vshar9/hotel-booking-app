import express,{Request, RequestHandler, Response} from 'express'
import verifyToken from '../middleware/auth'
import Hotel from '../models/hotel'
import { HotelType } from '../shared/types'

const router = express.Router()

const showBookingHandler: RequestHandler = async (req: Request,res: Response)=>{
    try{
        const hotels = await Hotel.find({
            bookings:{
                $elemMatch: {userId: req.userId},
            }
        })
        const results = hotels.map((hotel)=>{
                const userBookings = hotel.bookings.filter((booking)=>booking.userId===req.userId)
                const hotelWithUserBookings: HotelType = {
                ...hotel.toObject(),
                bookings: userBookings,
            }

            return hotelWithUserBookings;
        })
        res.status(200).send(results);
    }catch(error){
        res.status(500).json({message: "Unable to fetch bookings"})
    }
}

router.get('/',verifyToken,showBookingHandler)

export default router;