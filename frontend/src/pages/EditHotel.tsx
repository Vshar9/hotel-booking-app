import { useParams } from "react-router-dom";
import * as apiClient from '../api-client';
import { useMutation, useQuery } from "@tanstack/react-query";
import ManageHotelForm from "../forms/ManageHotelForm/ManageHotelForm";
import { useAppContext } from "../contexts/AppContext";

const EditHotel = ()=>{
    const {hotelId} = useParams();
    const {showToast} = useAppContext();

    const {data: hotel} = useQuery({
        queryKey: ['fetchMyHotelById'],
        queryFn: ()=>apiClient.fetchMyHotelById(hotelId || ''),
        enabled: !!hotelId
    })

    const {mutate,isPending} = useMutation({
        mutationFn: apiClient.updateMyHotelById,
        onSuccess: ()=>{
            showToast({message: "Hotel Saved!", type: "SUCCESS"})
        },
        onError: ()=>{
            showToast({message: "Error saving hotel", type: "ERROR"})
        }
    })

    const handleSave = (hotelFormData: FormData)=>{
        mutate(hotelFormData);
    }

    return (
        <ManageHotelForm  hotel={hotel} onSave={handleSave} isLoading={isPending}/>
    );
}

export default EditHotel;