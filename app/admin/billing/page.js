// app/admin/billing/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import BillingHeader from './components/BillingHeader';
import BillingStatsCards from './components/BillingStatsCards';
import BillingControls from './components/BillingControls';
import BillingTable from './components/BillingTable';
import PaymentModal from './components/PaymentModal';

export default function AdminBillingPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  // State management
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentNotes, setPaymentNotes] = useState('');

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  // Authentication and initialization
  useEffect(() => {
    checkAuthAndInitialize();
  }, []);

  // Fetch bills when filters change
  useEffect(() => {
    if (currentUser) {
      fetchBills();
    }
  }, [selectedMonth, selectedYear, currentUser]);

  const checkAuthAndInitialize = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles_new')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/unauthorized');
        return;
      }

      setCurrentUser(user);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/billing?action=get-all-bills&month=${selectedMonth}&year=${selectedYear}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setBills(data.bills || []);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateBills = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch('/api/billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate-bills',
          month: selectedMonth,
          year: selectedYear
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Successfully generated ${data.bills_generated} bills for ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`);
        fetchBills();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error generating bills:', error);
      alert('Failed to generate bills');
    } finally {
      setIsGenerating(false);
    }
  };

  const recordPayment = async () => {
    if (!paymentAmount || !selectedBill) return;

    try {
      const response = await fetch('/api/billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'record-payment',
          userId: selectedBill.user_id,
          month: selectedBill.month,
          year: selectedBill.year,
          amount: parseFloat(paymentAmount),
          paymentMethod,
          notes: paymentNotes
        })
      });

      if (response.ok) {
        alert('Payment recorded successfully');
        handleClosePaymentModal();
        fetchBills();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Failed to record payment');
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      paid: "bg-green-100 text-green-800",
      partial: "bg-yellow-100 text-yellow-800",
      pending: "bg-red-100 text-red-800"
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.profiles_new?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.profiles_new?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.user_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalStats = {
    totalBills: filteredBills.length,
    totalAmount: filteredBills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0),
    totalPaid: filteredBills.reduce((sum, bill) => sum + (bill.paid_amount || 0), 0),
    totalDue: filteredBills.reduce((sum, bill) => sum + (bill.due_amount || 0), 0),
    paidBills: filteredBills.filter(bill => bill.status === 'paid').length,
    pendingBills: filteredBills.filter(bill => bill.status === 'pending').length,
  };

  const handleAddPayment = (bill) => {
    setSelectedBill(bill);
    setPaymentAmount(bill.due_amount?.toString() || '');
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedBill(null);
    setPaymentAmount('');
    setPaymentNotes('');
    setPaymentMethod('cash');
  };

  if (loading && !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BillingHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <BillingStatsCards totalStats={totalStats} />
        
        <BillingControls
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onGenerateBills={generateBills}
          onRefreshBills={fetchBills}
          isGenerating={isGenerating}
        />
        
        <BillingTable
          filteredBills={filteredBills}
          loading={loading}
          getStatusBadge={getStatusBadge}
          onAddPayment={handleAddPayment}
        />
      </div>

      <PaymentModal
        showModal={showPaymentModal}
        selectedBill={selectedBill}
        paymentAmount={paymentAmount}
        setPaymentAmount={setPaymentAmount}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        paymentNotes={paymentNotes}
        setPaymentNotes={setPaymentNotes}
        onRecordPayment={recordPayment}
        onClose={handleClosePaymentModal}
        months={months}
      />
    </div>
  );
}