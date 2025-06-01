import { Link } from 'react-router-dom';
import { HotelType } from '../../../backend/src/shared/types';
import { AiFillStar } from 'react-icons/ai';

type Props = {
  hotel: HotelType;
};

const SearchResultsCard = ({ hotel }: Props) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[2fr_3fr] border border-slate-300 rounded-lg p-8 gap-8">
      {/* Image */}
      <div className="w-full h-[300px]">
        <img
          src={hotel.imageUrls[0]}
          alt="Hotel Image"
          className="w-full h-full object-cover object-center rounded"
        />
      </div>


      <div className="flex flex-col justify-between">
        <div>
          <div className="flex items-center mb-1">
            <span className="flex">
              {Array.from({ length: hotel.starRating }).map((_, index) => (
                <AiFillStar key={index} className="fill-yellow-400" />
              ))}
            </span>
            <span className="ml-1 text-sm">{hotel.type}</span>
          </div>
          <Link to={`/detail/${hotel._id}`} className="text-2xl font-bold cursor-pointer">{hotel.name}</Link>
        </div>

        <div className="mt-2 text-sm text-gray-700 line-clamp-4">
          {hotel.description}
        </div>


        <div className="flex items-end justify-between mt-4">
          <div className="flex gap-2 flex-wrap">
            {hotel.facilities.slice(0, 2).map((facility) => (
              <span
                key={facility}
                className="bg-slate-300 px-3 py-1 rounded-lg font-bold text-xs"
              >
                {facility}
              </span>
            ))}
            {hotel.facilities.length > 2 && (
              <span className="text-sm text-gray-600">
                +{hotel.facilities.length - 2} more
              </span>
            )}
          </div>


          <div className="text-right">
            <p className="font-bold whitespace-nowrap mb-2">
              Rs {hotel.pricePerNight} per night
            </p>
            <Link to={`/detail/${hotel._id}`} className="bg-green-600 text-white text-sm font-bold px-4 py-2 mt-1 rounded hover:bg-green-500">
              View More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsCard;
