import { useEffect, useMemo, useState } from "react";
import { useHazardTicketStore } from "../stores/HazardTicketStore";
import { useSessionStore } from "../stores/SessionStore";
import { createHazardTicketDispatchForm, createHazardTicketSubmitForm } from "../constructors/HazardTicketConstructor";
import type { HazardTicketView } from "../types/HazardTicket";

/**
 * 隐患整改闭环：派单（主管）→ 提交复验（维保）→ 复验关闭（主管）。
 * 列表数据由后端按“逾期单在前”排序，这里只负责动作与弹窗状态。
 */
export function useHazardFlow() {
  const { rows, dispatchable, loading, load, loadDispatchable, dispatch, submit, close } = useHazardTicketStore();
  const role = useSessionStore((s) => s.role);
  const [error, setError] = useState("");
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [submitTarget, setSubmitTarget] = useState<HazardTicketView | null>(null);
  const [traceTarget, setTraceTarget] = useState<HazardTicketView | null>(null);
  const [dispatchForm, setDispatchForm] = useState(createHazardTicketDispatchForm);
  const [submitForm, setSubmitForm] = useState(createHazardTicketSubmitForm);

  useEffect(() => {
    void load();
    void loadDispatchable();
  }, [load, loadDispatchable]);

  const run = async (action: () => Promise<void>) => {
    try {
      setError("");
      await action();
    } catch (e) {
      setError((e as Error).message);
      throw e;
    }
  };

  const openDispatch = () => {
    setDispatchForm(createHazardTicketDispatchForm());
    setError("");
    setDispatchOpen(true);
  };

  const doDispatch = () =>
    run(async () => {
      await dispatch({ ...dispatchForm, result_id: Number(dispatchForm.result_id), owner_id: Number(dispatchForm.owner_id) });
      setDispatchOpen(false);
    });

  const openSubmit = (ticket: HazardTicketView) => {
    setSubmitForm(createHazardTicketSubmitForm());
    setError("");
    setSubmitTarget(ticket);
  };

  const doSubmit = () =>
    run(async () => {
      if (!submitTarget) return;
      await submit(submitTarget.id, submitForm.rectify_note);
      setSubmitTarget(null);
    });

  const doClose = (ticket: HazardTicketView) =>
    run(async () => {
      await close(ticket.id);
    });

  const stats = useMemo(
    () => ({
      open: rows.filter((r) => r.rectify_status !== "CLOSED").length,
      overdue: rows.filter((r) => r.overdue).length,
      submitted: rows.filter((r) => r.rectify_status === "SUBMITTED").length
    }),
    [rows]
  );

  return {
    rows,
    dispatchable,
    loading,
    error,
    stats,
    role,
    canDispatch: role === "SUPERVISOR",
    canSubmit: role === "MAINTAINER",
    canClose: role === "SUPERVISOR",
    dispatchOpen,
    setDispatchOpen,
    dispatchForm,
    setDispatchForm,
    openDispatch,
    doDispatch,
    submitTarget,
    setSubmitTarget,
    submitForm,
    setSubmitForm,
    openSubmit,
    doSubmit,
    doClose,
    traceTarget,
    setTraceTarget
  };
}
