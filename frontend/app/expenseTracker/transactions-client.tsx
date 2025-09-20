'use client';

import { useCallback, useEffect, useState, useRef, startTransition } from 'react';
import { useActionState } from 'react';
import { createTransactionAction } from '@/app/actions/expenseTracker/createTransaction';
import { updateTransactionAction } from '@/app/actions/expenseTracker/updateTransaction';
import { deleteTransactionAction } from '@/app/actions/expenseTracker/deleteTransaction';
import { fetchTransactionsPage } from '@/app/actions/expenseTracker/fetchTransaction';
import { Drawer } from '@chakra-ui/react';

interface Transaction {
    id: string;
    income: boolean;
    description: string;
    amount: number;
    type: string;
    time: string;
}

interface UpdateState {
    success?: boolean;
    error?: string;
    transaction?: Transaction;
}

interface PagingMetadata {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
}

export default function TransactionsClient({ initialTransactions, initialMetadata, pageSize }: { initialTransactions: Transaction[]; initialMetadata: PagingMetadata; pageSize: number; }) {
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [metadata, setMetadata] = useState<PagingMetadata>(initialMetadata);
    // selectedIndex: 0 代表 "Add new transaction" 偽項目, 其餘對應 transactions 陣列 +1 偏移
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [editing, setEditing] = useState<Transaction | null>(null);
    const [creating, setCreating] = useState(false);
    const [createForm, setCreateForm] = useState({ description: '', amount: '', type: '', income: false });
    // Create server action state
    interface CreateState { success?: boolean; error?: string; created?: Transaction }
    const [createState, createAction, createPending] = useActionState<CreateState | undefined, FormData>(createTransactionAction, undefined);
    const [localForm, setLocalForm] = useState({ description: '', amount: '', type: '', income: false });
    const [state, formAction, pending] = useActionState<UpdateState | undefined, FormData>(updateTransactionAction, undefined);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadErr, setLoadErr] = useState<string | null>(null);
    // Track already loaded pages to avoid duplicate fetches
    const loadedPagesRefRef = useRef<Set<number>>(new Set([initialMetadata.page]));
    // Delete action state
    interface DeleteState { success?: boolean; error?: string; id?: string }
    const [deleteState, deleteAction, deletePending] = useActionState<DeleteState | undefined, FormData>(deleteTransactionAction, undefined);

    // Sync form with editing
    useEffect(() => {
        if (editing) {
            setLocalForm({
                description: editing.description,
                amount: String(editing.amount),
                type: editing.type,
                income: editing.income,
            });
        }
    }, [editing]);

    // When server action returns updated transaction, update local list
    useEffect(() => {
        if (state?.success && state.transaction) {
            setTransactions((prev) => prev.map((t) => (t.id === state.transaction!.id ? state.transaction! : t)));
            setEditing(null); // 成功後自動關閉 Drawer
        }
    }, [state]);

    useEffect(() => {
        if (deleteState?.success && deleteState.id) {
            setTransactions(prev => prev.filter(t => t.id !== deleteState.id));
            if (editing && editing.id === deleteState.id) {
                setEditing(null);
            }
            setSelectedIndex(0);
        }
    }, [deleteState, editing]);

    // Refs for drawer focusable elements
    const createFirstFieldRef = useRef<HTMLInputElement | null>(null);
    const editFirstFieldRef = useRef<HTMLInputElement | null>(null);
    const drawerFocusableRefs = useRef<HTMLElement[]>([]);

    const collectDrawerFocusables = useCallback(() => {
        const selector = 'input,button,select,textarea,[data-focusable]';
        let container: HTMLElement | null = null;
        if (creating) container = document.getElementById('create-drawer-content');
        else if (editing) container = document.getElementById('edit-drawer-content');
        if (!container) { drawerFocusableRefs.current = []; return; }
        const nodes = Array.from(container.querySelectorAll<HTMLElement>(selector))
            .filter(n => !n.hasAttribute('disabled'));
        drawerFocusableRefs.current = nodes;
    }, [creating, editing]);

    // Drawer open/close helpers (placed before handleKey to satisfy dependency ordering)
    const openCreateDrawer = () => setCreating(true);
    const closeCreateDrawer = useCallback(() => {
        if (createPending) return;
        setCreating(false);
        setCreateForm({ description: '', amount: '', type: '', income: false });
    }, [createPending]);

    // Focus first field when drawer opens
    useEffect(() => {
        if (creating) {
            setTimeout(() => createFirstFieldRef.current?.focus(), 30);
            collectDrawerFocusables();
        }
    }, [creating, collectDrawerFocusables]);
    useEffect(() => {
        if (editing) {
            setTimeout(() => {
                editFirstFieldRef.current?.focus();
                collectDrawerFocusables();
            }, 30);
        }
    }, [editing, collectDrawerFocusables]);

    const handleKey = useCallback((e: KeyboardEvent) => {
        // If any drawer open, handle arrow/focus inside drawer
        if (creating || editing) {
            let focusables = drawerFocusableRefs.current;
            if (!focusables.length) { // attempt recollect if not yet ready
                collectDrawerFocusables();
                focusables = drawerFocusableRefs.current;
            }
            if (!focusables.length) return;
            const activeEl = document.activeElement as HTMLElement | null;
            let idx = focusables.findIndex(el => el === activeEl);
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                idx = (idx + 1 + focusables.length) % focusables.length;
                focusables[idx]?.focus();
                return;
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                idx = (idx - 1 + focusables.length) % focusables.length;
                focusables[idx]?.focus();
                return;
            } else if (e.key === 'Escape') {
                e.preventDefault();
                if (creating) closeCreateDrawer();
                else if (editing) setEditing(null);
                return;
            }
            return; // Do not propagate to list nav when drawer open
        }
        if (document.activeElement && ['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement).tagName)) return;
        const totalItems = transactions.length + 1;
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % totalItems);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex === 0) openCreateDrawer();
            else {
                const tx = transactions[selectedIndex - 1];
                if (tx) setEditing(tx);
            }
        }
    }, [transactions, selectedIndex, creating, editing, closeCreateDrawer, collectDrawerFocusables]);

    useEffect(() => {
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handleKey]);

    // removed old closeDrawer (replaced by setEditing(null))


    // IntersectionObserver for infinite scroll
    useEffect(() => {
        const loadedPagesRef = loadedPagesRefRef.current;
        const loadMore = async () => {
            if (!metadata.has_next || loadingMore) return;
            const currentPage = metadata.page && metadata.page >= 1 ? metadata.page : 1;
            const nextPage = currentPage + 1;
            if (loadedPagesRef.has(nextPage)) return; // already loaded
            setLoadingMore(true);
            setLoadErr(null);
            try {
                const data = await fetchTransactionsPage(nextPage, pageSize);
                // 去重 (依 id)
                setTransactions((prev) => {
                    const existingIds = new Set(prev.map(t => t.id));
                    const newItems = data.items.filter(i => !existingIds.has(i.id));
                    return [...prev, ...newItems];
                });
                setMetadata(data.metadata);
                loadedPagesRef.add(nextPage);
            } catch (e) {
                const msg = e instanceof Error ? e.message : 'Failed to load';
                setLoadErr(msg);
            } finally {
                setLoadingMore(false);
            }
        };
        const sentinel = document.getElementById('infinite-sentinel');
        if (!sentinel) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    loadMore();
                }
            });
        }, { rootMargin: '200px' });
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [metadata.has_next, metadata.page, loadingMore, pageSize]);

    // (moved openCreateDrawer/closeCreateDrawer earlier)

    // After create action success, prepend and close
    useEffect(() => {
        if (createState?.success && createState.created) {
            setTransactions(prev => [createState.created!, ...prev]);
            setSelectedIndex(1);
            closeCreateDrawer();
        }
    }, [createState, closeCreateDrawer]);

    useEffect(() => {
        if (selectedIndex === 0) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [selectedIndex]);

    interface GroupedTransaction extends Transaction {
        originalIndex: number;
    }

    interface TransactionGroup {
        [date: string]: GroupedTransaction[];
    }

    const groupTransactionsByDate = (transactions: Transaction[]): TransactionGroup => {
        const groups: TransactionGroup = {};

        transactions.forEach((tx, originalIndex) => {
            let raw = tx.time;
            if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(raw)) {
                raw = raw + 'Z';
            }
            const date = new Date(raw);
            const dateKey = date.toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                timeZone: 'Asia/Taipei'
            }).replace(/\//g, '/');

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push({ ...tx, originalIndex });
        });

        return groups;
    };

    const groupedTransactions: TransactionGroup = groupTransactionsByDate(transactions);

    return (
        <div className="w-full">
            <div className="space-y-1">
                {/* Add new transaction pseudo item */}
                <div
                    className={`flex items-center gap-3 border text-left cursor-pointer ${selectedIndex === 0 ? 'bg-gray-200 text-gray-700' : 'bg-white text-gray-500'} transition-colors`}
                    style={{ padding: '10px' }}
                    onClick={() => setSelectedIndex(0)}
                    onDoubleClick={openCreateDrawer}
                >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedIndex === 0 ? 'bg-gray-400' : 'bg-gray-300'}`}>
                        <p className="text-white text-4xl">+</p>
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-semibold">Add new transaction</div>
                        <div className="text-[11px] opacity-80">Press Enter to create</div>
                    </div>
                </div>

                {Object.entries(groupedTransactions).map(([date, dateTransactions]: [string, GroupedTransaction[]]) => (
                    <div key={date}>
                        <div className="bg-[#16a34a] text-sm font-medium text-white text-left" style={{ padding: '2px 10px' }}>
                            {date}
                        </div>

                        {dateTransactions.map((tx: GroupedTransaction) => {
                            const listIndex = tx.originalIndex + 1;
                            const active = listIndex === selectedIndex;
                            return (
                                <div
                                    key={tx.id}
                                    className={`flex items-center gap-3 text-left cursor-pointer ${active ? 'bg-gray-200 text-gray-700' : 'bg-white text-gray-500'} transition-colors border-b border-gray-100`}
                                    style={{ padding: '10px' }}
                                    onClick={() => setSelectedIndex(listIndex)}
                                    onDoubleClick={() => setEditing(tx)}
                                    ref={el => {
                                        if (active && el) {
                                            el.scrollIntoView({ block: 'center', behavior: 'smooth' });
                                        }
                                    }}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${active ? 'bg-gray-400' : 'bg-gray-300'} mr-3`}>
                                        {/* icon base on {tx.type}*/}
                                    </div>
                                    <div className="text-sm font-semibold truncate flex-1 min-w-0">
                                        {tx.description}
                                    </div>
                                    <div
                                        className="ml-3 flex-shrink-0 opacity-80"
                                        style={{ fontWeight: tx.income ? 'bold' : 'normal' }}
                                    >
                                        {tx.income ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {metadata.has_next && (
                <div className="flex justify-center py-2 text-xs text-gray-500" id="infinite-sentinel">
                    {loadingMore ? 'Loading' : 'Scroll down to load more'}
                    {loadErr && <span className="text-red-600 ml-2">{loadErr}</span>}
                </div>
            )}

            <Drawer.Root open={!!editing} onOpenChange={(v) => { if (!v.open) setEditing(null); }} placement="end">
                <Drawer.Backdrop />
                <Drawer.Positioner>
                    <Drawer.Content className="w-80 max-w-[90vw]" id="edit-drawer-content" bg={"white"}>
                        {editing && (
                            <div className="flex flex-col h-full">
                                <div className="px-4 py-3 border-b flex items-center justify-between">
                                    <h2 className="font-bold text-sm">Edit Transaction</h2>
                                </div>
                                <div className="p-4 overflow-y-auto flex-1">
                                    <form action={formAction} className="space-y-3" onSubmit={() => { /* no-op */ }}>
                                        <input type="hidden" name="id" value={editing.id} />
                                        <div className="flex flex-col text-left gap-1">
                                            <label className="text-xs font-medium">Description</label>
                                            <input
                                                ref={editFirstFieldRef}
                                                name="description"
                                                value={localForm.description}
                                                onChange={(e) => setLocalForm((p) => ({ ...p, description: e.target.value }))}
                                                className="border rounded px-2 py-1 text-sm"
                                                required
                                                data-focusable
                                            />
                                        </div>
                                        <div className="flex flex-col text-left gap-1">
                                            <label className="text-xs font-medium">Amount</label>
                                            <input
                                                name="amount"
                                                type="number"
                                                step="0.01"
                                                value={localForm.amount}
                                                onChange={(e) => setLocalForm((p) => ({ ...p, amount: e.target.value }))}
                                                className="border rounded px-2 py-1 text-sm"
                                                required
                                                data-focusable
                                            />
                                        </div>
                                        <div className="flex flex-col text-left gap-1">
                                            <label className="text-xs font-medium">Type</label>
                                            <input
                                                name="type"
                                                value={localForm.type}
                                                onChange={(e) => setLocalForm((p) => ({ ...p, type: e.target.value }))}
                                                className="border rounded px-2 py-1 text-sm"
                                                required
                                                data-focusable
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                id="income"
                                                name="income"
                                                type="checkbox"
                                                checked={localForm.income}
                                                onChange={(e) => setLocalForm((p) => ({ ...p, income: e.target.checked }))}
                                                className="h-4 w-4"
                                                data-focusable
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        setLocalForm(p => ({ ...p, income: !p.income }));
                                                    }
                                                }}
                                            />
                                            <label htmlFor="income" className="text-xs">Income?</label>
                                        </div>
                                        {state?.error && <p className="text-[11px] text-red-600">{state.error}</p>}
                                        {deleteState?.error && <p className="text-[11px] text-red-600">{deleteState.error}</p>}
                                        <div className="flex gap-2 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setEditing(null)}
                                                className="flex-1 border rounded py-1 text-sm hover:bg-gray-100"
                                                data-focusable
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={pending || deletePending}
                                                className="flex-1 bg-blue-600 text-white rounded py-1 text-sm disabled:opacity-50"
                                                data-focusable
                                            >
                                                {pending ? 'Saving...' : 'Save'}
                                            </button>
                                        </div>
                                        <div className="pt-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!editing) return;
                                                    if (!confirm('Sure to delete this transaction? This action cannot be undone.')) return;
                                                    const fd = new FormData();
                                                    fd.set('id', editing.id);
                                                    startTransition(() => deleteAction(fd));
                                                }}
                                                disabled={deletePending}
                                                className="w-full bg-red-600 text-white rounded py-1 text-sm disabled:opacity-50 mt-2"
                                                data-focusable
                                            >{deletePending ? 'Deleting...' : 'Delete'}</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </Drawer.Content>
                </Drawer.Positioner>
            </Drawer.Root>

            {/* Create Drawer using Chakra UI */}
            <Drawer.Root open={creating} onOpenChange={(v) => { if (!v.open) closeCreateDrawer(); }} placement="end">
                <Drawer.Backdrop />
                <Drawer.Positioner>
                    <Drawer.Content className="w-80 max-w-[90vw]" id="create-drawer-content" bg="white">
                        <div className="flex items-center justify-between px-4 py-3 border-b">
                            <h2 className="font-bold text-sm">New Transaction</h2>
                        </div>
                        <div className="p-4 space-y-3 text-left">
                            <div className="flex flex-col text-left gap-1">
                                <label className="text-xs font-medium">Description</label>
                                <input
                                    value={createForm.description}
                                    onChange={(e) => setCreateForm(p => ({ ...p, description: e.target.value }))}
                                    className="border rounded px-2 py-1 text-sm"
                                    placeholder="Description"
                                    ref={createFirstFieldRef}
                                    data-focusable
                                />
                            </div>
                            <div className="flex flex-col text-left gap-1">
                                <label className="text-xs font-medium">Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={createForm.amount}
                                    onChange={(e) => setCreateForm(p => ({ ...p, amount: e.target.value }))}
                                    className="border rounded px-2 py-1 text-sm"
                                    placeholder="Amount"
                                    data-focusable
                                />
                            </div>
                            <div className="flex flex-col text-left gap-1">
                                <label className="text-xs font-medium">Type</label>
                                <input
                                    value={createForm.type}
                                    onChange={(e) => setCreateForm(p => ({ ...p, type: e.target.value }))}
                                    className="border rounded px-2 py-1 text-sm"
                                    placeholder="Type"
                                    data-focusable
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    id="create-income"
                                    type="checkbox"
                                    checked={createForm.income}
                                    onChange={(e) => setCreateForm(p => ({ ...p, income: e.target.checked }))}
                                    className="h-4 w-4"
                                    data-focusable
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            setCreateForm(p => ({ ...p, income: !p.income }));
                                        }
                                    }}
                                />
                                <label htmlFor="create-income" className="text-xs">Income?</label>
                            </div>
                            {createState?.error && <p className="text-[11px] text-red-600">{createState.error}</p>}
                            {createState?.success && <p className="text-[11px] text-green-600">Create successful</p>}
                            <form
                                action={createAction}
                                onSubmit={(e) => {
                                    const fd = new FormData();
                                    fd.set('description', createForm.description);
                                    fd.set('amount', createForm.amount);
                                    fd.set('type', createForm.type);
                                    if (createForm.income) fd.set('income', 'on');
                                    startTransition(() => {
                                        createAction(fd);
                                    });
                                    e.preventDefault();
                                }}
                            >
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeCreateDrawer}
                                        disabled={createPending}
                                        className="flex-1 border rounded py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
                                        data-focusable
                                    >Cancel</button>
                                    <button
                                        type="submit"
                                        disabled={createPending}
                                        className="flex-1 bg-green-600 text-white rounded py-1 text-sm disabled:opacity-50"
                                        data-focusable
                                    >{createPending ? 'Sending...' : 'Create'}</button>
                                </div>
                            </form>
                        </div>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Drawer.Root>
        </div>
    );
}