import {useState, useCallback} from 'react'
import {useDispatch, actions} from './internal/core'
  
export function useOptimisticMutation(asyncOptimisticQuery, config){
    // const [mutatingQueryState, setMutatingQueryState] = useState(null)
    const {tags, onFail} = config;
    const dispatch = useDispatch();
    const {STALE_CACHE} = actions;
    const update = useCallback(()=>{
        const promise = asyncOptimisticQuery();

        promise.then(
            res=>{
                //stale the cache for this tag. next time compoenent will
                //forcefully fetch new data
                for(const tag of tags) {
                    dispatch(STALE_CACHE(tag));
                }
                
            }
        ).catch(err=>{
            onFail(err);
            // setMutatingQueryState((prev)=>(
            //     {
            //        error: err,
            //     }
            // ))
        })
    },[])
    
    // return [mutatingQueryState, update];
        return update;
}