import React, { useContext } from 'react'
import ChatContainer from '../components/ChatContainer'
import { ThemeContext } from '../App'

const ChatPage = () => {
  const { theme } = useContext(ThemeContext);
  
  return (
    <div className={`fixed inset-0 w-screen h-screen ${theme === 'dark' ? 'bg-custom-gradient' : 'bg-white'}`}>
      <ChatContainer />
    </div>
  )
}   

export default ChatPage