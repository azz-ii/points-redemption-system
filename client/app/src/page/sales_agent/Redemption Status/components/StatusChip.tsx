import type { StatusItem } from "../modals/types";

interface StatusChipProps {
  status: StatusItem["status"];
  isDark: boolean;
}

export function StatusChip({ status, isDark }: StatusChipProps) {
  const base = "px-3 py-1 rounded-full text-xs font-semibold inline-block";
  
  if (status === "Approved") {
    return (
      <span
        className={`${base} ${
          isDark ? "bg-green-500 text-black" : "bg-green-100 text-green-700"
        }`}
      >
        {status}
      </span>
    );
  }
  
  if (status === "Pending") {
    return (
      <span
        className={`${base} ${
          isDark ? "bg-yellow-400 text-black" : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {status}
      </span>
    );
  }
  
  return (
    <span
      className={`${base} ${
        isDark ? "bg-red-500 text-white" : "bg-red-100 text-red-700"
      }`}
    >
      {status}
    </span>
  );
}
