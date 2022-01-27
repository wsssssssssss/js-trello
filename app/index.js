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

const listArr = [];
let list_idx = 0;


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

const render = function() {
    [...container.children].forEach( (ele) => {
        if(ele.classList.contains('list')){
            ele.remove();
        }
    } )
    listArr.forEach( (ele) => {
        const list = document.createElement('div');
        list.classList.add('list');
        list.innerHTML = `
        <div class="title">
          <h3>${ele.title}</h3>
          <div class="menu"></div>
        </div>
        <div class="cards flex">
        ${ele.value.map( (card) => {
            return `<div class="card" data-idx="${card.card_idx}">${card.card_title}</div>`
        } ).join("")}
        </div>
        <div class="add_card add_btn flex" data-num="${ele.list_idx}">
          <p class="plus">+</p>
          <p>Add a card</p>
          <i class="fa fa-edit"></i>
        </div>
        `;
        document.querySelector("#root .container .add_list").before(list);
    } )
};




// popup.forEach( (pop) => {
//     pop.addEventListener('click', function(e) {
//         if(e.target.classList.contains('popup')) {
//             popupClose(this, this.children);
//         }
//     })
// } )




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
        insertCardForm.list_idx.value = e.target.dataset.num;
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
        return;
    }
    listArr.push( { title, list_idx, value: [], count: 0 } );
    list_idx++;
    popupClose(e.target.closest('.popup'), e.target.closest('form'));
    render();
});

// 카드 추가할때 실행
insertCardForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const list_idx = this.list_idx.value;
    // console.log(list_idx);
    // console.log(this.content.value);
    // console.log(this.img.value.replace("C:\\fakepath\\", ""));
    listArr.forEach( (ele) => {
        if(ele.list_idx == list_idx) {
            ele.value.push( { card_title: this.content.value, card_idx: ele.count } );
            ele.count++;
        }
    } )
    popupClose(e.target.closest('.popup'), e.target.closest('form'));
    console.log(listArr);
    render();
})


document.querySelector("#root #insert_card_popup .insert_img_btn").addEventListener('change', function() {
    const img = this.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(img); 
    reader.onload = function() {
        document.querySelector("#root #insert_card_popup .photo img").src = reader.result;
        // console.log(reader.result);
    }
    
})



