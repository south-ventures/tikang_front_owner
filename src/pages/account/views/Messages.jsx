import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';

const Messages = () => {
  const { user, fetchUser } = useAuth();
  const [groupedMessages, setGroupedMessages] = useState({});
  const [activeUserId, setActiveUserId] = useState(null);
  const messagesEndRef = useRef(null);

  const [title, setTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_MESSAGE}/conversations/${user.user_id}`);
      const data = await res.json();

      const grouped = data.reduce((acc, msg) => {
        const isSender = msg.sender_id === user.user_id;
        const otherUserId = isSender ? msg.recipient_id : msg.sender_id;
        const otherUserName = isSender ? msg.recipient_name : msg.sender_name;
        const otherUserType = isSender ? msg.recipient_type : msg.sender_type;

        if (!acc[otherUserId]) {
          acc[otherUserId] = {
            name: otherUserName,
            role: otherUserType,
            messages: [],
            property_title: msg.property_title || '',
            property_id: msg.property_id || null,
          };
        }

        acc[otherUserId].messages.push(msg);
        return acc;
      }, {});

      setGroupedMessages(grouped);

      if (!activeUserId) {
        const firstUserId = Object.keys(grouped)[0];
        if (firstUserId) setActiveUserId(firstUserId);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }, [user, activeUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeUserId, groupedMessages]);

  const handleSend = async () => {
    if (!title || !newMessage || !activeUserId) return;

    let currentUser = user;
    if (!currentUser) currentUser = await fetchUser();

    const sender_id = currentUser?.user_id;
    const recipient_id = activeUserId;
    const property_id = groupedMessages[recipient_id]?.property_id;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_MESSAGES}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_id, recipient_id, title, message: newMessage, property_id }),
      });

      if (!res.ok) throw new Error('Failed to send');

      setTitle('');
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleTabClick = (userId) => {
    setActiveUserId(userId);
    if (isMobile) setMobileChatOpen(true);
  };

  const handleBack = () => setMobileChatOpen(false);

  return (
    <div className="max-w-6xl mx-auto h-screen pt-4 sm:pt-6 px-2 sm:px-0">
      <div className="h-full flex flex-col sm:flex-row border border-gray-200 rounded-xl shadow-lg overflow-hidden bg-white">

        {/* Sidebar */}
        <div className={`sm:w-1/3 w-full bg-gray-50 border-r overflow-y-auto ${isMobile && mobileChatOpen ? 'hidden' : 'block'}`}>
          <h2 className="text-lg font-bold text-gray-800 p-4 border-b">Conversations</h2>
          {Object.entries(groupedMessages).map(([userId, convo]) => (
            <button
              key={userId}
              onClick={() => handleTabClick(userId)}
              className={`w-full text-left px-5 py-4 transition duration-200 border-b ${
                userId === activeUserId ? 'bg-white text-blue-600 font-semibold' : 'hover:bg-blue-50 text-gray-700'
              }`}
            >
              <div className="text-md">{convo.name}</div>
              <div className="text-sm text-gray-500">
                {convo.role} {convo.property_title ? `• ${convo.property_title}` : ''}
              </div>
            </button>
          ))}
        </div>

        {/* Chat Pane */}
        <div className={`sm:w-2/3 w-full flex flex-col ${isMobile && !mobileChatOpen ? 'hidden' : 'flex'}`}>
          <div className="flex items-center justify-between px-4 py-3 border-b bg-white text-lg font-semibold text-gray-800 shadow-sm">
            {isMobile && (
              <button onClick={handleBack} className="text-blue-500 hover:underline text-sm font-normal">
                ← Back
              </button>
            )}
            <span>{groupedMessages[activeUserId]?.name || 'Select a conversation'}</span>
            <div className="w-6" />
          </div>

          {/* Messages */}
          <div
            className="overflow-y-auto px-4 py-4 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100"
            style={{ height: 'calc(100vh - 60px - 185px)' }}
          >
            {groupedMessages[activeUserId]?.messages
              ?.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
              .map((msg) => {
                const isSender = msg.sender_id === user.user_id;
                return (
                  <div
                    key={msg.message_id}
                    className={`flex flex-col max-w-[75%] px-4 py-3 rounded-xl shadow ${
                      isSender ? 'ml-auto bg-blue-100 text-right' : 'mr-auto bg-gray-200 text-left'
                    }`}
                  >
                    <span className="font-semibold text-sm text-gray-700 mb-1">{msg.title}</span>
                    <span className="text-sm">{msg.message}</span>
                    <span className="text-[11px] text-gray-500 mt-1">
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {activeUserId && (
            <div
              className="bg-white px-4 py-3 shadow-inner w-full"
              style={{
                position: isMobile ? 'fixed' : 'relative',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 10,
              }}
            >
              <div className="flex flex-col gap-2 max-w-3xl mx-auto">
                <input
                  type="text"
                  className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Message title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                  className="border border-gray-300 rounded-md px-4 py-2 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  onClick={handleSend}
                  className="self-end bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition duration-200"
                >
                  Send Message
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
