"use strict";

export default function promiseMiddleware() {

    // Curry our middleware to accept functions
    return (next) => (action) => {

        // Pass forward standard object requests
        const { promise, types, ...rest } = action;

        if (! promise) {
            return next(action)
        }

        // Unstandard request
        const [REQUEST, SUCCESS, FAILURE, PROGRESS ] = types;

        console.log("--------------------------");
        console.log("Found different request");
        console.log("--------------------------");

        // Pass any request on to the specific middleware
        {
            type == PROGRESS ?
                next({...rest, type: PROGRESS}) :
                next({...rest, type: REQUEST});
        }

        // Pass success or failure on to the correct reducer
        return promise().then(

            // Currently this structure is empty
            // I'll need to fill this out with async logic if needed
            (result) => {
                next({...rest, result, type: SUCCESS})
            },
            (error) => {
                next({...rest, error, type: FAILURE})
            }
        )
    }
}