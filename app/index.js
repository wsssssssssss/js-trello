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


const readonlyList = () => {
    const tx = db.transaction("list", "readonly");
    return tx.objectStore("list");
};

const readwriteList = () => {
    const tx = db.transaction("list", "readwrite");
    return tx.objectStore("list");
};

const OpenCursor = (str) => {
    if(str === 'only') {
        return readonlyList().openCursor();
    } else if(str === 'write') {
        return readwriteList().openCursor();
    }
};


// 카드 팝업의 이미지 버튼 띄우는 함수
const cardImgEx = function(src){
    const imgBtnText = document.querySelector("#root #card_popup .img_btn .img_text");
    
    imgBtnText.innerHTML = src === "" ? '이미지 추가' : '이미지 변경';
    cardPopupImgDeleteBtn.className = src === "" ? "img_delete none" : "img_delete";
}

// 팝업 띄우기
const popupOpen = (id) => {
    document.querySelector(`#root #${id}`).classList.remove('none');
}

// 팝업 지우기
const popupClose = () => {
    document.querySelectorAll("#root .popup").forEach( ele => {
        ele.classList.add("none");
        ele.children[0].reset();
    } );
}

const render = () => {
    [...container.children].forEach( (ele) => {
        if(ele.classList.contains('list')){
            ele.remove();
        }
    } )

    const request = OpenCursor('only');

    request.onsuccess = (e) => {
        const cursor = e.target.result;
        if(cursor) {
            const list = document.createElement('div');
            list.classList.add('list');
            list.innerHTML = `
            <div class="title flex">
              <h3>${cursor.value.title}</h3>
              <div class="menu"> <i class="fa fa-close list_delete" data-listidx="${cursor.key}"></i> </div>
            </div>
            <div class="cards flex" data-listidx="${cursor.value.list_idx}">
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


const rootTarget = {
    // 취소 버튼 클릭시 실행
    '.close': (target) => { popupClose(); },

    // 리스트 추가 버튼 클릭시 실행
    '.add_list': (target) => {  
        popupOpen("insert_list_popup");
        insertListForm.title.focus(); 
    },

    // 카트 추가 버튼 클릭시 실행
    '.add_card': (target) => {
        popupOpen("insert_card_popup");
        insertCardForm.list_idx.value = target.dataset.num || target.parentNode.dataset.num;
        insertCardForm.title.focus();
    },

    // 리스트 삭제 버튼 클릭시 실행
    '.list_delete': (target) => {
        const tList = readwriteList();
        tList.delete(parseInt(target.dataset.listidx));
        render();
    },

    // 카드 클릭시 실행
    '.card': (target) => {
        const card_form = document.querySelector("#card_popup form");
        const card = target.closest(".card");
        popupOpen("card_popup");
        
        const list_idx = parseInt(card.dataset.listidx);
        const card_idx = parseInt(card.dataset.cardidx);

        const request = OpenCursor('only');
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
    },

    // 카드 삭제 버튼 클릭시 실행
    '.card_delete': (target) => {
        const request = OpenCursor('write');

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
                        popupClose();
                        render();
                    }
                }
                cursor.continue();
            }
        };
    },

    // 카드 팝업의 이미지 삭제 버튼 클릭시 실행
    '.img_delete': (target) => {
        const card_form = target.closest("form");
        const list_idx = parseInt(card_form.list_idx.value);
        const card_idx = parseInt(card_form.card_idx.value);
        const request = OpenCursor('write');

        request.onsuccess = (e) => {
            const cursor = e.target.result;
            if(cursor) {
                if(cursor.key === list_idx) {
                    const updateData = cursor.value;  
                    updateData.value.forEach( (ele, idx) => {
                        if(ele.card_idx === card_idx) {
                            const obj = { ...ele, img: '' };
                            cardPopupImg.src = '';
                            updateData.value.splice(idx, 1, obj)
                        }
                    } )
                    const requestUpdate = cursor.update(updateData);
                    requestUpdate.onsuccess = () => {
                        cardImgEx('');
                        render();
                    }
                }
                cursor.continue();
            }
        }
    },

    // 카드 팝업 제목 클릭시 실행
    '.card_title': (target) => {
        const card_form = target.closest("form");
        const list_idx = parseInt(card_form.list_idx.value);
        const card_idx = parseInt(card_form.card_idx.value);
        const input = document.querySelector("#card_popup .title input");
        const card_title = target;
        const title = target.innerText;

        cardTitleChg = true;
        input.classList.toggle('none');
        card_title.classList.toggle('none');
        input.value = title;
        input.focus();

        const titleChangeFunc = () => {
            input.classList.toggle('none');
            card_title.classList.toggle('none');
            cardTitleChg = false;
            
            const request = OpenCursor('write');

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
                        console.log(updateData);

                        const updateRequest = cursor.update(updateData);
                        updateRequest.onsuccess = () => {
                            render();
                        }
                    }
                    cursor.continue();
                }
            }
        }

        input.addEventListener('keydown', (e) => {
            if(e.key === "Enter"){
                e.preventDefault();
                console.log(cardTitleChg);
                if(cardTitleChg){
                    titleChangeFunc(); 
                }
            }
        })

        input.addEventListener('blur', (e) => {
            if(cardTitleChg){
                titleChangeFunc(); 
            }
        })
    },

    // 카드 팝업 설명 클릭시 실행
    '.card_text_content': (target) => {
        const card_form = target.closest("form");
        const list_idx = parseInt(card_form.list_idx.value);
        const card_idx = parseInt(card_form.card_idx.value);
        const input = document.querySelector("#card_popup .text_content input");
        const textarea = target;

        cardContentChg = true;
        textarea.classList.toggle('none');
        input.classList.toggle('none');
        input.focus();

        const contentChangeFunc = () => {
            textarea.classList.toggle('none');
            input.classList.toggle('none');
            cardContentChg = false;

            const request = OpenCursor('write');

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
                            // render();
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
    },
};


const handleRootClick = ({ target }) => {
    for(let key in rootTarget) {
        target.closest(key) && rootTarget[key](target);
    }
};

const onListSbm = e => {
    e.preventDefault();
    const event = e;
    const title = e.currentTarget.title.value;
    const tList = readwriteList();
    const request = tList.openCursor(null, "prev");

    request.onsuccess = (e) => {
        const cursor = e.target.result;
        list_idx = cursor ? cursor.value.list_idx + 1 : 0;
        tList.add( { title, list_idx, count: 0, value: [] } );
    
        popupClose();
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

    const request = OpenCursor('write');

    request.onsuccess = (e) => {
        const cursor = e.target.result;
        if(cursor) {
            if(cursor.key === parseInt(list_idx)) {
                const updateData = cursor.value;

                updateData.value.push( { card_title: form.title.value, card_content: "설명을 입력해주세요..", card_idx: updateData.count, img: '' } );
                updateData.count++;
                
                const request2 = cursor.update(updateData);
                request2.onsuccess = () => {
                    popupClose();
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
    
    const imgReader = (img) => {
        return new Promise( (res) => {
            const reader = new FileReader();
            reader.readAsDataURL(img);
            reader.onload = () => res(reader.result);
        } )
    };

    const img = e.currentTarget.files[0];
    const src = await imgReader(img).then( (src) => {return src} );

    const tList = readwriteList();
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

const mousePos = {};
const cardInfo = {};
let cardCho = false;
let cloneCard = undefined;

let mouseMove = false;
let nowCard = undefined;

const cardPla = document.createElement('div');
cardPla.className = 'cardPla';

const dragMuDownhandle = e => {
    if(!e.target.closest('.card')) {
        return false;
    }

    nowCard = e.target.closest('.card');
    const cardRect = nowCard.getBoundingClientRect();
    cardCho = true;
    mouseMove = false;

    Object.assign(mousePos, {
        x: e.pageX, 
        y: e.pageY
    });

    Object.assign(cardInfo, {
        layerX: e.pageX - cardRect.left,
        layerY: e.pageY - cardRect.top,
        width: nowCard.clientWidth,
        height: nowCard.clientHeight
    });

    cardPla.style.width = cardInfo.width + 'px';
    cardPla.style.height = cardInfo.height + 'px';

    cloneCard = nowCard.cloneNode(true);

    Object.assign(cloneCard.style, {
        position: 'fixed',
        width: nowCard.clientWidth + 'px',
        height: nowCard.clientHeight + 'px',
        left: cardRect.left + 'px',
        top: cardRect.top + 'px',
        zIndex: 999
    });

    nowCard.parentElement.insertBefore(cardPla, nowCard);
    nowCard.style.display = 'none';

    document.body.appendChild(cloneCard);
};

const dragMuMoveHandle = e => {
    if(!cardCho) {
        return false;
    };
    mouseMove = true;

    Object.assign(mousePos, {
        x: e.pageX,
        y: e.pageY
    });

    Object.assign(cloneCard.style, {
        left: e.pageX - cardInfo.layerX + 'px',
        top: e.pageY - cardInfo.layerY + 'px'
    });

    Array.from(document.querySelectorAll("#root .list")).some( list => {
        const listRect = list.getBoundingClientRect();
        
        if(listRect.left < mousePos.x && mousePos.x < listRect.left + list.clientWidth) {
            const cards = list.children[1];
            const isAddPla = Array.from(cards.children).filter(({classList}) => classList.contains('card')).some(card => {
                const cardRect = card.getBoundingClientRect();
            
                if(mousePos.y < cardRect.top + card.clientHeight / 2) {
                    cardPla.remove();
                    cards.insertBefore(cardPla, card);

                    return true;
                }
            });

            if(!isAddPla) {
                cardPla.remove();
                cards.appendChild(cardPla);
            }

            return true;
        }
    } );
};

const dragMuUpHandle = e => {
    if(cardCho && !mouseMove){
        cardCho = false;
        nowCard.style.display = 'block';
        nowCard.click();
        nowCard = undefined;
        cloneCard.remove();
        cloneCard.removeAttribute('style');
        cloneCard = undefined;
        cardPla.remove();
    } else if (cardCho && mouseMove) {

        nowCard.remove();
        nowCard = undefined;
        cardCho = false;

        const list_idx = parseInt(cloneCard.dataset.listidx);
        const card_idx = parseInt(cloneCard.dataset.cardidx);
        const prevEle = cardPla.previousElementSibling;

        let prevList_idx = prevEle ? parseInt(prevEle.dataset.listidx) : parseInt(cardPla.parentElement.dataset.listidx);
        let prevCard_idx = prevEle ? parseInt(prevEle.dataset.cardidx) : undefined;


        const request = OpenCursor('write');
        request.onsuccess = (e) => {
            const cursor = e.target.result;
            if(cursor) {
                if(cursor.key === list_idx){
                    const updateData = cursor.value;
                    let updateVal;

                    updateData.value.forEach( (ele, idx) => {
                        if(ele.card_idx === card_idx) {
                            updateVal = ele;
                            updateData.value.splice(idx, 1);
                        }
                    } )

                    const updateRequest = cursor.update(updateData);

                    updateRequest.onsuccess = _ => {
                        const request2 = OpenCursor('write');
                        request2.onsuccess = (e) => {
                            const cursor = e.target.result;
                            if(cursor) {
                                if(cursor.key === prevList_idx) {
                                    const updateData2 = cursor.value;
                                    if(prevCard_idx !== undefined) {
                                        updateData2.value.forEach( (ele, idx) => {
                                            if(ele.card_idx === prevCard_idx){
                                                updateData2.value.splice(idx+1, 0, {... updateVal, card_idx: updateData2.count});
                                                updateData2.count++;
                                            }
                                        } )
                                    } else {
                                        updateData2.value.splice(0, 0, {... updateVal, card_idx: updateData2.count});
                                        updateData2.count++;
                                    }

                                    const updateRequest2 = cursor.update(updateData2);
                                    updateRequest2.onsuccess = _ => {
                                        render();
                                    }
                                }
                                cursor.continue();
                            }
                        }
                    }
                }
                cursor.continue();
            }
        }
        cloneCard.remove();
        cloneCard.removeAttribute('style');
        cardPla.parentElement.insertBefore(cloneCard, cardPla);
        cloneCard = undefined;
        cardPla.remove();
    }
};


// drag 이벤트 핸들러들
window.addEventListener('mousedown', dragMuDownhandle);

window.addEventListener('mousemove', dragMuMoveHandle);

window.addEventListener('mouseup', dragMuUpHandle);


// 모든 클릭 이벤트에 대한 이벤트 핸들러
root.addEventListener('click', handleRootClick);

// 리스트 추가할때 실행
insertListForm.addEventListener('submit', onListSbm);

// 카드 추가할때 실행
insertCardForm.addEventListener('submit', onCardSbm);

// 카드 팝업의 이미지 변경 or 추가 할때 실행
cardPopupImgBtn.addEventListener('change', onChgCardImg);

window.onload = _ => {
    const request = indexedDB.open('trello', 1);
    request.onupgradeneeded = (e) => {
        db = e.target.result;
        db.createObjectStore("list", {keyPath: "list_idx"});
    }

    request.onsuccess = (e) => {
        db = e.target.result;
        render();
    }
};