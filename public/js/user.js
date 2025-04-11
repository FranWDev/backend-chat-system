const currentUserId = document.getElementById("chat-container").dataset.userId;
let receiverId = null;
let receiverUsername = '';
const socket = io(); 

function openChat(id, username) {
  receiverId = id;
  receiverUsername = username;
  document.getElementById('receiver-name').textContent = receiverUsername;
  loadMessages();
}

function loadMessages() {
  if (!receiverId) return;
  socket.emit("messageHistory");
  socket.emit("getMessages", {
    senderId: currentUserId,
    receiverId: receiverId
  });
}

socket.on("messageHistory", (messages) => {
  const messagesContainer = document.getElementById("messages");
  messagesContainer.innerHTML = "";

  messages.forEach((message) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");

    if (message.sender_id == currentUserId) {
      messageElement.classList.add("sent");
    } else {
      messageElement.classList.add("received");
    }

    messageElement.textContent = message.content;
    messagesContainer.appendChild(messageElement);
  });

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

function sendMessage() {
  const message = document.getElementById('message-input').value;
  if (!message || !receiverId) return alert('Selecciona un usuario para chatear');

  const messageData = {
    senderId: currentUserId,
    receiverId: receiverId,
    content: message
  };

  socket.emit('sendMessage', messageData);
  document.getElementById('message-input').value = '';
}

socket.on('receiveMessage', (message) => {
  if ((+message.receiver_id === +currentUserId && +message.sender_id === +receiverId) || 
      (+message.sender_id === +currentUserId && +message.receiver_id === +receiverId)) {
    
    const messagesContainer = document.getElementById("messages");
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    
    if (message.sender_id == currentUserId) {
      messageElement.classList.add("sent");
    } else {
      messageElement.classList.add("received");
    }
    
    messageElement.textContent = message.content;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
});

document.getElementById('message-input').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendMessage();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const sendButton = document.getElementById("send");
  sendButton.addEventListener("click", sendMessage);

  const chats = document.querySelectorAll(".chat");
  chats.forEach(chat => {
    chat.addEventListener("click", function () {
        const userId = chat.dataset.userId;
        const username = chat.dataset.username;
        openChat(userId, username);
      });
  });
});