// /backend/data/codeBlocks.js
const codeBlocks = [
    { id: 1, title: "Async Case", code: "async function fetchData() { return await fetch('/api/data'); }", solution: "async function fetchData() { const response = await fetch('/api/data'); return response.json(); }" },
    { id: 2, title: "Promise Example", code: "new Promise((resolve, reject) => { resolve('Hello, World!'); });", solution: "new Promise((resolve, reject) => { resolve('Hello, World!'); });" },
    { id: 3, title: "Callback Function", code: "function doSomething(callback) { callback('Done'); }", solution: "function doSomething(callback) { callback('Done'); }" },
    { id: 4, title: "Event Handling", code: "document.addEventListener('click', () => { console.log('Clicked'); });", solution: "document.addEventListener('click', () => { console.log('Clicked'); });" },
];

module.exports = codeBlocks;

// 5YzwR9IOhAUlOgdo orsolomon24