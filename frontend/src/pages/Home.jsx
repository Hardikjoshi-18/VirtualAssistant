import React, { useRef, useState, useEffect, useContext } from "react";
import { userDataContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import aiImg from "../assets/ai.gif";
import userImg from "../assets/user.gif";
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";

const Home = () => {
  const navigate = useNavigate();
  const { userData, serverUrl, setUserData, getGeminiResponse } =
    useContext(userDataContext);

  // 🔹 States
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [ham, setHam] = useState(false);

  // 🔹 Refs
  const synth = window.speechSynthesis;
  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const isRecognizingRef = useRef(false);

  // 🔹 Log Out
  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      setUserData(null);
      navigate("/signin");
    } catch (err) {
      setUserData(null);
      console.error(err);
    }
  };

  // 🔹 Speak Function
  const speak = (text) => {
    if (!text) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "hi-IN";

    const voices = synth.getVoices();
    const hindiVoice = voices.find((v) => v.lang === "hi-IN");
    if (hindiVoice) utter.voice = hindiVoice;

    isSpeakingRef.current = true;

    utter.onend = () => {
      setAiText("");
      isSpeakingRef.current = false;
      setTimeout(() => {
        safeRecognition();
      }, 800);
    };

    synth.cancel();
    synth.speak(utter);
  };

  // 🔹 Handle Commands
  const handleCommand = (data) => {
    const { type, userInput, response } = data;
    speak(response);

    switch (type) {
      case "google_search":
        window.open(
          `https://www.google.com/search?q=${encodeURIComponent(userInput)}`,
          "_blank"
        );
        break;
      case "calculator_open":
        window.open("https://www.google.com/search?q=calculator", "_blank");
        break;
      case "instagram_open":
        window.open("https://www.instagram.com/", "_blank");
        break;
      case "facebook_open":
        window.open("https://www.facebook.com/", "_blank");
        break;
      case "weather_show":
        window.open("https://www.google.com/search?q=weather", "_blank");
        break;
      case "youtube_search":
      case "youtube_play":
        window.open(
          `https://www.youtube.com/results?search_query=${encodeURIComponent(
            userInput
          )}`,
          "_blank"
        );
        break;
      default:
        break;
    }
  };

  // 🔹 Safe recognition wrapper
  const safeRecognition = () => {
    if (!isSpeakingRef.current && !isRecognizingRef.current) {
      try {
        recognitionRef.current?.start();
      } catch (err) {
        if (err.name !== "InvalidStateError") console.error(err);
      }
    }
  };

  // 🔹 Unlock Voices
  // const unlockVoices = () => {
  //   const voices = synth.getVoices();
  //   if (voices.length === 0) {
  //     synth.onvoiceschanged = () => {
  //       const dummy = new SpeechSynthesisUtterance(" ");
  //       dummy.volume = 0;
  //       synth.speak(dummy);
  //     };
  //   } else {
  //     const dummy = new SpeechSynthesisUtterance(" ");
  //     dummy.volume = 0;
  //     synth.speak(dummy);
  //   }
  // };

  // 🔹 Setup useEffect
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    let isMounted = true;

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);
      if (isMounted && !isSpeakingRef.current) {
        setTimeout(safeRecognition, 1000);
      }
    };

    recognition.onerror = (event) => {
      console.error("Recognition error:", event.error);
      isRecognizingRef.current = false;
      setListening(false);
      if (event.error !== "aborted" && !isSpeakingRef.current) {
        setTimeout(safeRecognition, 1000);
      }
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      if (
        transcript
          .toLowerCase()
          .includes(userData.assistantName.toLowerCase())
      ) {
        recognition.stop();
        setUserText(transcript);
        isRecognizingRef.current = false;
        setListening(false);

        const data = await getGeminiResponse(transcript);
        if (isMounted) {
          handleCommand(data);
          setAiText(data.response);
          setUserText("");
        }
      }
    };

    const fallback = setInterval(() => {
      if (!isSpeakingRef.current && !isRecognizingRef.current) {
        safeRecognition();
      }
    }, 10000);

    // setTimeout(500);

    const greeting = new SpeechSynthesisUtterance(`hello ${userData.name}, who can I help you with?`)
    greeting.lang = 'hi-IN';

    window.speechSynthesis.speak(greeting)
    safeRecognition();

    return () => {
      isMounted = false;
      recognition.stop();
      clearInterval(fallback);
      isRecognizingRef.current = false;
      isSpeakingRef.current = false;
    };
  }, []);

  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-black to-[#02023d] flex flex-col items-center justify-center gap-4 relative overflow-hidden">
      {/* 🔹 Mobile Sidebar */}
      <CgMenuRight
        className="lg:hidden text-white absolute top-5 right-5 w-6 h-6 cursor-pointer"
        onClick={() => setHam(true)}
      />
      <div
        className={`absolute lg:hidden top-0 right-0 w-full h-full bg-black/50 backdrop-blur-lg p-5 flex flex-col gap-5 transition-transform duration-300 ${
          ham ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <RxCross1
          className="text-white absolute top-5 right-5 w-6 h-6 cursor-pointer"
          onClick={() => setHam(false)}
        />

        <button
          onClick={handleLogOut}
          className="w-[150px] h-[50px] text-black font-semibold text-lg bg-white rounded-full"
        >
          Log Out
        </button>

        <button
          onClick={() => navigate("/customize")}
          className="w-[220px] h-[50px] text-black font-semibold text-lg bg-white rounded-full"
        >
          Customize Assistant
        </button>

        <div className="w-full h-[1px] bg-gray-400" />

        <h1 className="text-white font-semibold text-lg">History</h1>

        <div className="w-full h-[400px] overflow-y-auto flex flex-col gap-3">
          {userData?.history?.length ? (
            userData.history.map((his, i) => (
              <span
                key={i}
                className="w-full text-gray-400 text-[16px]"
              >
                {his}
              </span>
            ))
          ) : (
            <span className="text-gray-400">No history yet</span>
          )}
        </div>
      </div>

      {/* 🔹 Desktop Top Buttons */}
      <button
        onClick={handleLogOut}
        className="hidden lg:block min-w-[150px] h-[50px] text-black font-semibold text-lg bg-white rounded-full absolute top-5 right-5"
      >
        Log Out
      </button>

      <button
        onClick={() => navigate("/customize")}
        className="hidden lg:block min-w-[220px] h-[50px] text-black font-semibold text-lg bg-white rounded-full absolute top-[80px] right-5"
      >
        Customize Assistant
      </button>

      {/* 🔹 Assistant Avatar */}
      <div className="w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-2xl shadow-lg">
        <img
          src={userData?.assistantImage}
          alt="assistant"
          className="h-full object-cover"
        />
      </div>

      <h1 className="text-white text-lg font-semibold">
        I’m {userData?.assistantName}
      </h1>

      {/* 🔹 Talking Animation */}
      {!aiText ? (
        <img src={userImg} alt="user" className="w-[200px]" />
      ) : (
        <img src={aiImg} alt="ai" className="w-[200px]" />
      )}

      {/* 🔹 Transcript */}
      <h1 className="text-white text-lg font-bold text-center max-w-[80%]">
        {userText || aiText || ""}
      </h1>
    </div>
  );
};

export default Home;
