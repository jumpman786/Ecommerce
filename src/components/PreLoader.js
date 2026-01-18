import { useEffect } from 'react';
import {useCart} from '../hooks/cart/useCart'
import {useWishList} from '../hooks/wishList/useWishList'

/**
 * PreLoader fetches user's cart and wishList info and stores in the cache
 * in using useCart and useWishList hooks.
 */
const PreLoader = ()=>{

    const {useGetCart} = useCart();
    const [{}, fetchCart ] = useGetCart();

    const {useGetWishList} = useWishList();
    const [{}, fetchWishList] = useGetWishList();

    useEffect(()=>{
        fetchCart();
        fetchWishList();
    },[])
    return(<></>);
}

export default PreLoader;