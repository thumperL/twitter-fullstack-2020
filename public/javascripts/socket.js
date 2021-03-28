const socket = io();
const messages = document.querySelector('#chat-messages');
const chatForm = document.querySelector('#chat-form');
const chatInput = document.querySelector('#chat-input');
const chatPMInput = document.querySelector('#chat-pm-input');
const publicChatUserList = document.querySelector('#public-chat-user-list');
const privateChatUserList = document.querySelector('#private-message-list');
const privateMessageCount = document.querySelector('#message-notify-count');
const subcribeNotification = document.querySelector('#bell-notify-id');

//產生聊天室html
const generateChatRoomElement = {
  //上線氣泡
  userOnlineMessage: (userObj) => {
   return `<li class="user-status-message text-center"> 
      <span class="w-auto py-1 px-2 badge-pill">${userObj.user.name} 上線</span> 
     </li>`
  },
  
  //下線氣泡
  userOfflineMessage: (userObj) => {
   return `<li class="user-status-message text-center"> 
      <span class="w-auto py-1 px-2 badge-pill">${userObj.user.name} 離線</span> 
    </li>`
  },
  
  //對話氣泡
  message: (message) => {
  const sender = (message.Sender !== undefined) ? message.Sender : message.sender;
  let messageHTML = '';
    if (sender.id === myUserId) {
      messageHTML = `
      <li class="message-item-self d-flex justify-content-end">
        <div class="">
          <div class="chat-bubble-self item-desc px-3 py-2">${message.message}</div>
          <div class="chat-createdAt text-lightgrey"><p class="text-end">${message.createdAt}</p></div>
        </div>
      </li>`;
      return messageHTML;
    };
    messageHTML = `
      <li class="message-item-other">
        <div class="d-flex align-items-end">
          <img class="chat-user-avatar rounded-circle mr-2" src="${sender.avatar}" alt="">
          <div class="chat-bubble-other item-desc px-3 py-2">${message.message}</div>
        </div>
        <div class="chat-createdAt ml-5 text-lightgrey">${message.createdAt}</div>
      </li>`;
    return messageHTML;
  },
  //公開聊天室上線使用者列表
  userList: (users) => {
    let usersHtml = '';
    users.forEach((user) => {
      usersHtml += `
      <div class="d-flex flex-row no-wrap w-100 p-3 pointer tweet-gray">
        <a class="profile-img mr-3 d-flex flex-row no-wrap w-100 text-dark text-decoration-none" href="/chat/private/${user.id}"> 
          <img class="img-fluid rounded-circle mr-2" src="${user.avatar}" alt=""> 
          <div class="item-header d-flex d-column no-wrap justify-content-start align-items-center">
            <div class="name w-100 pr-2">
              ${user.name}
            </div>
            <div class="item-username">
                <span class="username text-lightgrey">@${user.account}</span>
            </div>
          </div>
        </a>
      </div>`;
    });
    return usersHtml;
  },
  //公開聊天室上線人數
  updateUserCount: (users) => {
    if (document.querySelector('#chatroom-user-count') !== null) {
      document.querySelector('#chatroom-user-count').innerHTML = users.length;
    };
  },
};

//渲染畫面
const displayChatRoomElement = {
  //顯示訊息畫面
  chatRoomWindow : (userObj) => {
  //新使用者上線通知
  const userOnlineMessage = generateChatRoomElement.userOnlineMessage(userObj);
 // 更新訊息列表
  if (document.querySelectorAll('#chat-messages .message-item-self').length > 0) {
    if (String(userObj.roomType) !== 'private') {
      // 給已經在公開聊天室中的使用者，當有新使用者進入聊天室 => 顯示新使用者上線通知
      return messages.innerHTML += `${generateChatRoomElement.userOnlineMessage(userObj)}`;
    } 
  } // 給剛進入聊天室的使用者 => 顯示歷史訊息 + 新使用者上線通知
    else if (userObj.previousMessages !== undefined) {
    let previousMessagesHtml = '';
    userObj.previousMessages.forEach((message) => {
      previousMessagesHtml += generateChatRoomElement.message(message);
    })
      if (String(userObj.roomType) !== 'private') {
        return messages.innerHTML = `${previousMessagesHtml}${userOnlineMessage}`;
      } else {
        // 使用者進入私人聊天室 => 只顯示歷史訊息
        return messages.innerHTML = `${previousMessagesHtml}`;
      }
    }
  },
  //公開聊天室使用者列表
  userList: (userObj) => {
    if (publicChatUserList !== null) {
      publicChatUserList.innerHTML = '';
      generateChatRoomElement.updateUserCount(userObj.usersInRoom);
      return publicChatUserList.innerHTML += generateChatRoomElement.userList(userObj.usersInRoom);
    }
  },
};


let myUserId;
// Temporary only, demonstrate the login connection workability
socket.on('connect', () => {
  socket.emit('getAndNotifyAllUnread');
  socket.emit('checkUnreadNotification');
});

// 使用者本人登入 前端收到本人id。在後續動作可利用 id 判斷是否為本人
socket.on('me', (id) => {
  myUserId = id;
});

// 使用者已上線, 會同時推送上線的使用者，以及這個使用者加入的房間裡的用戶 array
socket.on('userJoined', (userObj) => {
  //聊天室訊息
  displayChatRoomElement.chatRoomWindow(userObj);
  //公開聊天室使用者列表
  displayChatRoomElement.userList(userObj)

  window.scrollTo(0, document.body.scrollHeight);
  messages.scrollIntoView(false);
});

// 如果是公開聊天室，會向後端要求 'join' 'public'這個房間
if (window.location.pathname === '/chat/public') {
  socket.emit('join', 'public');
} else if (window.location.pathname.includes('/chat/private')) {
  socket.emit('join', 'private');
}

//儲存聊天訊息(將新的訊息傳送至後端)
if (chatForm !== null) {
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (chatInput) {
      // 公開聊天室發送的訊息
      socket.emit('sendMessage', {
        identifier: 'public',
        message   : chatInput.value,
      });
      chatInput.value = '';
    }
    if (chatPMInput) {
      // 私人聊天室發送的訊息
      socket.emit('sendMessage', {
        identifier: 'private',
        receiverId: chatPMInput.dataset.receiverId,
        message   : chatPMInput.value,
      });
      chatPMInput.value = '';
    }
  });
}

// 即時傳送使用者的聊天訊息
socket.on('newMessage', (message) => {
  console.log('message', message);
  messages.innerHTML += generateChatRoomElement.message(message);
  messages.scrollIntoView(false);
});

// 使用者離線，更新在線者人數及顯示離線訊息
socket.on('userLeft', (data) => {
  if (String(data.roomType) !== 'private') {
    // 更新在線者人數和在線使用者列表
    displayChatRoomElement.userList(data)
    // 顯示誰離開的離線訊息
    messages.innerHTML += (`${generateChatRoomElement.userOfflineMessage(data)}`);
  }
  messages.scrollIntoView(false);
});

// 顯示未讀訊息
socket.on('unreadMessageNotification', (count) => {
  privateMessageCount.innerText = count.messages.length;
});

// 顯示未讀通知
socket.on('currentUnreadNotification', (count) => {
  if (Number(count) === 0) {
    subcribeNotification.innerText = '';
  } else {
    subcribeNotification.innerText = count;
  }
});
