const electron = require('electron')
const { ipcRenderer } = electron

const form = document.querySelector('form')
const item = document.querySelector('input')
const list = document.querySelector('ul')

//Render Items to Screen
const render = item => {
    const li = document.createElement('li')
    li.innerHTML = item
    list.appendChild(li)
}

//Get All Items After Starting 
window.addEventListener('load', () => ipcRenderer.send('loadAll'))
ipcRenderer.on('loaded', (e, items) => items.forEach(item => render(item.item)))

//Send Item to the server
form.addEventListener('submit', e => {
    e.preventDefault()
    ipcRenderer.send('addItem', { item: item.value })
    form.reset()
})

//Catches Add Item from server
ipcRenderer.on('added', (e, item) => render(item.item))

//Catches ClearAll from menu, sends the event to server to clear the db.
ipcRenderer.on('clearAll', () => ipcRenderer.send('clearAll'))
ipcRenderer.on('cleared', () => list.innerHTML = '')