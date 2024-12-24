import { useState } from "react";
import styles from "../styles/Home.module.css";
import axios from "axios";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_CHATBOT_API_URL,
        {
          user_id: "default_user",
          question: input,
        }
      );
      const botMessage = { sender: "bot", text: response.data.answer };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error: Unable to connect to the server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Llama Chat</h1>

      <div className={styles.chatBox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={
              msg.sender === "user" ? styles.userMessage : styles.botMessage
            }
          >
            {msg.text}
          </div>
        ))}
        {loading && <div className={styles.loading}>Bot is typing...</div>}
      </div>
      <div className={styles.inputBox}>
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
