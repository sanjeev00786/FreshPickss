export function handleNetworkChange(offlinePage) {
    if (navigator.onLine) {
        console.log('onLine')
        offlinePage.style.display = 'none';
    } else {
        console.log('offLine')
        offlinePage.style.display = 'flex';
    }
}