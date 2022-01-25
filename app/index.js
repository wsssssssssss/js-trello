console.log('hello world');

// const listObj = {};
const listArr = [];

// [
//     {
//         '리스트제목1': [
//             {"카드제목": "카드내용", '이미지': '이미지 경로'},
//             {"카드제목": "카드내용", '이미지': '이미지 경로'},
//             {"카드제목": "카드내용", '이미지': '이미지 경로'},
//             {"카드제목": "카드내용", '이미지': '이미지 경로'}
//         ]
//     },
//     {
//         '리스트제목2': [
//             {"카드제목": "카드내용", '이미지': '이미지 경로'},
//             {"카드제목": "카드내용", '이미지': '이미지 경로'},
//             {"카드제목": "카드내용", '이미지': '이미지 경로'},
//             {"카드제목": "카드내용", '이미지': '이미지 경로'}
//         ]
//     },
//     {
//         '리스트제목3': [
//             {"카드제목": "카드내용", '이미지': '이미지 경로'},
//             {"카드제목": "카드내용", '이미지': '이미지 경로'},
//             {"카드제목": "카드내용", '이미지': '이미지 경로'},
//             {"카드제목": "카드내용", '이미지': '이미지 경로'}
//         ]
//     },
// ]

const root = document.querySelector("#root");

const addListBtn = document.querySelector("#root .container .add_list");
const insertListPopup = document.querySelector("#root #insert_list_popup");
const listPopupClose = document.querySelector("#root #insert_list_popup .close");
const insertListForm = document.querySelector("#root #insert_list_popup form");

const render = function() {

};


addListBtn.addEventListener('click', function() {
    insertListPopup.classList.remove('none');
});

listPopupClose.addEventListener('click', function() {
    insertListPopup.classList.add('none');
    insertListForm.reset();
});

insertListForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const title = this.title.value;
    // listArr[`${title}`] = [];
    // console.log(title);
    console.log(listArr);
});




