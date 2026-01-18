import { useCallback } from "react";
import { useQuery, useSelect, useOptimisticMutation} from "../query/index";
import axios from 'axios';

const WISH_LIST = 'wish-list';
const WISH_LIST_URL = 'http://localhost:3000/wishlist/';

/**
 * this hook allows any coponent to read cart details,
 * add product to cart remove products from cart. The 
 * impressive part is that if data were to change because 
 * of mutating hooks then compoenent will re-render that uses
 * getCart selector or useGetCart hook. 
 * 
 * difference nbetween getCart and useGetCart is that
 * getCart gives you cached data only. which could be null
 * at the start of the application. but useGetCart will fetch 
 * either when there is no data or data becomes stale because of 
 * a mutatinf wuery or staleTimeout settings.
 * 
 */

export function useWishList(){

    const getWishList = useSelect(WISH_LIST,(data)=>(data));

    const useGetWishList = useCallback(()=>{
        
        return useQuery(
            ()=>{
                return axios.get(WISH_LIST_URL);
            },
            {
                tag:WISH_LIST
            }
        )

    },[]);

    const useAddToWishList = useCallback((productID, handleFail)=>{

        return useOptimisticMutation(
            ()=>{
                return axios.post(WISH_LIST_URL, productID);
            },
            {
                tags:[WISH_LIST],
                onFail: handleFail,
            }
        )
    })

    


    const useRemoveFromWishList = useCallback((productID,handleFail)=>{

        return useOptimisticMutation(
            () => axios.delete(`${WISH_LIST_URL}${productID}`),
            {
                tags:[WISH_LIST],
                onFail: handleFail
            }
        )
    })

    return {getWishList, useGetWishList, useAddToWishList, useRemoveFromWishList};
}
