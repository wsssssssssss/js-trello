const db = (() => {
  let db; // indexedDB database 변수

  const req = window.indexedDB.open('db20220307'); // indexedDB connection open을 요청함
  req.onsuccess = _ => {
    db = req.result;
    init();
  }; // db 연결 성공하면 db 값에 저장
  req.onupgradeneeded = _ => {
    req.result.createObjectStore('cardList', { keyPath: 'id', autoIncrement: true }); // db 연결 최초 성공시 objectStore 생성함
    req.result.createObjectStore('list', { keyPath: 'id', autoIncrement: true }); // db 연결 최초 성공시 objectStore 생성함
  }

  const getStore = (key) => db.transaction(key, 'readwrite').objectStore(key); // Object Store getter

  const getSuccess = (req) => new Promise(res => req.onsuccess = ({ target: { result }}) => res(result));

  const get = (key, id) => getSuccess(getStore(key).get(id));
  const getAll = (key) => getSuccess(getStore(key).getAll());
  const count = (key) => getSuccess(getStore(key).count());
  const remove = (key, id) => getSuccess(getStore(key).delete(id));

  const update = async (key, item, fn) => {
    if (fn) {
      item = fn(await get(key, item));
    }

    getSuccess(getStore(key).put(item));
  }

  const add = async (key, data) => {
    const sortIdx = (await count(key)) + 1;

    getSuccess(getStore(key).add({
      ...data,
      sortIdx,
    }));
  };

  const removeList = async (id) => {
    await remove('list', id);

    for(let v of (await getAll('cardList')).filter(v => v.listId === id)) {
      await remove('cardList', v.id);
    }
  }

  return {
    add,
    get,
    getAll,
    update,
    remove,
    removeList,
  }
})();

const cardItem = ({ id, title, src, sortIdx }) => `
<li class="card" data-id=${id} data-sort-idx=${sortIdx}>
  ${src ? `<img src="${src}" alt="image">` : ''}
  <h3>${title}</h3>
</li>
`;

const listItem = ({ id, title }, cardList) => `
<li class="listItem">
  <div class="header">
    <h2 class="title" data-id=${id} data-tg="list">${title}</h2>
    <button class="removeList" data-id=${id}>X</button>
  </div>
  <ul class="cardList" data-id=${id}>
    ${cardList.map(cardItem).join('')}
  </ul>
  <button class="addCard" data-id=${id}>+ Add card</button>
</li>
`;

const popupContent = ({ title, description, img }) => `
<div class='content'>
  <header>
    <h2 class="title" data-tg="cardList">${title}</h2>
    <button class="closePopup">X</button>
  </header>
  <div>
    <p class="description">${description ?? '설명을 입력해주세요..'}</p>
    ${img ? `
      <img src="${img}" alt="image">
      <button class="editImage">Edit Image</button>
      <button class="removeImage">Remove Image</button>
    ` : `<button class="addImage">Add Image</button>`}
    <button class="removeCard">Remove card</button>
  </div>
</div>
`;

HTMLElement.prototype.addEvent = function (event, selector, eventListener) {
  this.addEventListener(event, (e) => e.target.closest(selector) && eventListener(e, e.target.closest(selector)), false);

  return this;
}

let selectedId = null;

// render
const render = async _ => {
  const list = await db.getAll('list');
  const cardList = (await db.getAll('cardList')).sort((a, b) => a.sortIdx - b.sortIdx);

  const card = cardList.reduce((obj, card) => {
    !obj[card.listId] && (obj[card.listId] = []);

    obj[card.listId].push(card);

    return obj;
  }, {});

  document.querySelector('.list').innerHTML = list.map(v => listItem(v, card[v.id] ?? [])).join('');
}

const renderPopup = async _ => {
  document.querySelector('dialog').innerHTML = popupContent(await db.get('cardList', selectedId));
}

let isDown = false;
let clone = null;
const targetInfo = {};
const currentPoint = {};
const placeholder = document.createElement('div');
placeholder.className = 'card placeholder';

const addPlaceholder = () => {
  Array.from(document.querySelectorAll('.cardList')).some(list => {
    const rect = list.getBoundingClientRect();

    if (rect.left < currentPoint.x && currentPoint.x < rect.left + list.clientWidth) {
      const isAddPlaceholder = Array.from(list.children).filter(v => !v.className.includes('placeholder')).some((item) => {
        const rect = item.getBoundingClientRect();

        if (currentPoint.y < rect.top + item.clientHeight / 2) {
          placeholder.remove();
          list.insertBefore(placeholder, item);

          return true;
        }
      });

      if (!isAddPlaceholder) {
        placeholder.remove();

        list.appendChild(placeholder);
      }

      return true;
    }
  });
}

let tg = null;
const handleDargStart = ({ pageX, pageY }, target) => {
  isDown = true;

  const rect = target.getBoundingClientRect();

  Object.assign(currentPoint, {
    x: pageX,
    y: pageY,
  });

  Object.assign(targetInfo, {
    gap: [pageX - rect.left, pageY - rect.top],
    width: target.clientWidth,
    height: target.clientHeight,
  });

  placeholder.style.height = targetInfo.height + 'px';

  clone = target.cloneNode(true);

  Object.assign(clone.style, {
    position: 'fixed',
    width: target.clientWidth + 'px',
    height: target.clientHeight + 'px',
    left: rect.left + 'px',
    top: rect.top + 'px',
    zIndex: 999,
  });

  tg = target;
}

window.onmousemove = ({ pageX, pageY }) => {
  if (!isDown) {
    return;
  }

  if (tg) {
    tg.parentElement.insertBefore(placeholder, tg);
    tg.remove();
    document.body.appendChild(clone);

    tg = null;
  }

  Object.assign(currentPoint, {
    x: pageX,
    y: pageY,
  });

  Object.assign(clone.style, {
    left: pageX - targetInfo.gap[0] + 'px',
    top: pageY - targetInfo.gap[1] + 'px',
  });

  addPlaceholder();
}

window.onmouseup = async () => {
  if (isDown) {
    isDown = false;

    if (tg) {
      return;
    }

    clone.remove();
    clone.removeAttribute('style');

    const pIdx = +(placeholder.previousElementSibling?.dataset.sortIdx ?? 0);
    const nIdx = +(placeholder.nextElementSibling?.dataset.sortIdx ?? 0);

    const idx = (() => {
      if (pIdx) {
        if (nIdx) {
          return (pIdx + nIdx) / 2;
        }

        return pIdx + 0.1;
      }

      if (nIdx) {
        return nIdx - 0.1;
      }

      return 1;
    })();

    console.log(pIdx, nIdx);

    await db.update('cardList', +clone.dataset.id, v => ({
      ...v,
      listId: +placeholder.parentElement.dataset.id,
      sortIdx: idx,
    }));

    clone = null;

    render();
  }
} 

// event
const handleAddListClick = async _ => {
  const title = window.prompt('제목을 입력하세요.');

  if (!title?.trim()) {
    return;
  }

  await db.add('list', {
    title,
  });

  render();
}

const handleAddCardClick = async (_, { dataset: { id } }) => {
  const title = window.prompt('제목을 입력하세요.');

  if (!title?.trim()) {
    return;
  }

  await db.add('cardList', {
    listId: +id,
    title,
    description: null,
    img: null,
  });

  render();
}

const handleRemoveListClick = async (_, { dataset: { id } }) => {
  await db.removeList(+id);

  render();
}

const showCardPopup = async (_, { dataset: { id } }) => {
  selectedId = +id;

  await renderPopup();

  document.querySelector('.cardPopup').showModal();
}

const closeCardPopup = _ => {
  document.querySelector('.cardPopup').close();
}

const handleRemoveCardClick = async _ => {
  await db.remove('cardList', selectedId);

  await render();
  closeCardPopup();
}

const focus = (tg) => {
  tg.contentEditable = true;
  tg.focus();

  return async (key, id, field) => {
    await db.update(key, id, v => ({ ...v, [field]: tg.innerText }));

    tg.contentEditable = false;
  }
}

const handleTitleClick = (_, target) => {
  const focusOut = focus(target);

  const callback = async () => {
    const { tg, id } = target.dataset;

    await focusOut(tg, +id, 'title');

    render();
  }

  target.onkeydown = ({ keyCode }) => {
    if (keyCode === 13) {
      callback();
      return false;
    }
  };
  target.onblur = callback;
}

const handleDescriptionClick = (_, target) => {
  const focusOut = focus(target);

  const callback = async () => {
    await focusOut('cardList', selectedId, 'description');

    render();
  }

  target.onkeydown = ({ keyCode }) => {
    if (keyCode === 13) {
      callback();
      return false;
    }
  };
  target.onblur = callback;
}

const updateImage = async _ => {
  const [fileHandle] = await window.showOpenFilePicker({
    types: [
      {
        accept: {
          'image/*': ['.png', '.gif', '.jpeg', '.jpg']
        }
      },
    ],
    excludeAcceptAllOption: true,
    multiple: false
  });

  if (!fileHandle) return;

  const fileData = await fileHandle.getFile();

  const reader = new FileReader();
  reader.onload = async _ => {
    await db.update('cardList', selectedId, v => ({ ...v, img: reader.result }));

    renderPopup();
  }
  reader.readAsDataURL(fileData);
}

const handleRemoveImageClick = async _ => {
  await db.update('cardList', selectedId, v => ({ ...v, img: null }));

  renderPopup();
}

const eve = _ => { // 이벤트 리스너 추가
  document.body
    .addEvent('click', '.addCard', handleAddCardClick)
    .addEvent('click', '.addList', handleAddListClick)
    .addEvent('click', '.removeList', handleRemoveListClick)
    .addEvent('click', '.card', showCardPopup)
    .addEvent('click', '.closePopup', closeCardPopup)
    .addEvent('click', '.removeCard', handleRemoveCardClick)
    .addEvent('click', '.title', handleTitleClick)
    .addEvent('click', '.description', handleDescriptionClick)
    .addEvent('click', '.addImage', updateImage)
    .addEvent('click', '.editImage', updateImage)
    .addEvent('click', '.removeImage', handleRemoveImageClick)
    .addEvent('mousedown', '.card', handleDargStart)

  document.querySelector('.cardPopup').onclick = ({ target }) => target.className === 'cardPopup' && target.close();
}

const init = _ => { // initialize
  render();
  eve();
}