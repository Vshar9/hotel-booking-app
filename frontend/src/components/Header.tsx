import {Link} from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import SignOutButton from "./SignOutButton";


const Header = ()=>{
    const {isLoggedIn} = useAppContext();
    return (
        <div className="bg-green-600 py-6">
            <div className="container mx-auto flex justify-between">
                <span className="text-3xl text-white font-bold tracking-tight">
                    <Link to="/" >Hoteline</Link>
                </span>
                <span className="flex space-x-2">
                    {isLoggedIn ?( <>
                        <Link to="/my-bookings" className="flex items-center text-white px-3 font-bold hover:bg-gray-100 hover:text-green-700">My Bookings</Link>
                        <Link to="/my-hotels" className="flex items-center text-white px-3 font-bold hover:bg-gray-100 hover:text-green-700">My Hotels</Link>
                        <SignOutButton />
                    </>
                    ):(
                    <>
                    <Link to="/sign-in" className="flex items-center text-white px-3 font-bold hover:bg-gray-100 hover:text-green-700">
                    Sign In</Link>
                    </>)
                    }
                </span>
            </div>
        </div>
    );
}
export default Header;
