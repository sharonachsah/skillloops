// frontend/src/pages/Practice.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

export default function Practice(){
  const { challengeId } = useParams(); // route expects /practice/:challengeId
  const [challenge, setChallenge] = useState(null);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(20); // 20s timer
  const timerRef = useRef();

  useEffect(()=>{
    async function load(){
      try{
        const res = await API.get(`/challenges/${challengeId}`);
        setChallenge(res.data);
      }catch(e){
        // fallback: maybe challenge data comes from course lesson
        setChallenge({
          title: "Sample MCQ",
          question: "Which is a JS primitive?",
          options: ["Array","Object","String","Function"],
          answerIndex: 2
        });
      }
    }
    load();
  },[challengeId]);

  useEffect(()=>{
    if(!challenge) return;
    timerRef.current = setInterval(()=>{
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return ()=> clearInterval(timerRef.current);
  }, [challenge]);

  function submit(){
    const correct = selected === challenge.answerIndex;
    API.post("/practice/submit", { challengeId, selected, timeLeft }).catch(()=>{});
    alert(correct ? "Correct!" : "Wrong");
  }

  if(!challenge) return <div>Loading challenge...</div>;
  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-lg font-semibold mb-2">{challenge.title}</h2>
      <p className="mb-3">{challenge.question}</p>
      <div className="space-y-2">
        {challenge.options.map((opt, i)=>(
          <button
            key={i}
            className={`w-full text-left p-3 border rounded ${selected===i ? 'bg-primary text-white' : ''}`}
            onClick={()=>setSelected(i)}
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="flex justify-between items-center mt-4">
        <div>Time left: <span className="font-bold">{timeLeft}s</span></div>
        <button disabled={timeLeft===0} onClick={submit} className="bg-primary text-white px-4 py-2 rounded disabled:opacity-50">Submit</button>
      </div>
    </div>
  );
}
