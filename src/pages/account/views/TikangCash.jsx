import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Modal from '../../../components/Modal';
import LoadingSpinner from '../../../components/LoadingSpinner';

const TikangCash = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState('');
  const [amount, setAmount] = useState('');
  const [adminQR, setAdminQR] = useState('');
  const [receiptImage, setReceiptImage] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL_GUEST;
  const API_URL_OWNER = process.env.REACT_APP_API_URL_OWNER;

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('tikangToken');
      const res = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data?.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminQR = async () => {
    try {
      const token = localStorage.getItem('tikangToken');
      const res = await fetch(`${API_URL_OWNER}/get-admin-gcash`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data?.gcash_qr) {
        setAdminQR(data.gcash_qr);
      }
    } catch (error) {
      console.error('Failed to fetch admin GCash QR:', error);
    }
  };

  const handleSubmitTransaction = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
  
    const formData = new FormData();
    formData.append('user_id', user.user_id);
    formData.append('type', transactionType.toLowerCase()); // 'deposit' or 'withdraw'
    formData.append('amount', amount);
    formData.append('status', 'pending');
    formData.append('method', 'gcash');
  
    if (transactionType === 'Deposit') {
      if (!receiptImage) {
        alert('Please upload your GCash receipt.');
        return;
      }
      formData.append('reference', receiptImage); // file
    } else {
      // for withdraw, attach a placeholder if needed
      formData.append('reference', ''); // or your own server logic can handle null
    }
  
    try {
      const token = localStorage.getItem('tikangToken');
      const res = await fetch(`${API_URL_OWNER}/submit-wallet-transaction`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });
  
      const data = await res.json();
  
      if (res.ok) {
        alert('Transaction submitted successfully and is now pending.');
        setModalOpen(false);
        fetchUserData(); // refresh balance
      } else {
        alert(data?.message || 'Failed to submit transaction.');
      }
    } catch (error) {
      console.error('Transaction submission error:', error);
      alert('Something went wrong while submitting the transaction.');
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(val ?? 0);

  const openModal = async (type) => {
    setTransactionType(type);
    setAmount('');
    setReceiptImage(null);
    if (type === 'Deposit') await fetchAdminQR();
    setModalOpen(true);
  };

  if (loading || !user) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tikang Cash Balance</h1>

      <div className="bg-white shadow-md rounded-xl p-6 text-center">
        <p className="text-lg text-gray-600 mb-2">
          Hello, <span className="font-semibold">{user?.full_name}</span>
        </p>
        <p className="text-xl">Your Current Tikang Cash:</p>
        <p className="text-4xl font-bold text-green-600 mt-2">
          {formatCurrency(user?.tikang_cash)}
        </p>

        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => openModal('Deposit')}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl"
          >
            Deposit
          </button>
          <button
            onClick={() => openModal('Withdraw')}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <h3 className="text-xl font-bold mb-4">{transactionType} Tikang Cash</h3>

          <input
            type="number"
            placeholder="Enter amount"
            className="border rounded w-full p-2 mb-4"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
          />

          {transactionType === 'Withdraw' && (
            <>
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">You can withdraw up to:</p>
                <p className="text-2xl font-bold text-green-600 mb-2">
                  {formatCurrency(user?.tikang_cash)}
                </p>

                <p className="text-sm mb-2">Your GCash QR:</p>
                {user.gcash_qr ? (
                  <img
                    src={`${process.env.REACT_APP_API_URL}${user.gcash_qr}`}
                    alt="Your GCash QR"
                    className="mx-auto w-48 h-48 object-contain rounded"
                  />
                ) : (
                  <p className="text-gray-500">No GCash QR uploaded.</p>
                )}
              </div>
            </>
          )}

          {transactionType === 'Deposit' && (
            <>
              <div className="text-center mb-4">
                <p className="text-sm mb-2">Admin GCash QR:</p>
                {adminQR ? (
                  <>
                    <img
                      src={`${process.env.REACT_APP_API_URL}${adminQR}`}
                      alt="Admin GCash QR"
                      className="mx-auto w-48 h-48 object-contain rounded cursor-pointer transition duration-300 hover:scale-105"
                      onClick={() => window.open(`${process.env.REACT_APP_API_URL}${adminQR}`, '_blank')}
                    />
                    <p className="text-xs text-gray-500 mt-1 italic">Click the image to zoom</p>
                  </>
                ) : (
                  <p className="text-gray-500">Loading QR...</p>
                )}
              </div>

              <div className="mb-4 text-left">
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload GCash Receipt</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceiptImage(e.target.files[0])}
                  className="w-full border rounded p-2"
                />
              </div>
            </>
          )}
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitTransaction}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Confirm
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TikangCash;