import {useState, useEffect, useRef, useCallback} from 'react'
import {useDispatch, useSubscribe, useCache,actions} from './internal/core'
  
/**
 * useQuery hooks allows user to perform a fetch query.
 * when lot of components that are mounted uses this hook to get cart data, 
 * and even one product was added to the cart each component using useSelect wil be re-rendered. 
 * to avoid this we can pass in a selector of the data. which will be used to compare
 * if data was changed for this component. 
 */

// (newData, staleData )=> {
//     if(!newData){
//         //display the previously cached value
//         //and update when new data is avialbel
//         return
//     }

//     //check if the data this component requires has changed
//     if(selector(newData)===selector(staleData)){
//         return
//     }
//     setData(newData)

// }
export function useSelect(tag, selector){
    const [data, setData] = useState(null)

    const subscribe = useSubscribe();

    const isMounted = useRef(false);

    
    
    useEffect(()=>{
        isMounted.current = true;
        
        const unsubscribe  = subscribe(
            tag,
            //call back when data changes

            (data )=> {
                if(!data){
                    //display the previously cached value
                    //and update when new data is avialbel
                    //but this makes useSlect compoenents 
                    //render twice. once with null data and other with 
                    //the actual data
                    return
                }

                setData(data)

            }
        );

        //populate data from cache if available
        const cachedData = useCache(tag);
        if(cachedData){
            setData(cachedData);
        }

        if(!unsubscribe){
            return ;   
        }
        return ()=>{
            isMounted.current = false;
            unsubscribe();

        }
    },[])

    return ()=>(

        selector(data));
   
}