import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiArrowLeft } from 'react-icons/fi';

const ChatInterface = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'Alice', avatar: 'A', color: '#FF6B6B', lastMessage: 'Hey there!', time: '10:30 AM' },
    { id: 2, name: 'Bob', avatar: 'B', color: '#4ECDC4', lastMessage: 'How are you?', time: '9:45 AM' },
    { id: 3, name: 'Charlie', avatar: 'C', color: '#45B7D1', lastMessage: 'See you later', time: '8:20 AM' },
  ]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const chatRef = useRef(null);

  // Removed socket listeners - using local state only
  useEffect(() => {
    // No socket operations needed
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, selectedUser]);

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;
    const message = {
      id: Date.now(),
      user: 'You',
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      color: '#3B82F6',
    };
    const chatKey = ['You', selectedUser.name].sort().join('-');
    setMessages(prev => ({
      ...prev,
      [chatKey]: [...(prev[chatKey] || []), message]
    }));
    // Simulate sending message (no socket needed)
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const chatKey = selectedUser ? ['You', selectedUser.name].sort().join('-') : null;
  const currentMessages = chatKey ? messages[chatKey] || [] : [];

  return (
    <div className="flex flex-col h-full">
      {!selectedUser ? (
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-[var(--color-bg-tertiary)]">
            <h3 className="text-lg font-semibold">Chats</h3>
          </div>
          <ul className="space-y-2 p-4">
            {users.map(user => (
              <li
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="flex items-center space-x-3 p-3 hover:bg-[var(--color-bg-tertiary)] rounded-lg cursor-pointer transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: user.color }}
                >
                  {user.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-sm text-gray-400 truncate">{user.lastMessage}</p>
                </div>
                <span className="text-xs text-gray-500">{user.time}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-[var(--color-bg-tertiary)] flex items-center space-x-3">
            <button
              onClick={() => setSelectedUser(null)}
              className="p-1 hover:bg-[var(--color-bg-tertiary)] rounded"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: selectedUser.color }}
            >
              {selectedUser.avatar}
            </div>
            <h3 className="font-semibold">{selectedUser.name}</h3>
          </div>
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-4 space-y-2"
          >
            {currentMessages.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-400">No messages yet. Start chatting!</p>
              </div>
            ) : (
              currentMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.user === 'You' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-3 py-2 rounded-lg ${msg.user === 'You' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                    <p className="break-words">{msg.text}</p>
                    <span className="text-xs opacity-75">{msg.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-[var(--color-bg-tertiary)]">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-[var(--color-bg-tertiary)] border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
              />
              <button
                onClick={sendMessage}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center text-sm transition-colors"
              >
                <FiSend className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;