import { useState } from "react";
import { Phone, Delete } from "lucide-react";
import { formatPhone } from "@/lib/phoneUtils";

const KEYS = [
  ["1", ""], ["2", "ABC"], ["3", "DEF"],
  ["4", "GHI"], ["5", "JKL"], ["6", "MNO"],
  ["7", "PQRS"], ["8", "TUV"], ["9", "WXYZ"],
  ["*", ""], ["0", "+"], ["#", ""],
];

export default function DialPad({ onCall }) {
  const [value, setValue] = useState("");

  const press = (k) => setValue((v) => v + k);
  const backspace = () => setValue((v) => v.slice(0, -1));

  return (
    <div className="flex h-full flex-col px-6 pb-4">
      <div className="flex flex-1 items-end justify-center pb-3">
        <p className="text-4xl font-light tracking-wide text-zinc-900 sm:text-5xl">
          {value ? formatPhone(value) : <span className="text-zinc-300">Enter number</span>}
        </p>
      </div>

      <div className="mx-auto grid w-full max-w-xs grid-cols-3 gap-2.5">
        {KEYS.map(([num, letters]) => (
          <button
            key={num}
            onClick={() => press(num)}
            className="flex h-16 flex-col items-center justify-center rounded-full bg-zinc-100 text-zinc-900 transition hover:bg-zinc-200 active:scale-95 sm:h-[4.5rem]"
          >
            <span className="text-2xl font-light">{num}</span>
            {letters && <span className="text-[10px] font-medium tracking-widest text-zinc-400">{letters}</span>}
          </button>
        ))}
      </div>

      <div className="mx-auto mt-3 flex w-full max-w-xs items-center justify-center gap-6">
        <div className="w-16" />
        <button
          onClick={() => value && onCall(value)}
          disabled={!value}
          aria-label="Call number"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition hover:bg-green-400 active:scale-95 disabled:opacity-40"
        >
          <Phone className="h-6 w-6" />
        </button>
        <button
          onClick={backspace}
          disabled={!value}
          aria-label="Delete digit"
          className="flex w-16 items-center justify-center text-zinc-400 transition hover:text-zinc-600 disabled:opacity-0"
        >
          <Delete className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}