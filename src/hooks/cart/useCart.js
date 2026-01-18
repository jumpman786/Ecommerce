import { useCallback } from "react";
import { useQuery, useMutation, useSelect} from "../query/index";
import axios from 'axios';

const CART_TAG = 'tag';
const CART_URL = 'http://localhost:3000/cart/';

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
export function useCart(){

    const getCart = useCallback(()=>{
        return useSelect(CART_TAG,(data)=>(data))();
    },[])

    const useGetCart = useCallback(()=>{
        
        return useQuery(
            ()=>{
                return axios.get(CART_URL);
            },
            {
                tag:CART_TAG
            }
        )

    },[]);

    const useAddToCart = useCallback(()=>{

        return useMutation(
            (product)=>{
                return axios.post(CART_URL, product);
            },
            {
                tags:[CART_TAG]
            }
        )
    })

    


    const useRemoveFromCart = useCallback(()=>{

        return useMutation(
            (productID) => axios.delete(`${CART_URL}${productID}`),
            {
                tags:[CART_TAG]
            }
        )
    })

    return {getCart, useGetCart, useAddToCart, useRemoveFromCart};
}

/**
 * 
 * on a prodcut page above hooks can be used like this
 * 
 * 
 * const ProductPage = () => {
 *  
 * const [useGetCart, useAddToCart] = useCart();
 * const [{loading,error,data},fetch: getCart] = useGetCart;
 * const [{updating,error},update: addToCart] = useAddToCart;
 * 
 * const quantity = data[productID].quantity;
 * 
 * //if we forcefully refetch mounted components after a mutating wiery then we don't have to 
 * //do following effect. we must do this otherwise cart cont on the icon will not relfect changes
 * useEffect(()=>{
 *      if(!updating && !error){
 *          getCart();
 *      }
 * 
 * ,[updating])
 * }
 * const isLoading = loading || updating;
 * 
 * const handleAddToCart = useCallBack(
 *  ()=>{
 * //we want that for all mounted subscrivers like this page getCart is automatically triggered
 *      addToCart();
 * },[])
 * 
 * return(
 * <Button 
 *  title={`Add To Cart(${quantity}`)}
 *  loading = isLoading
 *  onPress={handleAddToCart}
 * />
 * );
 * }
 */