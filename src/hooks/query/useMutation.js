import {useState, useCallback} from 'react'
import {useDispatch, actions} from './internal/core'

/**
 * 
 * useMutation is used to perform a mutating query. Inside config user can provide 
 * tags to invalidate cache for existing query paths. 
 * 
 * @param asyncMutatingQuery 
 * @param config 
 * @returns 
 */
export function useMutation(asyncMutatingQuery, config){
    const {tags} = config;
    const [mutatingQueryState, setMutatingQueryState] = useState({
        updating: false,
        error: null,
    })

    const dispatch = useDispatch();
    const {STALE_CACHE} = actions;
    const update = useCallback((variant)=>{
        const promise = asyncMutatingQuery(variant);

        setMutatingQueryState((prev)=>(
            {
               updating: true,
               error: null,
            }
        ))

        promise.then(
            res=>{
               setTimeout(()=>{
                setMutatingQueryState((prev)=>(
                    {
                       updating: false,
                       error: null,
                    }
                ))

                   //stale the cache for this tag. next time compoenent will
                //forcefully fetch new data
                for(const tag of tags) {
                    dispatch(STALE_CACHE(tag));
                }

               },20)
             
                
            }
        ).catch(err=>{
            setMutatingQueryState((prev)=>(
                {
                   updating:false,
                   error: err,
                }
            ))
        })
    },[])
    
    return [mutatingQueryState, update];
}