const addlistBtn = document.querySelector(".addlist");
let boardContainer = document.querySelector(".container");
// popuplist
const list_popupWrap = document.querySelector(".list__popup");
const list_exitBtn = document.querySelector(".list__cancel--btn");
const list_addBtn = document.querySelector(".list__add--btn");
const list_listForm = document.list__form;
//popupcard
const card_popupWrap = document.querySelector(".card__popup");
const card_exitBtn = document.querySelector(".card__cancel--btn");
const card_addBtn = document.querySelector(".card__add--btn");
const card_cardForm = document.card__form;

const createEl = (el) => document.createElement(el);
const list_popupToggle = () => list_popupWrap.classList.toggle("none");
const card_popupToggle = () => card_popupWrap.classList.toggle("none");
list_exitBtn.addEventListener("click", list_popupToggle);
addlistBtn.addEventListener("click",list_popupToggle);

card_exitBtn.addEventListener("click", card_popupToggle)
card_addBtn.addEventListener("click", card_popupToggle)

const addCardEvt = () => {
  
}

const addList = () => {
  console.log("addList");
  let title = list_listForm.list.value;
  if(title !== ''){
    const list = createEl('div');
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
    addlistBtn.before(list);
    list_listForm.reset();
  };
  boardContainer.childNodes.forEach(el => {
    el.addEventListener("click", (e) => {
      if(e.target.classList.contains("list__footer") || e.target.classList.contains("list__footer--txt") ){
        let card_input = card_cardForm.card.value;
        console.log("add card");
        e.currentTarget.childNodes[1].childNodes[3].innerHTML +=
        `<div class="card">
        ${card_input}
        </div>`
        card_cardForm.reset();
        card_popupToggle();
      }
    })
  });
  list_popupToggle();
  
  
};

list_addBtn.addEventListener("click", addList);

 
const openFileButton = document.querySelector("#openFile"); 
openFileButton.addEventListener("click", async e => {
  const [fileHandle] = await showOpenFilePicker();   
  const file = await fileHandle.getFile();
  const urlCreator = window.URL || window.webkitURL;
  const mediaUrl = urlCreator.createObjectURL(file);
  const image = document.querySelector("#card__add--img");
  image.src = mediaUrl;
  console.log(mediaUrl);
  
});
