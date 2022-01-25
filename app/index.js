const popupWrap = document.querySelector(".list__popup");
const cancelBtn = document.querySelector(".cancel__btn");
const addlistBtn = document.querySelector(".addlist");

const boardContainer = document.querySelector(".container");
const registrationListBtn = document.querySelector(".add__btn");
const addInput = document.querySelector(".list__input input");
const popupToggle = () => popupWrap.classList.toggle("none");


const addList = () => {
    let title = addInput.value;
    const list = document.createElement('div');
    list.classList.add('list', 'grid');
    list.innerHTML +=
    `
        <div class="list__container">
          <div class="list__header flex">
            <p class="list__title">${title}</p>
            <div class="list__menu"><i class=" fa-ellipsis-h fa"></i></div>
          </div>
          <div class="cards grid">
          </div>
          <div class="list__footer flex">
            <div class="list__footer--txt">+ Add a card</div>
            <i class="fa fa-copy"></i>
          </div>
        </div>
    `;
    boardContainer.insertBefore(list, boardContainer.firstChild);
};
registrationListBtn.addEventListener("click", addList);
cancelBtn.addEventListener("click", popupToggle);
addlistBtn.addEventListener("click",() => {
    popupToggle()
    console.log(123123);
});

if (window.indexedDB) {
    let name = 'Trello';
    let version = 1;
    let db = null;
    let request = indexedDB.open(name, version);
    // db가 생성될때 트리거 되거나 버전이 업데이트 되었을떄 트리거됨
    request.onupgradeneeded = function(event) { 
    console.log('onupgradeneeded');
      db = request.result;
      let key = "ids";
      let name = 'store name';
      let store = db.createObjectStore(name, { keyPath: key });
      console.log(store);
      let indexName = 'by_name';
      let keyPath = 'name';
      let index = store.createIndex(indexName, keyPath);
      let obj = {
        [key]: 2,
        [keyPath]: "앙기모띠"
      }
      store.put(obj);
    };
    
    request.onsuccess = function(event) {
        console.log(event.target);
      db = request.result;
      // IDBTransaction
      let transaction = db.transaction(['store name'], "readonly");
      // IDBObjectStore
      let objectStore = transaction.objectStore('store name');
      // IDBRequest
      let cursor = objectStore.openCursor();
        cursor.onsuccess = function(event) {
          // IDBCursorWithValue
          let cursor = event.target.result;
          if ( cursor ) {
            console.log(cursor)
            cursor.continue();
          } else {
            console.log('end');
          }
        };
    };
  }




