// Initialize Lucide icons
if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}

// Helper functions
function getItem(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function setItem(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// Tab switching
function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));
  document.getElementById('tab-' + tabName).classList.add('active');
  event.target.closest('.nav-tab').classList.add('active');
  lucide.createIcons();
  loadTabData(tabName);
}

// Load tab data
function loadTabData(tabName) {
  switch(tabName) {
    case 'overview':
      loadStatistics();
      loadActivity();
      break;
    case 'voters':
      loadVoters();
      break;
    case 'audit':
      loadAuditTrail();
      break;
    case 'communications':
      loadCommunications();
      break;
    case 'security':
      loadSecurityData();
      break;
    case 'reports':
      loadReportsData();
      break;
  }
}

// Load statistics
function loadStatistics() {
  const users = getItem('LS_USERS', []);
  const votes = getItem('LS_VOTES', []);
  const candidates = getItem('LS_CANDIDATES', []);
  
  const totalVoters = users.length;
  const votedCount = users.filter(u => u.hasVoted).length;
  const turnout = totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(1) : 0;
  
  document.getElementById('stat-total-voters').textContent = totalVoters;
  document.getElementById('stat-voted').textContent = votedCount;
  document.getElementById('stat-turnout').textContent = turnout + '%';
  document.getElementById('stat-candidates').textContent = candidates.length;
}

// Log activity
function logActivity(action, icon = 'activity', details = {}) {
  const activityLog = getItem('LS_ACTIVITY_LOG', []);
  activityLog.push({
    action,
    icon,
    timestamp: Date.now(),
    user: 'Admin',
    ...details
  });
  setItem('LS_ACTIVITY_LOG', activityLog);
  return activityLog;
}

// Load activity log
function loadActivity() {
  const activityLog = getItem('LS_ACTIVITY_LOG', []);
  const container = document.getElementById('activity-log');
  
  if (activityLog.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #9aa4b2; padding: 2rem;">No recent activity</p>';
    return;
  }
  
  container.innerHTML = activityLog.slice(-10).reverse().map(activity => `
    <div class="activity-item">
      <div class="activity-icon">
        <i data-lucide="${activity.icon || 'activity'}"></i>
      </div>
      <div class="activity-content">
        <div class="activity-title">${activity.action}</div>
        <div class="activity-time">${new Date(activity.timestamp).toLocaleString()}</div>
      </div>
    </div>
  `).join('');
  
  lucide.createIcons();
}

// Refresh activity
function refreshActivity() {
  loadActivity();
  logActivity('Refreshed activity log', 'refresh-cw');
}

// Load voters table
function loadVoters() {
  const users = getItem('LS_USERS', []);
  const tbody = document.getElementById('voters-table-body');
  
  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #9aa4b2; padding: 2rem;">No registered voters</td></tr>';
    return;
  }
  
  tbody.innerHTML = users.map(user => `
    <tr>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${new Date(parseInt(user.id)).toLocaleDateString()}</td>
      <td>
        <span class="badge ${user.hasVoted ? 'badge-success' : 'badge-warning'}">
          <i data-lucide="${user.hasVoted ? 'check-circle' : 'clock'}"></i>
          ${user.hasVoted ? 'Voted' : 'Not Voted'}
        </span>
      </td>
      <td>
        <button class="btn-icon" onclick="viewVoterDetails('${user.id}')" title="View Details">
          <i data-lucide="eye"></i>
        </button>
      </td>
    </tr>
  `).join('');
  
  lucide.createIcons();
}

// Filter voters
function filterVoters() {
  const searchTerm = document.getElementById('voter-search').value.toLowerCase();
  const rows = document.querySelectorAll('#voters-table-body tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
}

// View voter details
function viewVoterDetails(userId) {
  const users = getItem('LS_USERS', []);
  const user = users.find(u => u.id === userId);
  if (user) {
    alert(`Voter Details:\n\nName: ${user.name}\nEmail: ${user.email}\nStatus: ${user.hasVoted ? 'Voted' : 'Not Voted'}\nRegistered: ${new Date(parseInt(user.id)).toLocaleString()}`);
    logActivity(`Viewed voter details for ${user.name}`, 'eye');
  }
}

// Export voters to CSV
function exportVoters() {
  const users = getItem('LS_USERS', []);
  let csv = 'Name,Email,Registration Date,Voting Status\n';
  users.forEach(user => {
    csv += `"${user.name}","${user.email}","${new Date(parseInt(user.id)).toLocaleDateString()}","${user.hasVoted ? 'Voted' : 'Not Voted'}"\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `voters_${Date.now()}.csv`;
  a.click();
  logActivity('Exported voter data to CSV', 'download');
}

// Load audit trail
function loadAuditTrail() {
  const activityLog = getItem('LS_ACTIVITY_LOG', []);
  const container = document.getElementById('audit-trail');
  
  if (activityLog.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #9aa4b2; padding: 2rem;">No audit logs available</p>';
    return;
  }
  
  container.innerHTML = activityLog.reverse().map((log, index) => `
    <div class="activity-item">
      <div class="activity-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
        <i data-lucide="${log.icon || 'file-text'}"></i>
      </div>
      <div class="activity-content">
        <div class="activity-title">#${activityLog.length - index} - ${log.action}</div>
        <div class="activity-time">User: ${log.user} | ${new Date(log.timestamp).toLocaleString()}</div>
      </div>
    </div>
  `).join('');
  
  lucide.createIcons();
}

// Export audit log
function exportAuditLog() {
  const activityLog = getItem('LS_ACTIVITY_LOG', []);
  let csv = 'ID,Action,User,Timestamp\n';
  activityLog.forEach((log, index) => {
    csv += `${index + 1},"${log.action}","${log.user}","${new Date(log.timestamp).toLocaleString()}"\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit_log_${Date.now()}.csv`;
  a.click();
  logActivity('Exported audit log', 'download');
}

// Load communications
function loadCommunications() {
  const comms = getItem('LS_COMMUNICATIONS', []);
  const container = document.getElementById('communications-log');
  
  if (comms.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #9aa4b2; padding: 2rem;">No communications sent yet</p>';
    return;
  }
  
  container.innerHTML = comms.reverse().map(comm => `
    <div class="activity-item">
      <div class="activity-icon" style="background: linear-gradient(135deg, #ec4899, #db2777);">
        <i data-lucide="mail"></i>
      </div>
      <div class="activity-content">
        <div class="activity-title">${comm.subject} (To: ${comm.recipients})</div>
        <div class="activity-time">${new Date(comm.timestamp).toLocaleString()}</div>
      </div>
    </div>
  `).join('');
  
  lucide.createIcons();
}

// Handle notification form
document.getElementById('notification-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const group = document.getElementById('recipient-group').value;
  const subject = document.getElementById('email-subject').value;
  const message = document.getElementById('email-message').value;
  
  const users = getItem('LS_USERS', []);
  let recipients = [];
  
  if (group === 'all') {
    recipients = users;
  } else if (group === 'voted') {
    recipients = users.filter(u => u.hasVoted);
  } else if (group === 'not-voted') {
    recipients = users.filter(u => !u.hasVoted);
  }
  
  // Save communication
  const comms = getItem('LS_COMMUNICATIONS', []);
  comms.push({
    subject,
    message,
    recipients: `${recipients.length} ${group} voters`,
    timestamp: Date.now()
  });
  setItem('LS_COMMUNICATIONS', comms);
  
  // Log activity
  logActivity(`Sent email to ${recipients.length} voters: "${subject}"`, 'send');
  
  // Reset form
  this.reset();
  
  alert(`✅ Email sent successfully to ${recipients.length} voters!`);
  loadCommunications();
});

// Load security data
function loadSecurityData() {
  const users = getItem('LS_USERS', []);
  const activityLog = getItem('LS_ACTIVITY_LOG', []);
  
  document.getElementById('stat-sessions').textContent = users.filter(u => u.hasVoted).length;
  document.getElementById('stat-failed').textContent = '0';
  document.getElementById('stat-ips').textContent = users.length;
  
  const container = document.getElementById('security-log');
  const securityLogs = activityLog.filter(log => log.action.includes('Login') || log.action.includes('Voted'));
  
  if (securityLogs.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #9aa4b2; padding: 2rem;">No security events logged</p>';
    return;
  }
  
  container.innerHTML = securityLogs.reverse().slice(0, 20).map(log => `
    <div class="activity-item">
      <div class="activity-icon" style="background: linear-gradient(135deg, #10b981, #06b6d4);">
        <i data-lucide="shield-check"></i>
      </div>
      <div class="activity-content">
        <div class="activity-title">${log.action}</div>
        <div class="activity-time">${new Date(log.timestamp).toLocaleString()}</div>
      </div>
    </div>
  `).join('');
  
  lucide.createIcons();
}

// Load reports data
function loadReportsData() {
  // Initialize charts or visualizations if needed
}

// Generate report
function generateReport(reportType) {
  let reportData = '';
  const timestamp = new Date().toLocaleString();
  
  switch(reportType) {
    case 'voters':
      const users = getItem('LS_USERS', []);
      reportData = `VOTER REGISTRATION REPORT\nGenerated: ${timestamp}\n\n`;
      reportData += `Total Registered Voters: ${users.length}\n`;
      reportData += `Voters Who Voted: ${users.filter(u => u.hasVoted).length}\n`;
      reportData += `Voters Who Haven't Voted: ${users.filter(u => !u.hasVoted).length}\n\n`;
      reportData += 'Detailed Voter List:\n';
      users.forEach((user, i) => {
        reportData += `${i+1}. ${user.name} (${user.email}) - ${user.hasVoted ? 'Voted' : 'Not Voted'}\n`;
      });
      break;
      
    case 'turnout':
      const allUsers = getItem('LS_USERS', []);
      const votedCount = allUsers.filter(u => u.hasVoted).length;
      const turnout = allUsers.length > 0 ? ((votedCount / allUsers.length) * 100).toFixed(2) : 0;
      reportData = `TURNOUT ANALYSIS REPORT\nGenerated: ${timestamp}\n\n`;
      reportData += `Total Eligible Voters: ${allUsers.length}\n`;
      reportData += `Total Votes Cast: ${votedCount}\n`;
      reportData += `Voter Turnout Rate: ${turnout}%\n`;
      break;
      
    case 'results':
      const candidates = getItem('LS_CANDIDATES', []);
      const votes = getItem('LS_VOTES', []);
      reportData = `ELECTION RESULTS REPORT\nGenerated: ${timestamp}\n\n`;
      reportData += `Total Votes Cast: ${votes.length}\n\n`;
      candidates.forEach(c => {
        const count = votes.filter(v => v.candidateId === c.id).length;
        reportData += `${c.name} (${c.party || 'Independent'}): ${count} votes\n`;
      });
      break;
      
    case 'audit':
      const auditLog = getItem('LS_ACTIVITY_LOG', []);
      reportData = `COMPLETE AUDIT REPORT\nGenerated: ${timestamp}\n\n`;
      reportData += `Total Audit Entries: ${auditLog.length}\n\n`;
      auditLog.forEach((log, i) => {
        reportData += `${i+1}. [${new Date(log.timestamp).toLocaleString()}] ${log.action} by ${log.user}\n`;
      });
      break;
  }
  
  const blob = new Blob([reportData], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${reportType}_report_${Date.now()}.txt`;
  a.click();
  
  logActivity(`Generated ${reportType} report`, 'file-text');
  alert('✅ Report generated and downloaded successfully!');
}

// Initialize dashboard
loadStatistics();
loadActivity();

// Log initial activity
if (getItem('LS_ACTIVITY_LOG', []).length === 0) {
  logActivity('Admin dashboard accessed', 'layout-dashboard');
}
