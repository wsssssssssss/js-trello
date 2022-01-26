console.log('hello world');

// [
//     {
//          title: '리스트 제목'
//          num: '1'
//          value: [
//             {"card_title": "카드제목", 'img': '이미지 이름'},
//             {"card_title": "카드제목", 'img': '이미지 이름'},
//             {"card_title": "카드제목", 'img': '이미지 이름'},
//             {"card_title": "카드제목", 'img': '이미지 이름'}
//         ]
//     },
//     {
//          title: '리스트 제목'
//          num: '2'
//          value: [
//             {"card_title": "카드제목", 'img': '이미지 이름'},
//             {"card_title": "카드제목", 'img': '이미지 이름'},
//             {"card_title": "카드제목", 'img': '이미지 이름'},
//             {"card_title": "카드제목", 'img': '이미지 이름'}
//         ]
//     },
//     {
//          title: '리스트 제목'
//          num: '3'
//          value: [
//             {"card_title": "카드제목", 'img': '이미지 이름'},
//             {"card_title": "카드제목", 'img': '이미지 이름'},
//             {"card_title": "카드제목", 'img': '이미지 이름'},
//             {"card_title": "카드제목", 'img': '이미지 이름'}
//         ]
//     },
// ]

const listArr = [];
let indexNum = 0;


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
            return `<div class="card">${card.card_title}</div>`
        } ).join("")}
        </div>
        <div class="add_card add_btn flex" data-num="${ele.indexNum}">
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
        insertCardForm.indexNum.value = e.target.dataset.num;
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
    listArr.push( { title, indexNum, value: [] } );
    indexNum++;
    popupClose(e.target.closest('.popup'), e.target.closest('form'));
    render();
});

// 카드 추가할때 실행
insertCardForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const indexNum = this.indexNum.value;
    // console.log(indexNum);
    // console.log(this.content.value);
    // console.log(this.img.value.replace("C:\\fakepath\\", ""));
    listArr.forEach( (ele) => {
        if(ele.indexNum == indexNum) {
            ele.value.push( { card_title: this.content.value } );
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



