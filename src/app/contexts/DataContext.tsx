import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";

// Types
export interface Transaction {
  id: string;
  type: "in" | "out";
  amount: number;
  description: string;
  truckNumber?: string;
  numberOfSacks?: number;
  weight?: number;
  pricePerQuintal?: number;
  proofType?: "photo" | "video" | "weighbridge";
  date: string;
  time: string;
  status: "pending" | "approved" | "rejected";
  submittedBy: string;
  submittedById: string;
  createdAt: string;
  updatedAt?: string;
  editHistory?: AuditLog[];
}

export interface Expense {
  id: string;
  category: "labor" | "electricity" | "maintenance" | "transport" | "supplies" | "other";
  amount: number;
  description: string;
  billPhoto?: string;
  date: string;
  time: string;
  status: "pending" | "approved" | "rejected";
  submittedBy: string;
  submittedById: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt?: string;
  editHistory?: AuditLog[];
}

export interface Note {
  id: string;
  content: string;
  category: "general" | "urgent" | "maintenance" | "finance" | "inventory";
  status: "open" | "in-progress" | "resolved";
  isPinned: boolean;
  createdBy: string;
  createdById: string;
  mentions: string[]; // user IDs
  parentId?: string; // for threaded replies
  replies?: Note[];
  createdAt: string;
  updatedAt?: string;
}

export interface Inventory {
  rawRiceStock: number; // in kg
  processedRiceStock: number; // in kg
  lastUpdated: string;
}

export interface AuditLog {
  id: string;
  action: "create" | "update" | "delete" | "approve" | "reject";
  entityType: "transaction" | "expense" | "note" | "inventory";
  entityId: string;
  userId: string;
  userName: string;
  changes?: Record<string, { old: any; new: any }>;
  timestamp: string;
}

interface DataContextType {
  transactions: Transaction[];
  expenses: Expense[];
  notes: Note[];
  inventory: Inventory;
  auditLogs: AuditLog[];
  
  // Transaction methods
  addTransaction: (transaction: Omit<Transaction, "id" | "createdAt">) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  approveTransaction: (id: string) => void;
  rejectTransaction: (id: string) => void;
  
  // Expense methods
  addExpense: (expense: Omit<Expense, "id" | "createdAt">) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  approveExpense: (id: string) => void;
  rejectExpense: (id: string) => void;
  
  // Note methods
  addNote: (note: Omit<Note, "id" | "createdAt">) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  pinNote: (id: string) => void;
  unpinNote: (id: string) => void;
  
  // Inventory methods
  updateInventory: (updates: Partial<Inventory>) => void;
  
  // Audit methods
  getEntityHistory: (entityType: string, entityId: string) => AuditLog[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [inventory, setInventory] = useState<Inventory>({
    rawRiceStock: 50000, // 50 tons initial stock
    processedRiceStock: 30000, // 30 tons initial stock
    lastUpdated: new Date().toISOString(),
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Load data from localStorage
  useEffect(() => {
    const loadedTransactions = localStorage.getItem("transactions");
    const loadedExpenses = localStorage.getItem("expenses");
    const loadedNotes = localStorage.getItem("notes");
    const loadedInventory = localStorage.getItem("inventory");
    const loadedAuditLogs = localStorage.getItem("auditLogs");

    if (loadedTransactions) {
      setTransactions(JSON.parse(loadedTransactions));
    } else {
      // Initialize with sample data
      const sampleTransactions: Transaction[] = [
        {
          id: "1",
          type: "in",
          amount: 50000,
          description: "Rice Sale - Truck Load",
          truckNumber: "MH12AB1234",
          numberOfSacks: 100,
          weight: 5000,
          pricePerQuintal: 1000,
          proofType: "weighbridge",
          date: "2026-03-13",
          time: "10:30 AM",
          status: "approved",
          submittedBy: "Ram Kumar",
          submittedById: "1",
          createdAt: new Date("2026-03-13T10:30:00").toISOString(),
        },
        {
          id: "2",
          type: "out",
          amount: 20000,
          description: "Raw Rice Purchase",
          truckNumber: "MH14CD5678",
          numberOfSacks: 40,
          weight: 2000,
          pricePerQuintal: 1000,
          proofType: "photo",
          date: "2026-03-13",
          time: "09:15 AM",
          status: "pending",
          submittedBy: "Suresh Yadav",
          submittedById: "2",
          createdAt: new Date("2026-03-13T09:15:00").toISOString(),
        },
      ];
      setTransactions(sampleTransactions);
    }
    
    if (loadedExpenses) {
      setExpenses(JSON.parse(loadedExpenses));
    } else {
      // Initialize with sample data
      const sampleExpenses: Expense[] = [
        {
          id: "1",
          category: "maintenance",
          amount: 1500,
          description: "Machine oil change",
          date: "2026-03-13",
          time: "11:30 AM",
          status: "approved",
          submittedBy: "Ram Kumar",
          submittedById: "1",
          billPhoto: "photo",
          createdAt: new Date("2026-03-13T11:30:00").toISOString(),
        },
        {
          id: "2",
          category: "labor",
          amount: 3000,
          description: "Daily wages - 5 workers",
          date: "2026-03-13",
          time: "08:00 AM",
          status: "pending",
          submittedBy: "Suresh Yadav",
          submittedById: "2",
          createdAt: new Date("2026-03-13T08:00:00").toISOString(),
        },
      ];
      setExpenses(sampleExpenses);
    }
    
    if (loadedNotes) {
      setNotes(JSON.parse(loadedNotes));
    } else {
      // Initialize with sample data
      const sampleNotes: Note[] = [
        {
          id: "1",
          content: "Need to check machine performance. @supervisor1 please review.",
          category: "maintenance",
          status: "open",
          isPinned: true,
          createdBy: "Ram Kumar",
          createdById: "1",
          mentions: ["3"],
          createdAt: new Date("2026-03-12T14:00:00").toISOString(),
          replies: [],
        },
      ];
      setNotes(sampleNotes);
    }
    
    if (loadedInventory) setInventory(JSON.parse(loadedInventory));
    if (loadedAuditLogs) setAuditLogs(JSON.parse(loadedAuditLogs));
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("inventory", JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem("auditLogs", JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Helper to create audit log
  const createAuditLog = (
    action: AuditLog["action"],
    entityType: AuditLog["entityType"],
    entityId: string,
    changes?: Record<string, { old: any; new: any }>
  ) => {
    if (!user) return;
    
    const log: AuditLog = {
      id: Date.now().toString() + Math.random(),
      action,
      entityType,
      entityId,
      userId: user.id,
      userName: user.name,
      changes,
      timestamp: new Date().toISOString(),
    };
    
    setAuditLogs((prev) => [log, ...prev]);
  };

  // Transaction methods
  const addTransaction = (transaction: Omit<Transaction, "id" | "createdAt">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    setTransactions((prev) => [newTransaction, ...prev]);
    createAuditLog("create", "transaction", newTransaction.id);
    
    // Update inventory if transaction is approved
    if (newTransaction.status === "approved" && newTransaction.weight) {
      const inventoryUpdate: Partial<Inventory> = {
        lastUpdated: new Date().toISOString(),
      };
      
      if (newTransaction.type === "in") {
        // Selling processed rice - reduce processed stock
        inventoryUpdate.processedRiceStock = inventory.processedRiceStock - newTransaction.weight;
      } else {
        // Buying raw rice - increase raw stock
        inventoryUpdate.rawRiceStock = inventory.rawRiceStock + newTransaction.weight;
      }
      
      updateInventory(inventoryUpdate);
    }
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const changes: Record<string, { old: any; new: any }> = {};
          Object.keys(updates).forEach((key) => {
            if ((updates as any)[key] !== (t as any)[key]) {
              changes[key] = {
                old: (t as any)[key],
                new: (updates as any)[key],
              };
            }
          });
          
          createAuditLog("update", "transaction", id, changes);
          
          return {
            ...t,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  const approveTransaction = (id: string) => {
    const transaction = transactions.find((t) => t.id === id);
    if (!transaction) return;
    
    updateTransaction(id, { status: "approved" });
    createAuditLog("approve", "transaction", id);
    
    // Update inventory
    if (transaction.weight) {
      const inventoryUpdate: Partial<Inventory> = {
        lastUpdated: new Date().toISOString(),
      };
      
      if (transaction.type === "in") {
        inventoryUpdate.processedRiceStock = inventory.processedRiceStock - transaction.weight;
      } else {
        inventoryUpdate.rawRiceStock = inventory.rawRiceStock + transaction.weight;
      }
      
      updateInventory(inventoryUpdate);
    }
  };

  const rejectTransaction = (id: string) => {
    updateTransaction(id, { status: "rejected" });
    createAuditLog("reject", "transaction", id);
  };

  // Expense methods
  const addExpense = (expense: Omit<Expense, "id" | "createdAt">) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    setExpenses((prev) => [newExpense, ...prev]);
    createAuditLog("create", "expense", newExpense.id);
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const changes: Record<string, { old: any; new: any }> = {};
          Object.keys(updates).forEach((key) => {
            if ((updates as any)[key] !== (e as any)[key]) {
              changes[key] = {
                old: (e as any)[key],
                new: (updates as any)[key],
              };
            }
          });
          
          createAuditLog("update", "expense", id, changes);
          
          return {
            ...e,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        }
        return e;
      })
    );
  };

  const approveExpense = (id: string) => {
    if (!user) return;
    
    updateExpense(id, {
      status: "approved",
      approvedBy: user.name,
      approvedAt: new Date().toISOString(),
    });
    createAuditLog("approve", "expense", id);
  };

  const rejectExpense = (id: string) => {
    updateExpense(id, { status: "rejected" });
    createAuditLog("reject", "expense", id);
  };

  // Note methods
  const addNote = (note: Omit<Note, "id" | "createdAt">) => {
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      replies: [],
    };
    
    setNotes((prev) => [newNote, ...prev]);
    createAuditLog("create", "note", newNote.id);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const changes: Record<string, { old: any; new: any }> = {};
          Object.keys(updates).forEach((key) => {
            if ((updates as any)[key] !== (n as any)[key]) {
              changes[key] = {
                old: (n as any)[key],
                new: (updates as any)[key],
              };
            }
          });
          
          createAuditLog("update", "note", id, changes);
          
          return {
            ...n,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        }
        return n;
      })
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    createAuditLog("delete", "note", id);
  };

  const pinNote = (id: string) => {
    updateNote(id, { isPinned: true });
  };

  const unpinNote = (id: string) => {
    updateNote(id, { isPinned: false });
  };

  // Inventory methods
  const updateInventory = (updates: Partial<Inventory>) => {
    const oldInventory = { ...inventory };
    const newInventory = { ...inventory, ...updates, lastUpdated: new Date().toISOString() };
    
    setInventory(newInventory);
    
    const changes: Record<string, { old: any; new: any }> = {};
    Object.keys(updates).forEach((key) => {
      if ((updates as any)[key] !== (oldInventory as any)[key]) {
        changes[key] = {
          old: (oldInventory as any)[key],
          new: (updates as any)[key],
        };
      }
    });
    
    createAuditLog("update", "inventory", "main", changes);
  };

  // Audit methods
  const getEntityHistory = (entityType: string, entityId: string) => {
    return auditLogs.filter(
      (log) => log.entityType === entityType && log.entityId === entityId
    );
  };

  return (
    <DataContext.Provider
      value={{
        transactions,
        expenses,
        notes,
        inventory,
        auditLogs,
        addTransaction,
        updateTransaction,
        approveTransaction,
        rejectTransaction,
        addExpense,
        updateExpense,
        approveExpense,
        rejectExpense,
        addNote,
        updateNote,
        deleteNote,
        pinNote,
        unpinNote,
        updateInventory,
        getEntityHistory,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}