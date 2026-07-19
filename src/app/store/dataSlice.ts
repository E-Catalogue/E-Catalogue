import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Unit, Lead, TestDrive, Sale, Payment, Expense } from '@/data/types';
import { UNITS, LEADS, TEST_DRIVES, SALES, PAYMENTS, EXPENSES } from '@/data/mock';

interface DataState {
  units: Unit[];
  leads: Lead[];
  testDrives: TestDrive[];
  sales: Sale[];
  payments: Payment[];
  expenses: Expense[];
}

const initialState: DataState = {
  units: UNITS,
  leads: LEADS,
  testDrives: TEST_DRIVES,
  sales: SALES,
  payments: PAYMENTS,
  expenses: EXPENSES,
};

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    // ---- Units ----
    addUnit: (state, action: PayloadAction<Omit<Unit, 'id'>>) => {
      state.units.unshift({ ...action.payload, id: uid('u') });
    },
    updateUnit: (state, action: PayloadAction<Unit>) => {
      const i = state.units.findIndex((u) => u.id === action.payload.id);
      if (i !== -1) state.units[i] = action.payload;
    },
    removeUnit: (state, action: PayloadAction<string>) => {
      state.units = state.units.filter((u) => u.id !== action.payload);
    },

    // ---- Leads ----
    addLead: (state, action: PayloadAction<Omit<Lead, 'id'>>) => {
      state.leads.unshift({ ...action.payload, id: uid('l') });
    },
    updateLead: (state, action: PayloadAction<Lead>) => {
      const i = state.leads.findIndex((l) => l.id === action.payload.id);
      if (i !== -1) state.leads[i] = action.payload;
    },
    removeLead: (state, action: PayloadAction<string>) => {
      state.leads = state.leads.filter((l) => l.id !== action.payload);
    },

    // ---- Test Drives ----
    addTestDrive: (state, action: PayloadAction<Omit<TestDrive, 'id'>>) => {
      state.testDrives.unshift({ ...action.payload, id: uid('t') });
    },
    updateTestDrive: (state, action: PayloadAction<TestDrive>) => {
      const i = state.testDrives.findIndex((t) => t.id === action.payload.id);
      if (i !== -1) state.testDrives[i] = action.payload;
    },
    removeTestDrive: (state, action: PayloadAction<string>) => {
      state.testDrives = state.testDrives.filter((t) => t.id !== action.payload);
    },

    // ---- Sales ----
    addSale: (state, action: PayloadAction<Omit<Sale, 'id'>>) => {
      state.sales.unshift({ ...action.payload, id: uid('s') });
    },
    updateSale: (state, action: PayloadAction<Sale>) => {
      const i = state.sales.findIndex((s) => s.id === action.payload.id);
      if (i !== -1) state.sales[i] = action.payload;
    },
    removeSale: (state, action: PayloadAction<string>) => {
      state.sales = state.sales.filter((s) => s.id !== action.payload);
    },

    // ---- Payments ----
    addPayment: (state, action: PayloadAction<Omit<Payment, 'id'>>) => {
      state.payments.unshift({ ...action.payload, id: uid('p') });
    },
    updatePayment: (state, action: PayloadAction<Payment>) => {
      const i = state.payments.findIndex((p) => p.id === action.payload.id);
      if (i !== -1) state.payments[i] = action.payload;
    },
    removePayment: (state, action: PayloadAction<string>) => {
      state.payments = state.payments.filter((p) => p.id !== action.payload);
    },

    // ---- Expenses ----
    addExpense: (state, action: PayloadAction<Omit<Expense, 'id'>>) => {
      state.expenses.unshift({ ...action.payload, id: uid('e') });
    },
    updateExpense: (state, action: PayloadAction<Expense>) => {
      const i = state.expenses.findIndex((e) => e.id === action.payload.id);
      if (i !== -1) state.expenses[i] = action.payload;
    },
    removeExpense: (state, action: PayloadAction<string>) => {
      state.expenses = state.expenses.filter((e) => e.id !== action.payload);
    },
  },
});

export const {
  addUnit, updateUnit, removeUnit,
  addLead, updateLead, removeLead,
  addTestDrive, updateTestDrive, removeTestDrive,
  addSale, updateSale, removeSale,
  addPayment, updatePayment, removePayment,
  addExpense, updateExpense, removeExpense,
} = dataSlice.actions;

export default dataSlice.reducer;
