console.log('hello world');

// [
//     {
//          title: '리스트 제목'
//          list_idx: 0
//          count: 0
//          value: [
//             {"card_title": "카드제목", 'img': '이미지 이름' card_idx: 1},
//             {"card_title": "카드제목", 'img': '이미지 이름' card_idx: 2},
//             {"card_title": "카드제목", 'img': '이미지 이름' card_idx: 3},
//             {"card_title": "카드제목", 'img': '이미지 이름' card_idx: 4}
//         ]
//     },
//     {
//          title: '리스트 제목'
//          list_idx: 1
//          count: 0
//          value: [
//             {"card_title": "카드제목", 'img': '이미지 이름' card_idx: 1},
//             {"card_title": "카드제목", 'img': '이미지 이름' card_idx: 2},
//             {"card_title": "카드제목", 'img': '이미지 이름' card_idx: 3},
//             {"card_title": "카드제목", 'img': '이미지 이름' card_idx: 4}
//         ]
//     },
//     {
//          title: '리스트 제목'
//          list_idx: 2
//          count: 0
//          value: [
//             {"card_title": "카드제목", 'img': '이미지 이름' card_idx: 1},
//             {"card_title": "카드제목", 'img': '이미지 이름' card_idx: 2},
//             {"card_title": "카드제목", 'img': '이미지 이름' card_idx: 3},
//             {"card_title": "카드제목", 'img': '이미지 이름' card_idx: 4}
//         ]
//     },
// ]

let db = null;

// const dbSuccess = function() {
//     const request = indexedDB.open('trello', 1);

//     request.onupgradeneeded = (e) => {
//         db = e.target.result;

//         const list = db.createObjectStore("list", {keyPath: "list_idx"});
//     }

//     request.onsuccess = (e) => {
//         db = e.target.result;
//     }
// }

const createDB = async function() {
    
    const request = await indexedDB.open('trello', 1);
    // console.log(request);

    request.onupgradeneeded = function(e) {
        db = e.target.result;

        const list = db.createObjectStore("list", {keyPath: "list_idx"});
    }

    request.onsuccess = function(e) {
        db = e.target.result;

    }

}

window.addEventListener('load', function() {
    createDB();

    const request = indexedDB.open('trello', 1);
    request.onsuccess = e => {
        db = e.target.result;
        render();
    }

});


const listArr = [];
let list_idx = 0;   // 이거 db에서 가져와야함


const root = document.querySelector("#root");
const container = document.querySelector("#root .container");

const popup = document.querySelectorAll("#root .popup");


const insertListForm = document.querySelector("#root #insert_list_popup form");
const insertCardForm = document.querySelector("#root #insert_card_popup form");



const popupOpen = function(popup) {
    popup.classList.remove('none');
}

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
            console.log(cursor);
            const list = document.createElement('div');
            list.classList.add('list');
            list.innerHTML = `
            <div class="title">
              <h3>${cursor.value.title}</h3>
              <div class="menu"></div>
            </div>
            <div class="cards flex">
            ${cursor.value.value.map( (card) => {
                if(card.img) {
                    return `
                    <div class="card flex" data-listIdx="${ele.list_idx}" data-cardIdx="${card.card_idx}">
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
        insertCardForm.content.focus();

        return false;
    }
})

// 리스트 추가할때 실행
insertListForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const title = this.title.value;
    if(title === ""){
        alert('리스트명을 입력해주세요');
        this.title.focus();

        return;
    }
    const list = {
        title,
        list_idx,
        count: 0,
        value: []
    };

    createDB();
    const tx = db.transaction("list", "readwrite");
    const tList = tx.objectStore("list");
    tList.add(list);

    list_idx++;
    popupClose(e.target.closest('.popup'), e.target.closest('form'));
    render();
});

// 카드 추가할때 실행
insertCardForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const form = this;
    const list_idx = this.list_idx.value;

    if(this.content.value === ""){
        alert("카드 내용을 입력해주세요");
        this.content.focus();

        return;
    }


    // 이부분 해야함

    let imgSrc = '';
    const img = this.img.files[0];
    const reader = new FileReader();
    if(img){
        reader.readAsDataURL(img);
    }
    reader.onload = function() {
        listArr.forEach( (ele) => {
            if(ele.list_idx == list_idx) {
                ele.value.push( { card_title: form.content.value, card_idx: ele.count, img: imgSrc } );
                ele.count++;
            }
        } )
        document.querySelector("#root #insert_card_popup .photo img").src = '';
    
        popupClose(e.target.closest('.popup'), e.target.closest('form'));
        render();
    }
    
    // if(img !== undefined) {
    //     const reader = new FileReader();
    //     reader.readAsDataURL(img);
    //     reader.onload = function() {
    //         imgSrc = reader.result;
    //         listArr.forEach( (ele) => {
    //             if(ele.list_idx == list_idx) {
    //                 ele.value.push( { card_title: form.content.value, card_idx: ele.count, img: imgSrc } );
    //                 ele.count++;
    //             }
    //         } )
    //         document.querySelector("#root #insert_card_popup .photo img").src = '';
        
    //         popupClose(e.target.closest('.popup'), e.target.closest('form'));
    //         render();
    //     }
    // } else {
    //     listArr.forEach( (ele) => {
    //         if(ele.list_idx == list_idx) {
    //             ele.value.push( { card_title: this.content.value, card_idx: ele.count, img: imgSrc } );
    //             ele.count++;
    //         }
    //     } )
    //     document.querySelector("#root #insert_card_popup .photo img").src = '';
        
    //     popupClose(e.target.closest('.popup'), e.target.closest('form'));
    //     render();
    // }
    
})


document.querySelector("#root #insert_card_popup .insert_img_btn").addEventListener('change', function() {
    const img = this.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(img); 
    reader.onload = function() {
        document.querySelector("#root #insert_card_popup .photo img").src = reader.result;
    }
    
})


