import { useState } from "react";
import { OpenAI } from "openai";
import pdfToText from "react-pdftotext";
import Lottie from "react-lottie";
import animationData from "./assets/loading.json";

import "./App.css";

function App() {
  const [loading, setLoading] = useState(false);
  const [pdfText, setPdfText] = useState<string>("");
  const [pdfName, setPdfName] = useState<string | undefined>("");
  const [chatResponse, setChatResponse] = useState<
    string | null | JSX.Element[]
  >("");

  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  async function getAnswer() {
    setLoading(true);
    console.log(pdfText);
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "user",
            content:
              "Faça uma análise completa de todas as cláusulas do contrato que tenha desvantagens para o contratante, com seu conteúdo e seus números de identificação e explique o porque da desvantagem. Por favor, inclua o número da página em que cada cláusula se encontra. Faça o mesmo separadamente, de forma completa, para todas cláusulas que tenham desvantagens para o contratado. Em cada mudança de parágrafo coloque # para facilitar a leitura.",
          },
          { role: "user", content: pdfText },
        ],
        model: "gpt-3.5-turbo",
        max_tokens: 1000,
      });
      const chatResponseOpenAi = completion.choices[0].message.content;
      if (chatResponseOpenAi) {
        console.log(chatResponseOpenAi);
        const parts = chatResponseOpenAi.split("#");

        const formattedText = parts.map((part, index) => (
          <span key={index}>{part}</span>
        ));
        setChatResponse(formattedText);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  function extractText(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPdfName(file?.name);
    console.log(file);
    if (file) {
      pdfToText(file)
        .then((text: string) => setPdfText(text))
        .catch(() => console.error("Failed to extract text from pdf"));
    }
  }

  return (
    <div className="main">
      <h1>Analisador de Contratos IA</h1>
      <div className="containerContent">
        <div className="containerActions">
          <label className="custom-file-upload">
            {pdfText && pdfText !== "" ? pdfName : "Fazer Upload do Contrato"}
            <input
              type="file"
              accept="application/pdf"
              onChange={extractText}
            />
          </label>
          <button onClick={getAnswer}>Analisar</button>
        </div>

        <div className="responseContainer">
          {loading ? (
            <Lottie options={defaultOptions} height={400} width={400} />
          ) : (
            chatResponse
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
