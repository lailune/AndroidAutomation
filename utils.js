module.exports = {
    parseBounds: (boundsStr) => {
        let bounds = JSON.parse('[' + boundsStr.replace('][', '],[') + ']');

        return bounds;
    },

    wait: (timeout = 1000) => {
        return new Promise(resolve => {
            setTimeout(resolve, timeout);
        })
    }
}