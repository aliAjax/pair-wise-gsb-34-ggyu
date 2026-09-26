import { useMemo, useState } from "react";
import type { HazardTicket } from "../types/HazardTicket";

const pageSize = 8;

export function isOverdue(ticket: HazardTicket, today = new Date()) {
  if (ticket.rectify_status === "CLOSED") return false;
  return new Date(`${ticket.deadline}T23:59:59`) < today;
}

export function useHazardFlow(rows: HazardTicket[] = []) {
  const [page, setPage] = useState(1);
  const sortedRows = useMemo(() => {
    const today = new Date();
    return [...rows].sort((left, right) => {
      const overdueWeight = Number(isOverdue(right, today)) - Number(isOverdue(left, today));
      if (overdueWeight !== 0) return overdueWeight;
      return left.deadline.localeCompare(right.deadline) || left.id - right.id;
    });
  }, [rows]);
  const pageRows = useMemo(
    () => sortedRows.slice((page - 1) * pageSize, page * pageSize),
    [sortedRows, page]
  );

  return {
    page,
    setPage,
    pageSize,
    pageRows,
    sortedRows,
    total: rows.length,
    overdueCount: sortedRows.filter((row) => isOverdue(row)).length,
    openCount: sortedRows.filter((row) => row.rectify_status !== "CLOSED").length
  };
}
