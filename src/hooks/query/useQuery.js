import {useState, useEffect, useRef, useCallback} from 'react'
import {useDispatch, useSubscribe, useCache,actions} from './internal/core'
  
/**
 * useQuery hooks allows user to perform a fetch query.
 */
export function useQuery(asyncQuery, config){
    const {tag}= config;
    //const {tag, selector, staleTimout} = config
    const [queryState, setQueryState] = useState({
        loading  : false,
        error    : null,
        data     : null, 
    })

    const dispatch = useDispatch();
    const subscribe = useSubscribe();

    const isMounted = useRef(false);

    const {  
        UPDATE_CACHE
    }  = actions;
    
    //need to take this function out so that on mutation we can manually calll it 
    const fetch = useCallback(()=>{
        const cachedData = useCache(tag);  
        if(!isMounted.current){    
            return;
        }
        console.log('useCache returned:', useCache(tag));

        //check cached data
      if (cachedData) {
        console.log('cache:',cachedData )
        const data = cachedData;
        setQueryState(prev=>({
            ...prev,
            data,
        }))
        return};


        const promise = asyncQuery();
        setQueryState({
            loading: true,
            error: null,
            data: null,
        }) 
        promise.then(
            res => {
                setTimeout(()=>(
                    setQueryState({
                        loading: false,
                        error: null,
                        data: res.data
                    })   
                ), 20)  
                dispatch(UPDATE_CACHE(tag,res.data))   
            }
        ).catch(
            err=>{
                setQueryState({
                    loading: false,
                    error: err,
                    data: null,
                })  
            }
        )
    },[])

    useEffect(()=>{
        isMounted.current = true;
        const unsubscribe  = subscribe(
            tag,
            //call back when data becomes stale
            (data)=> {

                if(data===null){
                    //cache is stale
                    console.log('i recieved a stale warnign going to re-fetch')
                    fetch();
                }
                // setQueryState(prev=> 
                // (
                //     {
                //         ...prev,
                //         data: data
                //     }
                // )
                // )

            }, //selector
        );
        // fetch();
        if(!unsubscribe){
            return ;   
        }
        return ()=>{
            isMounted.current = false;
            unsubscribe();

        }
    },[])

    //probalamatic when two compoenent have same tags and path
    // useEffect(()=>{
    //     setTimeout(async ()=>{
    //         asyncQuery().then(
    //             res => {
    //                 dispatch(UPDATE_CACHE(tag,res.data))
    //             } 
    //         );
    //     },config['staleTimeOut'])
    // },[])

    return [queryState, fetch];
   
}