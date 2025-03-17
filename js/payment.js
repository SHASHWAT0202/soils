const apiUrl = 'https://backend-x-nine.vercel.app/api';

document.addEventListener('DOMContentLoaded', () => {
  const analysisForm   = document.getElementById('analysisForm');
  const paymentSection = document.getElementById('paymentSection');
  const payButton      = document.getElementById('payButton');
  const historyList    = document.getElementById('historyList');
  
  // Submit soil analysis
  if (analysisForm) {
    analysisForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const analysisData = document.getElementById('analysisData').value;
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${apiUrl}/analysis/analyze`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ analysisData })
      });
      
      if (res.status === 402) {
        paymentSection.style.display = 'block';
        alert('Free analysis limit reached. Please make a payment to continue.');
      } else if (res.ok) {
        const data = await res.json();
        alert(data.message);
        loadHistory();
      } else {
        const data = await res.json();
        alert(data.message || 'Error processing analysis.');
      }
    });
  }
  
  // Payment functionality
  if (payButton) {
    payButton.addEventListener('click', async () => {
      const token = localStorage.getItem('token');
      const orderRes = await fetch(`${apiUrl}/payment/create-order`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      });
      const orderData = await orderRes.json();
      
      const options = {
        key: 'YOUR_RAZORPAY_KEY_ID', // Replace with your Razorpay key
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.id,
        name: 'Agri Solutions',
        description: 'Payment for additional analysis',
        handler: async function (response) {
          const verifyRes = await fetch(`${apiUrl}/payment/verify-payment`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
              razorpay_order_id: orderData.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            alert('Payment successful! You can now continue analysis.');
            paymentSection.style.display = 'none';
          } else {
            alert(verifyData.message || 'Payment verification failed.');
          }
        },
        prefill: {
          name: '',
          email: ''
        },
        theme: {
          color: '#4CAF50'
        }
      };
      const rzp = new Razorpay(options);
      rzp.open();
    });
  }
  
  // Load user's analysis history
  async function loadHistory() {
    const token = localStorage.getItem('token');
    const res = await fetch(`${apiUrl}/analysis/history`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const history = await res.json();
    historyList.innerHTML = '';
    history.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.analysisData + ' (' + new Date(item.date).toLocaleString() + ')';
      historyList.appendChild(li);
    });
  }
  
  if (historyList) {
    loadHistory();
  }
});
