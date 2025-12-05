import { useEffect, useState } from "react";
import "./Setting.css";
import type { AuditTrail } from "../../Types/AuditTrail";

export const Setting = () => {
  const [auditTrail, setAuditTrail] = useState(false);
  const [userManagement, setUserManagement] = useState(false);
  const [auditData, setAuditData] = useState<AuditTrail[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');



  // AUTH
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  // Initialize dates
  useEffect(() => {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    setStartDate(lastWeek.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

  // SHOW SECTION
  const toggleAudit = () => {
    if (!auditTrail) {
      setPendingAction('audit');
      setShowPasswordModal(true);
      return;
    }
    
    setAuditTrail((prev) => !prev);
    setUserManagement(() => false);
    if (!auditTrail) {
      fetchAuditData();
    }
  }
  
  const toggleUserManagement = () => {
    if (!userManagement) {
      setPendingAction('users');
      setShowPasswordModal(true);
      return;
    }
    
    setUserManagement((prev) => !prev);
    setAuditTrail(() => false);
    if (!userManagement) {
      fetchUsers();
    }
  }
  


  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://192.168.1.89:5500/api/users');
      if (response.ok) {
        const result = await response.json();
        setUsers(result.data || []);
      } else {
        // Fallback until server restart
        setUsers([
          { id: 1, userName: 'admin', email: 'admin@abb.com', timestamp: '2025-12-05T10:30:00' },
          { id: 2, userName: 'operator1', email: 'op1@abb.com', timestamp: '2025-12-04T14:20:00' },
          { id: 3, userName: 'viewer', email: 'viewer@abb.com', timestamp: '2025-12-03T09:15:00' }
        ]);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      // Fallback data
      setUsers([
        { id: 1, userName: 'admin', email: 'admin@abb.com', timestamp: '2025-12-05T10:30:00' },
        { id: 2, userName: 'operator1', email: 'op1@abb.com', timestamp: '2025-12-04T14:20:00' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: number, username: string) => {
    const currentUser = sessionStorage.getItem('username');
    
    if (username === currentUser) {
      alert('Cannot delete your own account while logged in!');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete user: ${username}?`)) {
      try {
        const response = await fetch(`http://192.168.1.89:5500/api/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'current-user': sessionStorage.getItem('username') || ''
          }
        });
        const result = await response.json();
        
        if (result.data?.success) {
          alert('User deleted successfully');
          fetchUsers(); // Refresh the list
        } else {
          alert('Failed to delete user');
        }
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('Error deleting user');
      }
    }
  };

  // GET AUDIT TRAIL
  const fetchAuditData = async () => {
    setLoading(true);
    try {
      const req = await fetch("http://192.168.1.89:5500/api/audit");
      const response = await req.json();
      let data = response.data || [];
      
      // Filter by date range if dates are selected
      if (startDate && endDate) {
        data = data.filter((item: AuditTrail) => {
          const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
          return itemDate >= startDate && itemDate <= endDate;
        });
      }
      
      setAuditData(data);
    } catch (err) {
      console.error("Error fetching audit:", err);
    } finally {
      setLoading(false);
    }
  };

  function formatTimestampUTC(ts: string) {
      const date = new Date(ts);

      const day = String(date.getUTCDate()).padStart(2, "0");
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const year = date.getUTCFullYear();

      const hours = String(date.getUTCHours()).padStart(2, "0");
      const minutes = String(date.getUTCMinutes()).padStart(2, "0");
      const seconds = String(date.getUTCSeconds()).padStart(2, "0");

      return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    }

  return (
    <div className="billing-screen">
      <div className="billing-header">
        <div className="header-content">
          <div className="abb-logo">
            <div className="logo-circle">
              <span className="logo-text-circle">ABB</span>
            </div>
          </div>
          <h1>System Settings</h1>
          <p className="subtitle">ABB Smart Power Digital Solutions - Site Caesarea</p>
        </div>
      </div>

      <div className="billing-controls">
        <div className="control-group">
          <label>Management Type:</label>
          <button 
            className={`control-btn ${userManagement ? 'active' : ''}`}
            onClick={toggleUserManagement}
          >
            👤 User Management
          </button>
          <button 
            className={`control-btn ${auditTrail ? 'active' : ''}`}
            onClick={toggleAudit}
          >
            📋 Audit Trail
          </button>
        </div>
        
        {auditTrail && (
          <>
            <div className="control-group">
              <label>Start Date:</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: '0.8rem', border: '2px solid #e1e8ed', borderRadius: '8px' }}
              />
            </div>
            
            <div className="control-group">
              <label>End Date:</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: '0.8rem', border: '2px solid #e1e8ed', borderRadius: '8px' }}
              />
            </div>
            
            <div className="control-group">
              <button 
                className="control-btn" 
                onClick={fetchAuditData}
                disabled={loading}
              >
                {loading ? '⏳ Loading...' : '🔄 Update Data'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* USER MANAGEMENT SECTION */}
      {userManagement && (
        <div className="data-table-section">
          <div className="table-header">
            <h3>User Management</h3>
            <span className="table-info">Manage system users and permissions</span>
          </div>
          
          <div className="table-container">
            {users.length === 0 && !loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                <h3>No Users Found</h3>
                <p>No users available in the system</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.userName}</td>
                      <td>{user.email}</td>
                      <td className="timestamp-cell">{formatTimestampUTC(user.timestamp)}</td>
                      <td>
                        <button 
                          className="control-btn" 
                          onClick={() => deleteUser(user.id, user.userName)}
                          disabled={user.userName === sessionStorage.getItem('username')}
                          style={{ 
                            backgroundColor: user.userName === sessionStorage.getItem('username') ? '#ccc' : '#E31E24', 
                            padding: '0.5rem 1rem', 
                            fontSize: '12px',
                            cursor: user.userName === sessionStorage.getItem('username') ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {user.userName === sessionStorage.getItem('username') ? '🔒 Current User' : '🗑️ Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* AUDIT TRAIL */}
      {auditTrail && (
        <div className="data-table-section">
          <div className="table-header">
            <h3>Audit Trail</h3>
            <span className="table-info">Period: {startDate} to {endDate} | {auditData.length} records found</span>
          </div>
          
          <div className="table-container">
            {auditData.length === 0 && !loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                <h3>No Data Available</h3>
                <p>No audit records found for the selected date range</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Username</th>
                    <th>Action</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {auditData.map((row, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{row.userName}</td>
                      <td>
                        <span className="rate-badge standard">{row.type}</span>
                      </td>
                      <td className="timestamp-cell">
                        {formatTimestampUTC(row.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}



      {/* Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => {
          setShowPasswordModal(false);
          setPendingAction('');
          setAdminPassword('');
        }}>
          <div className="password-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Admin Authentication</h3>
              <button className="close-btn" onClick={() => {
                setShowPasswordModal(false);
                setPendingAction('');
                setAdminPassword('');
              }}>×</button>
            </div>
            <div className="auth-section">
              <p>Enter admin password to continue:</p>
              <input
                type="password"
                placeholder="Admin Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    if (adminPassword === 'AbbDp2025!') {
                      if (pendingAction === 'audit') {
                        setAuditTrail(true);
                        setUserManagement(false);
                        fetchAuditData();
                      } else if (pendingAction === 'users') {
                        setUserManagement(true);
                        setAuditTrail(false);
                        fetchUsers();
                      }
                      setShowPasswordModal(false);
                      setPendingAction('');
                      setAdminPassword('');
                    } else {
                      alert('Invalid admin password!');
                      setAdminPassword('');
                    }
                  }
                }}
                autoFocus
              />
              <div className="modal-actions">
                <button className="save-btn" onClick={() => {
                  if (adminPassword === 'AbbDp2025!') {
                    if (pendingAction === 'audit') {
                      setAuditTrail(true);
                      setUserManagement(false);
                      fetchAuditData();
                    } else if (pendingAction === 'users') {
                      setUserManagement(true);
                      setAuditTrail(false);
                      fetchUsers();
                    }
                    setShowPasswordModal(false);
                    setPendingAction('');
                    setAdminPassword('');
                  } else {
                    alert('Invalid admin password!');
                    setAdminPassword('');
                  }
                }}>Authenticate</button>
                <button className="cancel-btn" onClick={() => {
                  setShowPasswordModal(false);
                  setPendingAction('');
                  setAdminPassword('');
                }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

