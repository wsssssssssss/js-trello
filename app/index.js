console.log('hello world');
const board = document.querySelector(".board");
const addList = document.querySelector(".addList");
const listPopup = document.querySelector(".listPopup");
const button = listPopup.querySelector("button");
const input = listPopup.querySelector("input");
const addCard = document.querySelector(".addCard");
const listMenu = document.querySelector(".listMenu");
const list = document.querySelectorAll(".list");
const listFlex = document.querySelector(".listContainer");
let listData = [];
let listArr = [];
let idxL = 0;
let cardData = [];
let cardArr = [];
let idxC = 0;
listFlex.innerHTML = "";

addList.addEventListener("click", () => { // 리스트 팝업
  listPopup.classList.remove("none");
  input.value = "";
  input.focus();
});
button.addEventListener("click", () => { // 리스트 추가 버튼
  let listId = ++idxL;
  let listTitle = input.value;
  listPopup.classList.add("none");
  listData.push({ listId, listTitle });
  {
    listFlex.innerHTML = "";
    listData.forEach(listItem => {
      let divList = makeList(listItem);
      listFlex.prepend(divList);

      divList.addEventListener("click", e => { // 리스트
        if (e.target.className === "listMenu") { // 리스트 삭제
          listArr.push(e.currentTarget);
          listArr.forEach(x => {
            let num = listData.findIndex(t => t.id == x.id);
            listData.splice(num, 1);
            x.remove();
          });
        }
        if (e.target.className === "addCard") { // 카드추가
          const cardTitlePopup = document.querySelector(".cardTitlePopup");
          const cardTitlePopupBtn = cardTitlePopup.querySelector("button");
          const cardTitlePopupInput = cardTitlePopup.querySelector("input");
          let cardFlex = e.currentTarget.querySelector(".cardFlex");
          cardTitlePopup.classList.replace("none", "block");
          cardTitlePopupInput.focus();
          cardTitlePopupInput.value = "";
          cardTitlePopupBtn.addEventListener("click", () => {
            let cardId = ++idxC;
            let cardTitle = cardTitlePopupInput.value;
            cardTitlePopup.classList.replace("block", "none");
            cardData.push({ cardId, cardTitle });
            cardData.forEach(cardItem => {
              let divCard = makeCard(cardItem);
              cardFlex.innerHTML = "";
              cardFlex.prepend(divCard);
            });
          });
        }
        if (e.target.className === "card") { // 카드 팝업
          const cardPopup = document.querySelector(".cardPopup");
          const popup = cardPopup.querySelector(".popup");
          console.log(e.currentTarget.querySelector(".card > .cardTitle").innerText);
          popup.innerHTML =
            `
            <div class="popupTitle">title</div>
            <div class="content">설명을 입력해 주세요..</div>
            <div class="cardBtn flex">
              <button>삭제</button>
              <button>닫기</button>
            </div>
            `
          cardPopup.classList.replace("none", "block");
        }
      });
    });
  }
});
function makeList({ listId, listTitle }) { // 리스트 생성
  let div = document.createElement("div");
  div.innerHTML =
    `
    <div class="list" id="${listId}">
      <div class="listFlex flex">
        <div class="listTitle">${listTitle}</div>
        <div class="listMenu">...</div>
      </div>
      <div class="cardFlex flex"></div>
      <div class="addCardFlex flex">
        <div class="addCard">+ Add a card</div>
        <div class="addImg">ㅁ</div>
      </div>
    </div>
    `
  return div;
  // return div.firstElementChild;
}
function makeCard({ cardId, cardTitle }) { // 카드 생성
  let div = document.createElement("div");
  div.innerHTML =
  `
  <div class="card" id="${cardId}>
    <div class="cardTitle">${cardTitle}</div>
  </div>
  `
  return div;
}
// 리스트 삭제후 리스트 추가시 기존에 있던 리스트가 초기화 됨.
// 리스트 삭제 버튼
// 카드 추가 시 두 번째 부터는 여러개가 쌓임 => 배열에 한번에 여러개가 추가