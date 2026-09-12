import { useState } from "react";

type Message = {
  sender: "bot" | "user";
  text: string;
};

const quickQuestions = [
  "What can the system detect?",
  "What does BAD mean?",
  "How can I report an issue?",
  "What is the road score?",
];

function getBotReply(question: string): string {
  const q = question.toLowerCase();

  if (
    q.includes("detect") ||
    q.includes("object") ||
    q.includes("detection")
  ) {
    return "The AI model can detect LMV, HMV, Pedestrian, RoadDamages, SpeedBump and UnsurfacedRoad.";
  }

  if (q.includes("bad") || q.includes("condition")) {
    return "BAD means the model detected a road-condition issue such as RoadDamages or UnsurfacedRoad. The result should be treated as a decision-support result.";
  }

  if (
    q.includes("report") ||
    q.includes("complaint")
  ) {
    return "When a road issue is detected, use the Report / Raise Complaint option. Enter the location and description and submit the report.";
  }

  if (
    q.includes("score") ||
    q.includes("100")
  ) {
    return "The Road Condition Score is a prototype score calculated from detected road-condition classes. It is not an official engineering assessment.";
  }

  if (
    q.includes("speed bump") ||
    q.includes("speedbump")
  ) {
    return "SpeedBump means the AI model identified a speed bump in the image. Drivers should remain alert and maintain an appropriate speed.";
  }

  if (
    q.includes("unsurfaced")
  ) {
    return "UnsurfacedRoad indicates that the model detected an unsurfaced road area that may require maintenance.";
  }

  if (
    q.includes("damage") ||
    q.includes("roaddamages")
  ) {
    return "RoadDamages means the AI model detected a road-damage area. You can use the complaint feature to record the issue.";
  }

  if (
    q.includes("hello") ||
    q.includes("hi") ||
    q.includes("hey")
  ) {
    return "Hello! 👋 I'm the Road Safety Assistant. Ask me about road detection, road conditions, scores or reporting an issue.";
  }

  if (
    q.includes("safe") ||
    q.includes("safety")
  ) {
    return "For safety, use the AI result as a support tool, follow road signs, drive carefully and report serious road problems for inspection.";
  }

  return "I can help with road detection, road condition, condition score, speed bumps, road damage, unsurfaced roads and complaints.";
}

export default function RoadSafetyChatbot() {
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hello! 👋 I'm the Road Safety Assistant. How can I help you?",
    },
  ]);

  const [input, setInput] = useState("");

  const sendMessage = (messageText?: string) => {
    const text = (messageText ?? input).trim();

    if (!text) return;

    setMessages((previous) => [
      ...previous,
      {
        sender: "user",
        text,
      },
      {
        sender: "bot",
        text: getBotReply(text),
      },
    ]);

    setInput("");
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat button */}

      <button
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Open Road Safety Assistant"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500 text-2xl shadow-2xl transition hover:scale-105 hover:bg-cyan-400"
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {/* Chat window */}

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[520px] w-[360px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">

          {/* Header */}

          <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-xl">
                🚗
              </div>

              <div>
                <h3 className="font-semibold">
                  Road Safety Assistant
                </h3>

                <p className="text-xs text-gray-400">
                  Road Monitoring Support
                </p>
              </div>

            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
              aria-label="Close chatbot"
            >
              ✕
            </button>

          </div>

          {/* Messages */}

          <div className="flex-1 space-y-3 overflow-y-auto p-4">

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.sender === "user"
                      ? "bg-cyan-500 text-black"
                      : "bg-white/10 text-gray-200"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

          </div>

          {/* Quick questions */}

          <div className="border-t border-white/10 px-3 py-3">

            <p className="mb-2 text-xs text-gray-500">
              Quick questions
            </p>

            <div className="flex gap-2 overflow-x-auto pb-1">

              {quickQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => sendMessage(question)}
                  className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 transition hover:bg-white/10"
                >
                  {question}
                </button>
              ))}

            </div>

          </div>

          {/* Input */}

          <div className="border-t border-white/10 p-3">

            <div className="flex items-center gap-2">

              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about road safety..."
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-400"
              />

              <button
                onClick={() => sendMessage()}
                className="rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-black transition hover:bg-cyan-400"
              >
                ➤
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}