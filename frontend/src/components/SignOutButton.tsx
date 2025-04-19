import {  useMutation, useQueryClient } from "@tanstack/react-query";
import * as apiClient from "../api-client" 
import { useAppContext } from "../contexts/AppContext";

const SignOutButton = ()=>{
    const queryClient = useQueryClient()
    const { showToast } = useAppContext();

    const mutation = useMutation({
        mutationFn: apiClient.signOut,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["validateToken"] });
            showToast({
                message: "Signed Out",
                type: "SUCCESS"
            })
        },
        onError: (error: Error) => {
            showToast({
                message: error.message,
                type: "ERROR"
            });
        }   
    })

    const handleClick = ()=>{
        mutation.mutate();
    }
    return(
        <button onClick={handleClick} className="flex items-center text-white px-3 font-bold hover:bg-gray-100 hover:text-green-700">
            Sign Out
        </button>
    );
}

export default SignOutButton;