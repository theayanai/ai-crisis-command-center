const state = {
  scenarios: [],
  activeIncidentId: null,
  currentView: 'picker', // 'picker' or 'simulator'
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
  
  // Update main incident info
  document.getElementById('incident-title').textContent = response.incident.title;
  document.getElementById('incident-location').textContent = escapeText(response.incident.zone);
  const incidentType = response.signal_unification?.unified_incident_type || response.incident?.type || 'unknown';
  document.getElementById('incident-type').textContent = escapeText(incidentType);
  document.getElementById('severity-level').textContent = severity + '/10';
  document.getElementById('impact-level').textContent = escapeText(impact);
  
  // Update severity badge
  const badge = document.getElementById('severity-badge');
  badge.textContent = getSeverityLabel(severity);
  badge.className = 'badge ' + getSeverityBadgeClass(severity);

  // Update AI provider
  document.getElementById('ai-provider').textContent = (response.ai_orchestration?.provider || 'unknown').toUpperCase();

  // Update briefing
  const briefing = response.briefing || response.ai_orchestration?.reason || 'No briefing available.';
  document.getElementById('ai-briefing').textContent = briefing;

  // Update AI reason
  document.getElementById('ai-reason').textContent = response.ai_orchestration?.reason || 'Analyzing...';

  // Update broadcast status
  const broadcastBadge = document.querySelector('#broadcast-status');
  if (isBroadcast) {
    broadcastBadge.textContent = 'ON';
    broadcastBadge.className = 'badge broadcast-on';
  } else {
    broadcastBadge.textContent = 'OFF';
    broadcastBadge.className = 'badge broadcast-off';
  }

  // Update signal unification
  document.getElementById('fragmented-list').innerHTML = (response.signal_unification?.before || [])
    .map((entry) => `<div class="signal-item">${escapeText(entry)}</div>`)
    .join('') || '<div class="signal-item">—</div>';

  document.getElementById('unified-result').textContent = escapeText(response.signal_unification?.after || '—');

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
    html = `
      <div class="telemetry-entry">
        <div class="telemetry-head">[${timestamp}] ORCHESTRATION COMPLETE</div>
        <div class="telemetry-line telemetry-muted">incident: ${escapeText(data.incident.title)}</div>
        <div class="telemetry-line">severity: ${severity}/10 | impact: ${escapeText(impact)}</div>
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
