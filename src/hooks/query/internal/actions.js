/**
 * fetch actions
 */
  const INIT_FETCH = (tag) => ({
    tag,
    type: 'INIT_FETCH',
    payload: null,
  });

const FETCH_SUCCEDED = (tag, data) => ({
    tag,
    type: 'FETCH_SUCCEDED',
    payload: data,
  });
  
const FETCH_FAILED = (tag, error) => ({
    tag,
    type: 'FETCH_FAILED',
    payload: error,
  });
  
/**
 * dispatch the following action when the cahce is stale
 * and needs to updated with new data.
 */
const UPDATE_CACHE = (tag, data) => ({
    tag,
    type: 'UPDATE_CACHE',
    payload: data,
})

const STALE_CACHE = (tag) =>({
    tag,
    type: 'STALE_CACHE',
    payload: null,
})
export const actions =  {  
    INIT_FETCH,
    FETCH_SUCCEDED,
    FETCH_FAILED,
    UPDATE_CACHE,
    STALE_CACHE,
} ;
