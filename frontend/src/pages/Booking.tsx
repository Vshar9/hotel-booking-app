import { useQuery } from "@tanstack/react-query";
import * as apiClient from "../api-client";
import BookingForm from "../forms/BookingForm/BookingForm";
import { UserType } from "../../../backend/src/shared/types";
import { useSearchContext } from "../contexts/SearchContext";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import BookingDetailsSummary from "../components/BookingDetailsSummary";
import { Elements } from "@stripe/react-stripe-js";
import { useAppContext } from "../contexts/AppContext";

const Booking = ()=>{
    const search =  useSearchContext();
    const {hotelId} = useParams();
    const {stripePromise} = useAppContext();

    const [numberOfNights, setNumberOfNights] = useState<number>()
    useEffect(()=>{
        if(search.checkIn && search.checkOut){
            const nights = Math.abs(search.checkOut.getTime()-search.checkIn.getTime()) / (1000*60*60*24);
            setNumberOfNights(Math.ceil(nights))
        }
    },[search.checkIn, search.checkOut])

    const {data: paymentIntentData} = useQuery({
        queryKey: ['createPaymentIntent', hotelId, numberOfNights],
        queryFn: () => 
            apiClient.createPaymentIntent(
            hotelId as string,
            numberOfNights?.toString()
            ),
        enabled: !!hotelId && numberOfNights > 0,
        });

   const { data: hotel } = useQuery({
        queryKey: ["fetchHotelById", hotelId],
        queryFn: () => apiClient.fetchHotelById(hotelId as string),
        enabled: !!hotelId,
    });

    const { data: currentUser } = useQuery<UserType>({
        queryKey: ['fetchCurrentUser'],
        queryFn: apiClient.fetchCurrentUser,
    });
   
    if(!hotel){
        return <></>;
    }
    console.log("paymentIntentData", paymentIntentData);
    console.log("currentUser", currentUser);
    return <div className="grid md:grid-cols-[1fr_2fr]">
        <div className="bg-blue-200"><BookingDetailsSummary 
            checkIn={search.checkIn}
            checkOut={search.checkOut}
            adultCount={search.adultCount}
            childCount={search.childCount}
            numberOfNights={numberOfNights}
            hotel={hotel}
            /></div>

        {currentUser && paymentIntentData && (
            <Elements stripe={stripePromise} options={{
                clientSecret: paymentIntentData.clientSecret
            }}>
                <BookingForm currentUser={currentUser} 
                paymentIntent={paymentIntentData}/>
            </Elements>       
            )}
    </div>
}

export default Booking;