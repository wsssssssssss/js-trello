const root = document.querySelector("#root");
const container = document.querySelector("#root .container");

const popup = document.querySelectorAll("#root .popup");

const insertListForm = document.querySelector("#root #insert_list_popup form");
const insertCardForm = document.querySelector("#root #insert_card_popup form");

const cardPopupImgBtn = document.querySelector("#root #card_popup .insert_img_btn");
const cardPopupImgDeleteBtn = document.querySelector("#root #card_popup .img_delete");
const cardPopupImg = document.querySelector("#root #card_popup .photo img");
const cardPopupContent = document.querySelector("#root #card_popup textarea");
const cardPopupBtns = document.querySelector("#root #card_popup .btns");

let list_idx = 0;
let db = null;

let cardTitleChg = false;
let cardContentChg = false;
let cardMove = false;

const cardCreateVar = (e) => {
    const card_form = e.target.closest("form");
    const list_idx = parseInt(card_form.list_idx.value);
    const card_idx = parseInt(card_form.card_idx.value);

    return { card_form, list_idx, card_idx };
}

// 카드 팝업의 이미지 버튼 띄우는 함수
const cardImgEx = function(src){
    const imgBtnText = document.querySelector("#root #card_popup .img_btn .img_text");
    if(src === ""){
        imgBtnText.innerHTML = '이미지 추가';
        cardPopupImgDeleteBtn.classList.add('none');
    } else {
        imgBtnText.innerHTML = '이미지 변경';
        cardPopupImgDeleteBtn.classList.remove('none');
    }
}

const readonlyList = () => {
    const tx = db.transaction("list", "readonly");
    return tx.objectStore("list");
};

const readwriteList = () => {
    const tx = db.transaction("list", "readwrite");
    return tx.objectStore("list");
};

// 팝업 띄우기
const popupOpen = (popup) => {
    popup.classList.remove('none');
}

// 팝업 지우기
const popupClose = (popup, form) => {
    popup.classList.add('none');
    form.reset();
}

const render = () => {
    [...container.children].forEach( (ele) => {
        if(ele.classList.contains('list')){
            ele.remove();
        }
    } )

    const tList = readonlyList();
    const request = tList.openCursor();
    request.onsuccess = (e) => {
        const cursor = e.target.result;

        if(cursor) {
            const list = document.createElement('div');
            list.classList.add('list');
            list.innerHTML = `
            <div class="title flex">
              <h3>${cursor.value.title}</h3>
              <div class="menu"> <i class="fa fa-chevron-down" data-listidx="${cursor.value.list_idx}"></i> </div>
            </div>
            <div class="cards flex">
            ${cursor.value.value.map( (card) => {
                if(card.img !== '') {
                    return `
                    <div class="card flex" data-listidx="${cursor.value.list_idx}" data-cardIdx="${card.card_idx}">
                        <div class="photo">
                            <img src="${card.img}" draggable="false">
                        </div>
                        <h3 draggable="false">${card.card_title}</h3>
                    </div>`
                } else {
                    return `
                    <div class="card flex" data-listidx="${cursor.value.list_idx}"  data-cardIdx="${card.card_idx}">
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




const handleRootClick = e => {
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
    if(e.target.classList.contains("fa-chevron-down") || e.target.classList.contains("fa-chevron-up")) {
        if(e.target.classList.contains("fa-chevron-down")) {
            const menu = document.createElement("div");
            menu.classList.add("list_menu");
            menu.innerHTML = `<div class="list_delete" data-listidx="${e.target.dataset.listidx}">리스트 삭제</div>`;
            e.target.appendChild(menu);
        } else {
            e.target.children[0].remove();
        }

        e.target.classList.toggle("high");
        e.target.classList.toggle("fa-chevron-down");
        e.target.classList.toggle("fa-chevron-up");

        return false;
    }

    // 리스트 삭제 버튼 클릭시 실행
    if(e.target.classList.contains("list_delete")) {
        if(confirm("리스트를 삭제 하시겠습니까?")) {
            const tList = readwriteList();
            tList.delete(parseInt(e.target.dataset.listidx));
            render();
        }
        
        return false;
    }

    // 카드 클릭시 실행
    if(e.target.closest(".card") && !cardMove) {
        const card_popup = document.querySelector("#card_popup");
        const card_form = document.querySelector("#card_popup form");
        const card = e.target.closest(".card");
        popupOpen(card_popup);

        const list_idx = parseInt(card.dataset.listidx);
        const card_idx = parseInt(card.dataset.cardidx);
        
        const tList =  readonlyList();
        const request = tList.openCursor();
        request.onsuccess = e => {
            const cursor = e.target.result;

            if(cursor) {
                if(cursor.key === list_idx) {
                    cursor.value.value.forEach( (ele) => {
                        if(ele.card_idx === card_idx) {
                            card_form.list_idx.value = list_idx;
                            card_form.card_idx.value = card_idx;
                            document.querySelector("#root #card_popup .title h3").innerHTML = ele.card_title;
                            cardPopupImg.src = ele.img;
                            cardImgEx(ele.img);
                            card_form.content[0].innerText = ele.card_content;
                            card_form.content[1].value = ele.card_content;
                        }
                    } )
                }

                cursor.continue();
            }
        }

        return false;
    }

    // 카드 삭제 버튼 클릭시 실행
    if(e.target.classList.contains("card_delete")) {
        const card_popup = e.target.closest("#card_popup");

        const { card_form, list_idx, card_idx } = cardCreateVar(e);

        const tList = readwriteList();
        const request = tList.openCursor();

        request.onsuccess = (e) => {
            const cursor = e.target.result;
            
            if(cursor) {
                if(cursor.key === list_idx && confirm("카드를 삭제 하시겠습니까?")) {
                    const updateData = cursor.value;
                    
                    updateData.value.forEach( (ele, idx) => {
                        if(ele.card_idx === card_idx) {
                            updateData.value.splice(idx, 1);
                        }
                    } )

                    const request2 = cursor.update(updateData);
                    request2.onsuccess = () => {
                        popupClose(card_popup, card_form);
                        render();
                    }
                }

                cursor.continue();
            }
        };

        return false;
    }

    // 카드 팝업의 이미지 삭제 버튼 클릭시 실행
    if(e.target.classList.contains("img_delete")) {
        const { card_form, list_idx, card_idx } = cardCreateVar(e);

        const tList = readwriteList();
        const request = tList.openCursor();

        request.onsuccess = (e) => {
            const cursor = e.target.result;

            if(cursor) {
                if(cursor.key === list_idx) {

                    const updateData = cursor.value;  
                
                    updateData.value.forEach( (ele, idx) => {
                        if(ele.card_idx === card_idx) {
                            const obj = {
                                ...ele, 
                                img: ''
                            }
                            cardPopupImg.src = '';
                            updateData.value.splice(idx, 1, obj)
                        }
                    } )

                    const requestUpdate = cursor.update(updateData);

                    requestUpdate.onsuccess = function() {
                        cardImgEx('');
                        render();
                    }
                }
                cursor.continue();
            }
        }

        return false;
    }

    // 카드 팝업 제목 클릭시 실행
    if(e.target.classList.contains("card_title")) {
        const { card_form, list_idx, card_idx } = cardCreateVar(e);

        const input = document.querySelector("#card_popup .title input");
        const card_title = e.target;
        const title = e.target.innerText;

        cardTitleChg = true;

        input.classList.toggle('none');
        card_title.classList.toggle('none');
        input.value = title;

        input.focus();
        
        const titleChangeFunc = () => {
            input.classList.toggle('none');
            card_title.classList.toggle('none');
            cardTitleChg = false;

            const tList = readwriteList();
            const request = tList.openCursor();

            request.onsuccess = (e) => {
                const cursor = e.target.result;

                if(cursor){
                    if(cursor.key === list_idx) {
                        const updateData = cursor.value;

                        updateData.value.forEach( (ele, idx) => {
                            if(ele.card_idx === card_idx) {
                                updateData.value.splice(idx, 1, {...ele, card_title: input.value})
                                card_title.innerText = input.value;
                            }
                        } )

                        const request2 = cursor.update(updateData);
                        request2.onsuccess = () => {
                            render();
                        }
                    }
                    cursor.continue();
                }
            }
        }

        input.addEventListener('keydown', function(e) {
            if(e.key === "Enter"){
                e.preventDefault();
                if(cardTitleChg){
                    titleChangeFunc(); 
                }
            }
        })

        input.addEventListener('blur', function(e) {
            if(cardTitleChg){
                titleChangeFunc(); 
            }
        })

        return false;
    }

    // 카드 팝업 설명 클릭시 실행
    if(e.target.classList.contains("card_text_content")) {
        const { card_form, list_idx, card_idx } = cardCreateVar(e);

        const input = document.querySelector("#card_popup .text_content input");
        const textarea = e.target;

        cardContentChg = true;

        textarea.classList.toggle('none');
        input.classList.toggle('none');
        input.focus();


        const contentChangeFunc = () => {
            textarea.classList.toggle('none');
            input.classList.toggle('none');
            cardContentChg = false;

            const tList = readwriteList();
            const request = tList.openCursor();

            request.onsuccess = (e) => {
                const cursor = e.target.result;

                if(cursor){
                    if(cursor.key === list_idx) {
                        const updateData = cursor.value;

                        updateData.value.forEach( (ele, idx) => {
                            if(ele.card_idx === card_idx) {
                                updateData.value.splice(idx, 1, {...ele, card_content: input.value})
                                textarea.innerText = input.value;
                            }
                        } )

                        const requestUpdate = cursor.update(updateData);
                        requestUpdate.onsuccess = () => {
                            render();
                        }
                    }
                    cursor.continue();
                }
            }
        }

        input.addEventListener('keydown', function(e) {
            if(e.key === "Enter"){
                e.preventDefault();
                if(cardContentChg){
                    contentChangeFunc(); 
                }
            }
        })

        input.addEventListener('blur', function(e) {
            if(cardContentChg){
                contentChangeFunc(); 
            }
        })

        return false;
    }


}



const onListSbm = e => {
    e.preventDefault();
    const event = e;
    const title = e.currentTarget.title.value;

    const tList = readwriteList();
    const request = tList.openCursor(null, "prev");

    request.onsuccess = e => {
        const cursor = e.target.result;
        list_idx = cursor ? cursor.value.list_idx + 1 : 0;

        tList.add( { title, list_idx, count: 0, value: [] } );
    
        popupClose(event.target.closest('.popup'), event.target.closest('form'));
        render();
    }
}


const onCardSbm = e => {
    e.preventDefault();
    const form = e.currentTarget;
    const event = e;
    const list_idx = e.currentTarget.list_idx.value;

    if(e.currentTarget.title.value === ""){
        alert("카드 내용을 입력해주세요");
        e.currentTarget.title.focus();
        return;
    }

    const tList = readwriteList();
    const request = tList.openCursor();

    request.onsuccess = (e) => {
        const cursor = e.target.result;
        if(cursor) {
            if(cursor.key === parseInt(list_idx)) {
                const updateData = cursor.value;

                updateData.value.push( { card_title: form.title.value, card_content: "설명을 입력해주세요..", card_idx: updateData.count, img: '' } );
                updateData.count++;
                
                const request2 = cursor.update(updateData);
                request2.onsuccess = () => {
                    popupClose(event.target.closest('.popup'), event.target.closest('form'));
                    render();
                }
            }
            cursor.continue();
        }
    }
}



const onChgCardImg = async e => {
    const card_form = e.target.closest("form");

    const list_idx = parseInt(card_form.list_idx.value);
    const card_idx = parseInt(card_form.card_idx.value);
    
    const imgReader = function(img) {
        return new Promise( (res) => {
            const reader = new FileReader();
            reader.readAsDataURL(img);
            reader.onload = () => res(reader.result);
        } )
    }

    const img = e.currentTarget.files[0];
    const src = await imgReader(img).then( (src) => {return src} );

    const tx = db.transaction("list", "readwrite");
    const tList = tx.objectStore("list");
    const request = tList.openCursor();

    request.onsuccess = (e) => {
        const cursor = e.target.result;

        if(cursor) {
            if(cursor.key === list_idx) {
                const updateData = cursor.value;  
                
                updateData.value.forEach( (ele, idx) => {
                    if(ele.card_idx === card_idx) {
                        const obj = { ...ele, img: src };
                        cardPopupImg.src = src;
                        cardImgEx(src);
                        updateData.value.splice(idx, 1, obj)
                    }
                } )

                const requestUpdate = cursor.update(updateData);

                requestUpdate.onsuccess = function() {
                    render();
                }
            }
            cursor.continue();
        }
    }
}

// const pos = {
//     xPos: 0, 
//     yPos: 0,
// }

// let nowCard = undefined;
// let card_layerX = 0;
// let card_layerY = 0;

// window.addEventListener('mousedown', e => {
//     if(e.target.closest('.card')) {
//         nowCard = e.target.closest('.card');
        
//         pos.xPos = e.pageX;
//         pos.yPos = e.pageY;

//         card_layerX = e.layerX;
//         card_layerY = e.layerY;

//         nowCard.style.position = 'absolute';
//         nowCard.style.zIndex = 99;
//         nowCard.style.left = `${pos.xPos - card_layerX}px`;
//         nowCard.style.top = `${pos.yPos - card_layerY}px`;
//     }
// })

// window.addEventListener('mousemove', e => {
//     cardMove = true;
//     const Xpos = e.pageX - pos.xPos;
//     const Ypos = e.pageY - pos.yPos;

//     nowCard.style.left = `${pos.xPos + Xpos - card_layerX}px`;
//     nowCard.style.top = `${pos.yPos + Ypos - card_layerY}px`;
//     // console.log('move');
//     if(e.target.closest('.cards')){
//         // console.log(e.target.closest('.cards'));
//     }
// })

// window.addEventListener('mouseup', e => {
    
//     setTimeout( _ => {
//         nowCard.style.removeProperty('position');
//         nowCard.style.zIndex = 0;
//         nowCard.style.removeProperty('left');
//         nowCard.style.removeProperty('top');
        
//         pos.xPos = 0;
//         pos.yPos = 0;
        
//         card_layerX = 0;
//         card_layerY = 0;
//         cardMove = false; 
//         nowCard = undefined;
//     }, 100)
// })




// 모든 클릭 이벤트에 대한 이벤트 핸들러
root.addEventListener('click', handleRootClick);

// 리스트 추가할때 실행
insertListForm.addEventListener('submit', onListSbm);

// 카드 추가할때 실행
insertCardForm.addEventListener('submit', onCardSbm);

// 카드 팝업의 이미지 변경 or 추가 할때 실행
cardPopupImgBtn.addEventListener('change', onChgCardImg);


// root.addEventListener('dragstart', function(e) {
//     console.log(e);  
//     // if(e.target.classList.contains('card')){
//     //     console.log(1);
//     // }
// })


window.onload = _ => {
    const request = indexedDB.open('trello', 1);

    request.onupgradeneeded = function(e) {
        db = e.target.result;
        db.createObjectStore("list", {keyPath: "list_idx"});
    }

    const request2 = indexedDB.open('trello', 1);
    request2.onsuccess = e => {
        db = e.target.result;
        render();
    }

}
