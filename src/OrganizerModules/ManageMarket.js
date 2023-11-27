import { getCollectionData, deleteDocument } from '/helperClasses/firestoreService.js'
import { showCustomToast } from '/helperClasses/Alert.js'

const deleteSound = document.getElementById('popupSound')
const addMarketBtn = document.getElementById('addMarketBtn')

// Mark:- Variables
let marketArr = []
const marketCollectionName = 'Markets'
let userId = "QuvoAepbjRVWyWcPvHaqWMREy712"

// Mark:- Fetch Market Data
async function getMarketsData() {
    try {
        const data = await getCollectionData(marketCollectionName)
        for (const i of data) {
            console.log(i)
            if (i.userId === userId) {
                marketArr.push(i)
            }
        }
        // Sort the marketArr based on date
        marketArr.sort((a, b) => {
            const [dayA, monthA, yearA] = a.date.date.split("/").map(Number)
            const [dayB, monthB, yearB] = b.date.date.split("/").map(Number)

            const dateA = new Date(yearA, monthA - 1, dayA)
            const dateB = new Date(yearB, monthB - 1, dayB)

            return dateB - dateA
        })
        var index = 0
        for (const market of marketArr) {
            createMarketItem(market, index)
            index += 1
        }
        // MARK:- Show Loader
        document.body.classList.add("loaded");
    } catch (error) {
        console.error("Error:", error)
    }
}

getMarketsData()

function createMarketItem(data, i) {

    const image = data.media.find(item => item.type === "img")

    // Create the main container div
    const marketItem = document.createElement('div')
    marketItem.classList.add('market-item')

    // Create and append the image
    const img = document.createElement('img')
    img.src = image.file
    img.classList.add('marketImage')
    marketItem.appendChild(img)

    // Create and append market info
    const marketInfo = document.createElement('div')
    marketInfo.classList.add('market-info')

    const h2 = document.createElement('h2')
    h2.textContent = data.marketName
    marketInfo.appendChild(h2)

    const p = document.createElement('p')
    p.textContent = `${data.date.date} | ${data.date.time}`
    marketInfo.appendChild(p)

    marketItem.appendChild(marketInfo)

    // Create and append delete button
    const deleteBtn = document.createElement('div')
    deleteBtn.classList.add('delete-btn')
    deleteBtn.setAttribute('data-index', i)

    deleteBtn.addEventListener('click', function (event) {
        const clickedIndex = event.currentTarget.getAttribute('data-index')
        const clickedItem = event.currentTarget.closest('.market-item')
        deleteItem(clickedItem, clickedIndex)
    })

    const binIcon = document.createElement('img')
    binIcon.setAttribute('id', 'binIcon')
    binIcon.setAttribute('src', '../../assets/delete_24px.svg')
    binIcon.setAttribute('alt', 'Bin Icon')
    binIcon.classList.add('icon')
    deleteBtn.appendChild(binIcon)

    // Create and append edit button
    const editBtn = document.createElement('div')
    editBtn.classList.add('edit-btn')
    editBtn.setAttribute('data-index', i)

    const editIcon = document.createElement('img')
    editIcon.setAttribute('id', 'editIcon')
    editIcon.setAttribute('src', '../../assets/Edit.svg')
    editIcon.setAttribute('alt', 'Edit Icon')
    editIcon.classList.add('icon')
    editBtn.appendChild(editIcon)

    editBtn.addEventListener('click', function (event) {
        const clickedIndex = event.currentTarget.getAttribute('data-index')
        const clickedItem = event.currentTarget.closest('.market-item')
        const docID = marketArr[clickedIndex].id
        window.location.href = '/html/OrganizerPages/EditMarket.html?data=' + docID
    })
    marketItem.appendChild(editBtn)
    marketItem.appendChild(deleteBtn)

    // Append the created market item to the main container
    const container = document.querySelector('.container')
    container.appendChild(marketItem)
}

function deleteItem(clickedItem, clickedIndex) {
    clickedItem.classList.add('deleting')
    document.body.classList.remove("loaded")
    clickedItem.addEventListener('transitionend', function () {
        const result = deleteDocument(marketCollectionName, marketArr[clickedIndex].id)
        if (result) {
            setTimeout(() => {
                document.body.classList.add("loaded")
                clickedItem.classList.add('deleted')
                showCustomToast("Market successfully deleted.")
            }, 50)
            clickedItem.remove()
            deleteSound.play()
        } else {
            showCustomToast("Failed to delete the item. Please try again.")
            clickedItem.classList.remove('deleting')
        }

    })
}

addMarketBtn.addEventListener('click', function () {
    document.body.classList.add('slide-out');

    setTimeout(function () {
        window.location.href = 'AddMarket.html';
    }, 500);
})
