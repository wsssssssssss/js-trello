console.log('hello world');


const listArr = [];
let list_idx = 0;

let db = null;

const root = document.querySelector("#root");
const container = document.querySelector("#root .container");

const popup = document.querySelectorAll("#root .popup");


const insertListForm = document.querySelector("#root #insert_list_popup form");
const insertCardForm = document.querySelector("#root #insert_card_popup form");



window.addEventListener('load', function() {
    const request = indexedDB.open('trello', 1);

    request.onupgradeneeded = function(e) {
        db = e.target.result;

        const list = db.createObjectStore("list", {keyPath: "list_idx"});
    }

    const request2 = indexedDB.open('trello', 1);
    request2.onsuccess = e => {
        db = e.target.result;
        render();
    }

});



// 팝업 띄우기
const popupOpen = function(popup) {
    popup.classList.remove('none');
}

// 팝업 지우기
const popupClose = function(popup, form) {
    popup.classList.add('none');
    form.reset();
}

const render = async function() {
    [...container.children].forEach( (ele) => {
        if(ele.classList.contains('list')){
            ele.remove();
        }
    } )

    const tx = db.transaction("list", "readonly");
    const tList = tx.objectStore("list");
    const request = tList.openCursor();
    request.onsuccess = (e) => {
        const cursor = e.target.result;

        if(cursor) {
            const list = document.createElement('div');
            list.classList.add('list');
            list.innerHTML = `
            <div class="title flex">
              <h3>${cursor.value.title}</h3>
              <div class="menu"> <i class="fa fa-chevron-down" data-listIdx="${cursor.value.list_idx}"></i> </div>
            </div>
            <div class="cards flex">
            ${cursor.value.value.map( (card) => {
                if(card.img !== '') {
                    return `
                    <div class="card flex" data-listIdx="${cursor.value.list_idx}" data-cardIdx="${card.card_idx}">
                        <div class="photo">
                            <img src="${card.img}">
                        </div>
                        <h3>${card.card_title}</h3>
                    </div>`
                } else {
                    return `
                    <div class="card flex" data-idx="${card.card_idx}">
                        <h3>${card.card_title}</h3>
                    </div>`
                }
            } ).join("")}
            </div>
            <div class="add_card add_btn flex" data-num="${cursor.value.list_idx}">
              <p class="plus">+</p>
              <p>Add a card</p>
              <i class="fa fa-edit"></i>
            </div>
            `;
            document.querySelector("#root .container .add_list").before(list);

            cursor.continue();
        }
    }
};


root.addEventListener('click', function(e) {
    // 취소 버튼 클릭시 실행
    if(e.target.classList.contains('close')) {
        popupClose(e.target.closest('.popup'), e.target.closest('form'));

        return false;
    }

    // 리스트 추가 버튼 클릭시 실행
    if(e.target.classList.contains('add_list') || e.target.parentNode.classList.contains('add_list')) {
        popupOpen(document.querySelector("#root #insert_list_popup"));
        insertListForm.title.focus();

        return false;
    }

    // 카트 추가 버튼 클릭시 실행
    if(e.target.classList.contains('add_card') || e.target.parentNode.classList.contains('add_card')) {
        popupOpen(document.querySelector("#root #insert_card_popup"));
        insertCardForm.list_idx.value = e.target.dataset.num || e.target.parentNode.dataset.num;
        insertCardForm.title.focus();

        return false;
    }

    // 리스트 메뉴 클릭시 실행
    if(e.target.classList.contains("fa-chevron-down")) {
        const menu = document.createElement("div");
        menu.classList.add("list_menu");
        menu.innerHTML = `
        <div class="list_delete" data-listidx="${e.target.dataset.listidx}">삭제</div>
        `;
        e.target.appendChild(menu);

        e.target.classList.toggle("high");
        e.target.classList.toggle("fa-chevron-down");
        e.target.classList.toggle("fa-chevron-up");

        return false;
    }

    if(e.target.classList.contains("fa-chevron-up")) {
        e.target.children[0].remove()
        e.target.classList.toggle("high");
        e.target.classList.toggle("fa-chevron-down");
        e.target.classList.toggle("fa-chevron-up");

        return false;
    }

    // 리스트 삭제 버튼 클릭시 실행
    if(e.target.classList.contains("list_delete")) {
        if(confirm("리스트를 삭제 하시겠습니까?")) {
            const tx = db.transaction("list", "readwrite");
            const tList = tx.objectStore("list");
            tList.delete(parseInt(e.target.dataset.listidx));
            render();
        }
        
    }


})

// 리스트 추가할때 실행
insertListForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const event = e;
    const title = this.title.value;
    if(title === ""){
        alert('리스트명을 입력해주세요');
        this.title.focus();

        return;
    }

    const tx = db.transaction("list", "readwrite");
    const tList = tx.objectStore("list");
    const request = tList.openCursor(null, "prev");

    request.onsuccess = e => {
        const cursor = e.target.result;
        list_idx = cursor ? cursor.value.list_idx + 1 : 0;

        tList.add( { title, list_idx, count: 0, value: [] } );
    
        popupClose(event.target.closest('.popup'), event.target.closest('form'));
        render();
    }

});

// 카드 추가할때 실행
insertCardForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // console.log("submit");
    const form = this;
    const event = e;
    const list_idx = this.list_idx.value;

    if(this.title.value === ""){
        alert("카드 내용을 입력해주세요");
        this.content.focus();
        return;
    }

    const searchFun = (imgSrc = '') => {
        const tx = db.transaction("list", "readwrite");
        const tList = tx.objectStore("list");
        const request = tList.openCursor();

        request.onsuccess = e => {
            const cursor = e.target.result;

            if(cursor) {
                if(cursor.key === parseInt(list_idx)) {
                    const updateData = cursor.value;

                    updateData.value.push( { card_title: form.title.value, card_content: "설명을 입력해주세요..", card_idx: updateData.count, img: imgSrc } );
                    updateData.count++;
                    
                    const request2 = cursor.update(updateData);
                    request2.onsuccess = () => {
                        document.querySelector("#root #insert_card_popup .photo img").src = '';
                        
                        popupClose(event.target.closest('.popup'), event.target.closest('form'));
                        render();
                        // console.log(updateData);
                    }
                }

                cursor.continue();
            }
        }
    }

    const img = this.img.files[0];
    const reader = new FileReader();
 
    if(img){``
        reader.readAsDataURL(img);
        reader.onload = function() {
            const imgSrc = reader.result;
            searchFun(imgSrc);
        }
    } else {
        searchFun();
    }
    
})


document.querySelector("#root #insert_card_popup .insert_img_btn").addEventListener('change', function() {
    const img = this.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(img); 
    reader.onload = function() {
        document.querySelector("#root #insert_card_popup .photo img").src = reader.result;
    }
    
})


