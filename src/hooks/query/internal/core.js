export { actions } from './actions';

class CacheManager
{
    /**
     * A map that stores 'tag' as keys and response data from fetch 
     * query as values.
     */
    _cache;

    /**
     * A map that stores 'tag' as keys and list of subscribers as values. 
     * A Subscriber is a function that is  called with new data as it is 
     * updated in the cache.
     * 
     */
    _subscribers;

    
    /**
     * A reducer is a pure function that gets cache and an action as argument 
     * and changes the cache.
     */
    _reducer;

    constructor(reducer) {
        this._reducer = reducer;
        this._cache = new Map();
        this._subscribers = new Map();
    }

    getCache() {
        return this._cache;
    }

    /**
     * 
     * @param  subscriber is a function called when the cached data changes. 
     * @param  tag is a string used to select the cached data.
     * 
     * @returns a function to unsubscribe to the cache and clean up all resoruces
     * attached with this subscriber
     */
    subscribe(tag, subscriber) {
        
        if(subscriber === undefined || tag === undefined){
            return null;
        }
    
        if(!this._subscribers.has(tag)){
            this._subscribers.set(tag, new Set());
        }

        this._subscribers.get(tag).add(subscriber);

        return () => {
            const subscribers = this._subscribers.get(tag);
            if(subscribers){
                subscribers.delete(subscriber);
                if(subscribers.size === 0)
                {
                    this._subscribers.delete(tag);
                }
            }
        };
    }

    /**
     * 
     * @param tag notify all subscribers with this tag about change in the cached data. 
     */
    //we have to optimize this further 
    //we want compoenent to pick slelectors that will be used
    //decide if the updates data had any change on the the selector
    //if no change was observed then no need to notify for stale
_notify(tag) {


    const entry = this._cache.get(tag);
    let data;
    if(!entry)
    {
        data = null;
        return;
    }else {  data = entry.data;}
  
    this._subscribers.get(tag)?.forEach(subscriber => {
        console.log('calling subscribers')
        subscriber(data);
    });
}


    get(tag) {
        if(this._cache.has(tag))
        {
            const {data} = this._cache.get(tag);
            return data;
        }
         return null;
    }
    

    /** 
     * returns a dispatch function. whenever an action to chnage 
     * cached data is dispatched reducers are used to change the cache.
    */
    createDispatcher() {
        return (action) => {
            const { tag, type, payload } = action;
            this._cache = this._reducer(this._cache, action);
            this._notify(tag);
            console.log('cache:' ,this._cache)
        };
    }

}



function reducer(cache, action) {
    const { type, tag, payload } = action;
    console.log('reducer begin');
   

    const newCache = new Map(cache);

    switch (type) {
        case 'UPDATE_CACHE':
            newCache.set(tag, {
                data: payload
            });
            console.log('update catch action recieved:',action )
            break;
        case 'STALE_CACHE':

            if (!cache.has(tag)) {
                break;
            };
            newCache.set(tag, {
                data: null,
            })
            console.log('stale catch action recieved:',action )
           
            break;
        default:
            console.log('action not matched :',action )
           
            return cache;
    }

    return newCache;
}

const CACHE_MANAGER = new CacheManager(reducer);

export function useDispatch(){

    return CACHE_MANAGER.createDispatcher();
}
export function useSubscribe() {
    return CACHE_MANAGER.subscribe.bind(CACHE_MANAGER);
}

export function useCache(tag) {
    return CACHE_MANAGER.get(tag);

   
}
