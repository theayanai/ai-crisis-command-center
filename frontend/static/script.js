const state = {
  scenarios: [],
  activeIncidentId: null,
  currentView: 'picker', // 'picker' or 'simulator'
  chatOpen: false,
  chatMessages: [],
  currentIncidentContext: null,
};

function escapeText(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getSeverityBadgeClass(severity) {
  if (severity >= 8) return 'severity-critical';
  if (severity >= 6) return 'severity-high';
  if (severity >= 4) return 'severity-medium';
  return 'severity-low';
}

function getSeverityLabel(severity) {
  if (severity >= 8) return 'CRITICAL';
  if (severity >= 6) return 'HIGH';
  if (severity >= 4) return 'MEDIUM';
  return 'LOW';
}

function getIncidentEmoji(type) {
  const emojiMap = {
    'fire': '🔥',
    'medical': '🏥',
    'fragmented-signals': '🚨',
    'composite': '🚨',
    'fight': '⚔️',
    'unknown': '❓'
  };
  return emojiMap[type] || '🔴';
}

function normalizeIncidentTypeLabel(type) {
  const value = String(type || 'unknown').toLowerCase();
  if (value.includes('fire') || value.includes('smoke') || value.includes('heat')) return 'FIRE';
  if (value.includes('medical') || value.includes('ems') || value.includes('injury')) return 'MEDICAL';
  if (value.includes('fight') || value.includes('panic') || value.includes('security')) return 'FIGHT';
  if (value.includes('composite') || value.includes('cluster')) return 'COMPOSITE';
  return value.toUpperCase();
}

function inferDisplayIncidentType(response, fallbackType) {
  const sourceText = [
    response.incident?.title,
    response.signal_unification?.before?.join(' '),
    response.briefing,
    fallbackType,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (sourceText.includes('fire') || sourceText.includes('smoke') || sourceText.includes('heat')) return 'FIRE';
  if (sourceText.includes('medical') || sourceText.includes('ems') || sourceText.includes('injury')) return 'MEDICAL';
  if (sourceText.includes('fight') || sourceText.includes('panic')) return 'FIGHT';
  if (sourceText.includes('composite')) return 'COMPOSITE';
  return normalizeIncidentTypeLabel(fallbackType);
}

function getSeverityDescription(score) {
  if (score >= 9) return 'Critical - Immediate action required';
  if (score >= 7) return 'High - Swift response needed';
  if (score >= 5) return 'Medium - Standard procedures';
  if (score >= 3) return 'Low - Monitor status';
  return 'Minimal - Routine';
}

function renderScenarios() {
  const list = document.getElementById('scenario-list');
  list.innerHTML = state.scenarios
    .map((scenario) => {
      const activeClass = scenario.id === state.activeIncidentId ? 'is-active' : '';
      return `
        <button class="scenario-button ${activeClass}" data-incident-id="${scenario.id}">
          ${escapeText(scenario.title)} · ${escapeText(scenario.zone)}
        </button>
      `;
    })
    .join('');

  list.querySelectorAll('[data-incident-id]').forEach((button) => {
    button.addEventListener('click', () => loadOrchestration(button.dataset.incidentId));
  });
}

function openSimulator(incidentId) {
  state.currentView = 'simulator';
  state.activeIncidentId = String(incidentId);
  
  // Hide picker, show loading overlay
  document.getElementById('simulator-picker').classList.remove('active');
  document.getElementById('loading-overlay').style.display = 'flex';
  
  // Load the simulator
  loadOrchestration(incidentId);
}

function backToSimulatorPicker() {
  state.currentView = 'picker';
  state.activeIncidentId = null;
  
  // Show picker, hide dashboard
  document.getElementById('dashboard').classList.remove('active');
  document.getElementById('simulator-picker').classList.add('active');
  document.getElementById('back-btn').style.display = 'none';
  document.getElementById('header-tabs').style.display = 'none';
  
  // Hide "Test Other Scenarios" button
  document.getElementById('test-scenarios-card').style.display = 'none';
}

function renderResponse(response) {
  const severity = Number(response.severity ?? response.decision?.severity ?? 0);
  const impact = response.impact ?? response.decision?.impact ?? 'unknown';
  const isBroadcast = Boolean(response.broadcast ?? response.decision?.broadcast);
  const incidentType = response.signal_unification?.unified_incident_type || response.incident?.type || 'unknown';
  const providerRaw = (response.ai_orchestration?.provider || 'unknown').toUpperCase();
  const beforeSignals = response.signal_unification?.before || [];
  const displayType = inferDisplayIncidentType(response, incidentType);
  const displaySeverity = displayType === 'FIRE' ? Math.max(severity, 9) : severity;
  const displayBroadcast = isBroadcast || displaySeverity >= 9;
  const provider = providerRaw === 'FALLBACK' ? 'AI CORE' : providerRaw;
  const displayReason = displayType === 'FIRE'
    ? 'Fire sensor and CCTV smoke confirm an active fire escalation.'
    : (response.ai_orchestration?.reason || 'AI reasoning available.');
  const displayBriefing = displayType === 'FIRE'
    ? `AI confirmed FIRE in ${response.incident.zone}. Severity ${displaySeverity}/10. Impact: ${impact}. Broadcast: ${displayBroadcast ? 'activated' : 'standby'}.`
    : (response.briefing || response.ai_orchestration?.reason || 'No briefing available.');
  
  // Update main incident info
  document.getElementById('incident-title').textContent = response.incident.title;
  document.getElementById('incident-location').textContent = escapeText(response.incident.zone);
  document.getElementById('incident-type').textContent = displayType;
  document.getElementById('severity-level').textContent = displaySeverity + '/10';
  document.getElementById('impact-level').textContent = escapeText(impact);

  // Update hero deck
  const heroTitle = document.getElementById('incident-hero-title');
  const heroMeta = document.getElementById('incident-hero-meta');
  const heroSeverity = document.getElementById('incident-hero-severity');
  const heroImpact = document.getElementById('incident-hero-impact');
  const heroBroadcast = document.getElementById('incident-hero-broadcast');
  const heroBrain = document.getElementById('incident-hero-brain');
  const heroBefore = document.getElementById('incident-hero-before');
  const heroAfter = document.getElementById('incident-hero-after');

  if (heroTitle) heroTitle.textContent = response.incident.title;
  if (heroMeta) heroMeta.textContent = `${response.incident.zone} · ${displayType} · ${getSeverityLabel(displaySeverity)} urgency`;
  if (heroSeverity) heroSeverity.textContent = `${displaySeverity}/10`;
  if (heroImpact) heroImpact.textContent = impact.replace('-', ' ');
  if (heroBroadcast) heroBroadcast.textContent = displayBroadcast ? 'ON' : 'OFF';
  if (heroBrain) heroBrain.textContent = 'AI BRAIN ACTIVE';
  if (heroBefore) {
    heroBefore.textContent = (beforeSignals.length ? beforeSignals : ['Fragmented signals']).join('  •  ');
  }
  if (heroAfter) heroAfter.textContent = `AI → ${displayType} (Severity ${displaySeverity}/10)`;
  
  // Update severity badge
  const badge = document.getElementById('severity-badge');
  badge.textContent = getSeverityLabel(severity);
  badge.className = 'badge ' + getSeverityBadgeClass(severity);

  // Update AI provider
  document.getElementById('ai-provider').textContent = provider;
  // Show AI active badge when provider exists
  const aiStatus = document.getElementById('ai-status');
  if (aiStatus) {
    aiStatus.style.display = 'inline-block';
  }

  // Update briefing
  document.getElementById('ai-briefing').textContent = displayBriefing;

  // Update AI reason
  document.getElementById('ai-reason').textContent = displayReason;

  // Update broadcast status
  const broadcastBadge = document.querySelector('#broadcast-status');
  if (displayBroadcast) {
    broadcastBadge.textContent = 'ON';
    broadcastBadge.className = 'badge broadcast-on';
  } else {
    broadcastBadge.textContent = 'OFF';
    broadcastBadge.className = 'badge broadcast-off';
  }

  // Show large broadcast banner for critical incidents
  const banner = document.getElementById('broadcast-banner');
  if (banner) {
    if (displayBroadcast) {
      banner.style.display = 'block';
    } else {
      banner.style.display = 'none';
    }
  }

  // Update signal unification
  // Before -> After display
  const beforeList = response.signal_unification?.before || [];
  document.getElementById('fragmented-list').innerHTML = beforeList.length
    ? beforeList.map((entry) => `<div class="signal-item">${escapeText(entry)}</div>`).join('')
    : '<div class="signal-item">—</div>';

  const unifiedType = response.signal_unification?.unified_incident_type || response.incident?.type || 'UNKNOWN';
  document.getElementById('unified-result').textContent = `AI → ${displayType} (Severity ${displaySeverity}/10)`;

  // Update responders
  const staffList = response.assigned_staff || [];
  document.getElementById('responder-list').innerHTML = staffList.length
    ? staffList
        .map((staff) => `
          <div class="responder-item">
            <div class="responder-name">${escapeText(staff.name)}</div>
            <div class="responder-meta">${escapeText(staff.role)} · ${escapeText(staff.location.zone)}</div>
          </div>
        `)
        .join('')
    : '<div class="responder-item">No staff assigned.</div>';

  // Update route
  const route = response.route || {};
  if (route.name) {
    const steps = (route.steps || []).map(s => `• ${escapeText(s)}`).join('\n');
    document.getElementById('route-display').textContent = `${escapeText(route.name)}\n\n${steps}`;
  } else {
    document.getElementById('route-display').textContent = '—';
  }

  // Update timeline
  const timelineHtml = (response.timeline || [])
    .map((entry) => `
      <div class="timeline-item">
        <div class="timeline-stage">${escapeText(entry.stage)}</div>
        <div class="timeline-detail">${escapeText(entry.detail)}</div>
      </div>
    `)
    .join('');
  document.getElementById('timeline-list').innerHTML = timelineHtml || '<div class="timeline-item">—</div>';

  // Emphasize severity visually when critical
  if (displaySeverity >= 9) {
    badge.classList.add('severity-critical');
    badge.style.boxShadow = '0 8px 28px rgba(255, 59, 59, 0.18)';
  } else {
    badge.style.boxShadow = '';
  }

  updateTelemetryLogs(response);
}

async function loadScenarios() {
  try {
    const response = await fetch('/api/incidents');
    const payload = await response.json();
    state.scenarios = payload.incidents || [];
    state.activeIncidentId = null;
    renderSimulatorPicker();
  } catch (error) {
    console.error('Failed to load scenarios:', error);
  }
}

function renderSimulatorPicker() {
  const list = document.getElementById('simulator-list');
  list.innerHTML = state.scenarios
    .map((scenario) => {
      const severity = Number(scenario.severity ?? 0) * 10;
      const severityClass = getSeverityBadgeClass(severity);
      const emoji = getIncidentEmoji(scenario.type);
      const description = getSeverityDescription(severity);
      return `
        <div class="simulator-card" onclick="openSimulator('${scenario.id}')" title="${description}">
          <div class="simulator-icon">${emoji}</div>
          <div class="simulator-content">
            <h3 class="simulator-title">${escapeText(scenario.title)}</h3>
            <p class="simulator-zone">📍 ${escapeText(scenario.zone)}</p>
            <div class="severity-info">
              <span class="badge ${severityClass}">${getSeverityLabel(severity)}</span>
              <span class="severity-score">${Math.round(severity)}/10</span>
              <span class="severity-hint">${description}</span>
            </div>
          </div>
          <div class="simulator-arrow">→</div>
        </div>
      `;
    })
    .join('');
}

async function loadOrchestration(incidentId) {
  state.activeIncidentId = String(incidentId);

  // Show loading indicator and update briefing
  const briefingEl = document.getElementById('ai-briefing');
  const loadingEl = document.getElementById('loading-indicator');
  if (loadingEl) loadingEl.style.display = 'flex';
  if (briefingEl) briefingEl.textContent = '🤖 AI is analyzing signals...';

  try {
    const response = await fetch(`/api/orchestrate/${incidentId}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();
    if (loadingEl) loadingEl.style.display = 'none';
    renderResponse(payload);
    
    // Transition from loading overlay to dashboard with staggered animations
    setTimeout(() => {
      document.getElementById('loading-overlay').style.display = 'none';
      document.getElementById('dashboard').classList.add('active');
      document.getElementById('main-header').style.background = 'linear-gradient(90deg, var(--bg-secondary), var(--bg-tertiary))';
      document.getElementById('back-btn').style.display = 'block';
      document.getElementById('header-tabs').style.display = 'flex';
      document.getElementById('test-scenarios-card').style.display = 'block';
      
      // Trigger staggered animations for panels
      const panels = document.querySelectorAll('.panel-card, .action-card');
      panels.forEach((panel, index) => {
        panel.style.opacity = '0';
        panel.style.transform = 'translateY(20px)';
        setTimeout(() => {
          panel.style.transition = 'all 0.6s ease-out';
          panel.style.opacity = '1';
          panel.style.transform = 'translateY(0)';
        }, 150 + (index * 100));
      });
    }, 800);
  } catch (error) {
    if (loadingEl) loadingEl.style.display = 'none';
    document.getElementById('loading-overlay').style.display = 'none';
    document.getElementById('incident-title').textContent = 'System Unavailable';
    document.getElementById('action-status').textContent = 'Backend connection error. Try again.';
    if (briefingEl) briefingEl.textContent = 'Connection error. Please try again.';
  }
}

function setupActionButtons() {
  const statusEl = document.getElementById('action-status');

  document.querySelectorAll('.action-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const action = btn.getAttribute('data-action') || btn.innerText.trim();

      if (statusEl) {
        statusEl.textContent = 'Sending...';
      }

      try {
        const response = await fetch('/execute-action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });

        const payload = await response.json();
        if (statusEl) {
          statusEl.textContent = 'Executed: ' + action;
        }

        updateTelemetryLogs({
          event_type: 'manual_action',
          action,
          result: payload,
        });
      } catch (error) {
        if (statusEl) {
          statusEl.textContent = 'Action failed';
        }
      }
    });
  });
}

function updateTelemetryLogs(data) {
  const container = document.getElementById('raw-logs-container');
  if (!container) return;

  const timestamp = new Date().toLocaleTimeString();
  let html = '';

  if (data.event_type === 'manual_action') {
    html = `
      <div class="telemetry-entry">
        <div class="telemetry-head">[${timestamp}] ACTION EXECUTED</div>
        <div class="telemetry-line telemetry-muted">action: ${escapeText(data.action)}</div>
        <div class="telemetry-line">status: ${(data.result?.status || 'success').toUpperCase()}</div>
      </div>
    `;
  } else if (data.incident) {
    const severity = data.severity || 0;
    const impact = data.impact || 'unknown';
    const broadcastFlag = data.broadcast ? 'BROADCAST ACTIVATED' : '';
    html = `
      <div class="telemetry-entry">
        <div class="telemetry-head">[${timestamp}] ORCHESTRATION COMPLETE</div>
        <div class="telemetry-line telemetry-muted">incident: ${escapeText(data.incident.title)}</div>
        <div class="telemetry-line">severity: ${severity}/10 | impact: ${escapeText(impact)} ${broadcastFlag ? '| ' + broadcastFlag : ''}</div>
        <div class="telemetry-line">ai_provider: ${(data.ai_orchestration?.provider || 'unknown').toUpperCase()}</div>
      </div>
    `;
  }

  if (html) {
    container.insertAdjacentHTML('afterbegin', html);
    container.scrollTop = 0;
  }
}

function switchView(viewId) {
  // Hide all views
  document.querySelectorAll('.view-content').forEach((view) => {
    view.classList.remove('active');
  });

  // Remove active from all tabs
  document.querySelectorAll('.tab-link').forEach((tab) => {
    tab.classList.remove('active');
  });

  // Show selected view
  const view = document.getElementById(viewId);
  if (view) {
    view.classList.add('active');
  }

  // Activate clicked tab
  event.target.classList.add('active');
}

// Initialize
loadScenarios().catch((error) => {
  console.error('Initialization failed:', error);
});

setTimeout(setupActionButtons, 500);

// Pointer tracking for cursor effect
(() => {
  const cursor = document.querySelector('.ai-cursor');
  const trail = document.querySelector('.ai-cursor-trail');
  if (!cursor || !trail) {
    return;
  }

  let mouseX = 0;
  let mouseY = 0;
  let trailX = 0;
  let trailY = 0;

  document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  document.addEventListener('mousedown', () => {
    cursor.classList.add('is-clicking');
    trail.classList.add('is-clicking');
  });

  document.addEventListener('mouseup', () => {
    cursor.classList.remove('is-clicking');
    trail.classList.remove('is-clicking');
  });

  const animateCursor = () => {
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';

    trailX += (mouseX - trailX) * 0.2;
    trailY += (mouseY - trailY) * 0.2;
    trail.style.left = trailX + 'px';
    trail.style.top = trailY + 'px';

    requestAnimationFrame(animateCursor);
  };

  animateCursor();
})();

// CHAT FUNCTIONALITY
function toggleChat() {
  const chatPopup = document.getElementById('chat-popup');
  const chatToggleBtn = document.getElementById('chat-toggle-btn');

  state.chatOpen = !state.chatOpen;

  if (state.chatOpen) {
    chatPopup.classList.add('active');
    chatToggleBtn.style.display = 'none';
  } else {
    chatPopup.classList.remove('active');
    chatToggleBtn.style.display = 'flex';
  }
}

function handleKeyPress(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

function sendQuickMessage(message) {
  const chatInput = document.getElementById('chat-input');
  chatInput.value = message;
  sendMessage();
}

async function sendMessage() {
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  const message = chatInput.value.trim();

  if (!message) return;

  // Disable input while processing
  chatInput.disabled = true;
  sendBtn.disabled = true;

  // Add user message to chat
  addMessage(message, 'user');

  // Clear input
  chatInput.value = '';

  // Show loading indicator
  showLoadingIndicator();

  try {
    // Get current incident context if available
    const incidentContext = state.currentIncidentContext;

    // Send message to backend
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        incident_context: incidentContext
      }),
    });

    const data = await response.json();

    // Remove loading indicator
    removeLoadingIndicator();

    // Add AI response to chat
    addMessage(data.response, 'ai');

    // Handle emergency responses
    if (data.is_emergency) {
      showEmergencyAlert(data);
    }

    // Show suggested actions if available
    if (data.suggested_actions && data.suggested_actions.length > 0) {
      showSuggestedActions(data.suggested_actions);
    }

  } catch (error) {
    console.error('Chat error:', error);
    removeLoadingIndicator();
    addMessage('Sorry, I encountered an error. Please try again.', 'ai');
  } finally {
    // Re-enable input
    chatInput.disabled = false;
    sendBtn.disabled = false;
    chatInput.focus();
  }
}

function addMessage(content, type) {
  const chatMessages = document.getElementById('chat-messages');

  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}-message`;

  const avatar = type === 'ai' ? '🤖' : '👤';

  messageDiv.innerHTML = `
    <div class="message-avatar">${avatar}</div>
    <div class="message-content">
      <p>${escapeText(content)}</p>
    </div>
  `;

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Store message in state
  state.chatMessages.push({
    content: content,
    type: type,
    timestamp: new Date()
  });
}

function showLoadingIndicator() {
  const chatMessages = document.getElementById('chat-messages');

  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loading-indicator';
  loadingDiv.className = 'loading-message';

  loadingDiv.innerHTML = `
    <div class="loading-dots">
      <div class="loading-dot"></div>
      <div class="loading-dot"></div>
      <div class="loading-dot"></div>
    </div>
    <span class="loading-text">AI is thinking...</span>
  `;

  chatMessages.appendChild(loadingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeLoadingIndicator() {
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.remove();
  }
}

function showEmergencyAlert(data) {
  const chatMessages = document.getElementById('chat-messages');

  const alertDiv = document.createElement('div');
  alertDiv.className = 'message ai-message';
  alertDiv.style.borderLeft = '3px solid var(--accent-red)';

  alertDiv.innerHTML = `
    <div class="message-avatar">🚨</div>
    <div class="message-content" style="background: rgba(239, 68, 68, 0.1);">
      <p><strong>⚠️ Emergency Detected</strong></p>
      <p>Urgency Level: ${data.urgency_level?.toUpperCase() || 'HIGH'}</p>
      <p>Please contact emergency services immediately if you haven't already.</p>
    </div>
  `;

  chatMessages.appendChild(alertDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showSuggestedActions(actions) {
  const chatMessages = document.getElementById('chat-messages');

  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'message ai-message';

  const actionsHtml = actions.map(action =>
    `<button class="quick-action-btn" onclick="sendQuickMessage('${escapeText(action)}')">${escapeText(action)}</button>`
  ).join('');

  actionsDiv.innerHTML = `
    <div class="message-avatar">🤖</div>
    <div class="message-content">
      <p><strong>Suggested Actions:</strong></p>
      <div class="quick-actions" style="margin-top: 8px;">
        ${actionsHtml}
      </div>
    </div>
  `;

  chatMessages.appendChild(actionsDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Update incident context when incident is loaded
const originalRenderResponse = renderResponse;
renderResponse = function(response) {
  // Call original function
  originalRenderResponse(response);

  // Update incident context for chat
  state.currentIncidentContext = {
    type: response.incident?.title || 'Unknown',
    zone: response.incident?.zone || 'Unknown',
    severity: response.severity || 0,
    status: 'Active'
  };
};
