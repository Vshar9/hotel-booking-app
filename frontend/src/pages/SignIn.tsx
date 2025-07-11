import {useForm} from "react-hook-form";
import {useMutation, useQueryClient} from "@tanstack/react-query"
import * as apiClient from '../api-client';
import { useAppContext } from "../contexts/AppContext";
import { Link,useLocation,useNavigate } from "react-router-dom";


export type SignInFormData = {
    email: string;
    password: string;
}


const SignIn = () => {
    const { showToast } = useAppContext()
    const navigate = useNavigate();

    const location = useLocation();
    const queryClient = useQueryClient();
    const { 
        register,
        formState: {errors},
        handleSubmit,
    } = useForm<SignInFormData>();

    const mutation = useMutation({
        mutationFn: apiClient.signIn,
        onSuccess: async ()=>{
            showToast({
                message: "Sign in successful!",
                type: "SUCCESS"
            })
            await queryClient.invalidateQueries({ queryKey: ["validateToken"] });
            navigate(location.state?.from?.pathname || '/');
        },
        onError: async (error: Error)=>{
            showToast({
                message: error.message,
                type: "ERROR"
            })
        }
    });
    
    const onSubmit = handleSubmit((data)=>{
        mutation.mutate(data)
    });

    return (
        <form className="flex flex-col gap-5" onSubmit = {onSubmit}>
            <h2 className="text-3xl font-bold">Sign In</h2>
            
            <label className="text-gray-700 text-sm font-bold flex-1" >
                   Email
                    <input className="border rounded w-full py-1  px-2 font-normal" type="email" {...register("email",{required: "This field is required" })}/>
                    {errors.email && 
                    <span className="text-red-500">{errors.email.message}
                    </span>}
            </label>

            <label className="text-gray-700 text-sm font-bold flex-1" >
                   Password
                    <input className="border rounded w-full py-1  px-2 font-normal" type="password" {...register("password",{required: "This field is required",minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters long"
                    } })}/>
                    {errors.password && 
                    <span className="text-red-500">{errors.password.message}
                    </span>}
            </label>
            <span className="flex items-center justify-between">
                <span className="text-sm">
                    Not Registered? Create an account <Link to="/register" className="underline text-blue-600">here</Link>
                </span>
                <button type="submit" className="text-white bg-green-600 p-2 font-bold hover:text-white hover:bg-green-500">
                    Login
                </button>
            </span>

        </form>
    )
}

export default SignIn;