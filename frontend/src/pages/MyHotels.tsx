import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as apiClient from "../api-client";
import { HotelType } from "../../../backend/src/shared/types";
import { BsBuilding, BsMap } from "react-icons/bs";
import { BiHotel, BiMoney, BiStar } from "react-icons/bi";

const MyHotels = () => {
  const { data: hotelData } = useQuery<HotelType[], Error>({
    queryKey: ["fetchMyHotels"],
    queryFn: apiClient.fetchMyHotels,
  });

  if (!hotelData) {
    return <span>No hotels found</span>;
  }

  return (
    <div className="space-y-5">
      <span className="flex justify-between">
        <h1 className="text-3xl font-bold">My Hotels</h1>
        <Link
          to="/add-hotel"
          className="flex bg-green-600 text-white text-xl font-bold p-2 hover:bg-green-500"
        >
          Add Hotel
        </Link>
      </span>
      <div className="grid grid-cols-1 gap-8">
        {hotelData.map((hotel: HotelType) => (
          <div
            key={hotel._id}
            className="flex flex-col justify-between border border-slate-300 rounded-lg p-8"
          >
            <h2 className="text-2xl font-bold">{hotel.name}</h2>
            <div className="whitespace-pre-line">{hotel.description}</div>
            <div className="grid grid-cols-5 gap-2">
              <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                <BsMap className="mr-2"/>
                {hotel.city}, {hotel.country}
              </div>
              <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                <BsBuilding className="mr-2"/>
                {hotel.type}
              </div>
              <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                <BiMoney className="mr-2"/>
                Rs. {hotel.pricePerNight} per night
              </div>
              <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                <BiHotel className="mr-2"/>
                {hotel.starRating} adults, {hotel.childCount} children
              </div>
              <div className="border border-slate-300 rounded-sm p-3 flex items-center">
                <BiStar className="mr-2"/>
                {hotel.starRating} Star Rating
              </div>
            </div>
            <span className="flex justify-end">
                <Link to={`/edit-hotel/${hotel._id}`} className="flex bg-green-600 text-white text-xl font-bold p-2 hover:bg-green-500 m-5">View Details</Link>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyHotels;
