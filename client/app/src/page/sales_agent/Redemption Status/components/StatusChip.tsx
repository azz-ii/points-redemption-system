interface StatusChipProps {
  status: "PENDING" | "APPROVED" | "REJECTED" | "Pending" | "Approved" | "Rejected";
  isDark: boolean;
}

export function StatusChip({ status, isDark }: StatusChipProps) {
  const base = "px-3 py-1 rounded-full text-xs font-semibold inline-block";
  
  // Normalize status to uppercase for comparison
  const normalizedStatus = status.toUpperCase();
  
  if (normalizedStatus === "APPROVED") {
    return (
      <span
        className={`${base} ${
          isDark ? "bg-green-500 text-black" : "bg-green-100 text-green-700"
        }`}
      >
        Approved
      </span>
    );
  }
  
  if (normalizedStatus === "PENDING") {
    return (
      <span
        className={`${base} ${
          isDark ? "bg-yellow-400 text-black" : "bg-yellow-100 text-yellow-700"
        }`}
      >
        Pending
      </span>
    );
  }
  
  return (
    <span
      className={`${base} ${
        isDark ? "bg-red-500 text-white" : "bg-red-100 text-red-700"
      }`}
    >
      Rejected
    </span>
  );
}
