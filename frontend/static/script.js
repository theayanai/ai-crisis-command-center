const state = {
  scenarios: [],
  activeIncidentId: null,
};

function escapeText(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderScenarios() {
  const list = document.getElementById('scenario-list');

  list.innerHTML = state.scenarios
    .map((scenario) => {
      const activeClass = scenario.id === state.activeIncidentId ? 'is-active' : '';
      return `
        <button class="scenario-button ${activeClass}" data-incident-id="${scenario.id}">
          <strong>${escapeText(scenario.title)}</strong>
          <span>${escapeText(scenario.zone)} · ${escapeText(scenario.type)}</span>
        </button>
      `;
    })
    .join('');

  list.querySelectorAll('[data-incident-id]').forEach((button) => {
    button.addEventListener('click', () => loadOrchestration(button.dataset.incidentId));
  });
}

function renderResponse(response) {
  document.getElementById('incident-title').textContent = response.incident.title;
  document.getElementById('incident-meta').textContent = `${response.incident.type.toUpperCase()} · ${response.incident.zone} · Priority ${response.decision.priority}`;

  const alertPanel = document.getElementById('alert-panel');
  alertPanel.style.borderColor = response.decision.priority === 'critical' ? 'rgba(251, 113, 133, 0.5)' : 'rgba(110, 231, 255, 0.3)';

  document.getElementById('responder-list').innerHTML = response.assigned_staff.length
    ? response.assigned_staff
        .map(
          (staff) => `
            <div class="responder-card">
              <strong>${escapeText(staff.name)}</strong>
              <div>${escapeText(staff.role)} responder</div>
              <div>Nearest available staff · ${escapeText(staff.location.zone)}</div>
            </div>
          `,
        )
        .join('')
    : '<div class="responder-card">No matching available staff found.</div>';

  document.getElementById('route-panel').innerHTML = `
    <div class="route-box">
      <strong>${escapeText(response.route.name)}</strong>
      <ol>
        ${response.route.steps.map((step) => `<li>${escapeText(step)}</li>`).join('')}
      </ol>
    </div>
  `;

  document.getElementById('timeline-list').innerHTML = response.timeline
    .map(
      (entry) => `
        <div class="timeline-item">
          <span class="status-chip status-${escapeText(entry.status)}">${escapeText(entry.stage)}</span>
          <div>${escapeText(entry.detail)}</div>
        </div>
      `,
    )
    .join('');

  document.getElementById('explanation').textContent = response.explanation;
  document.getElementById('action-plan').innerHTML = response.action_plan
    .map(
      (step) => `
        <div class="action-item">
          ${escapeText(step)}
        </div>
      `,
    )
    .join('');
}

async function loadScenarios() {
  const response = await fetch('/api/incidents');
  const payload = await response.json();
  state.scenarios = payload.incidents || [];
  state.activeIncidentId = String(state.scenarios[0]?.id ?? '');
  renderScenarios();
  if (state.activeIncidentId) {
    await loadOrchestration(state.activeIncidentId);
  }
}

async function loadOrchestration(incidentId) {
  state.activeIncidentId = String(incidentId);
  renderScenarios();

  const response = await fetch(`/api/orchestrate/${incidentId}`);
  const payload = await response.json();
  renderResponse(payload);
}

loadScenarios().catch(() => {
  document.getElementById('scenario-list').innerHTML = '<div class="responder-card">Unable to load simulated incidents.</div>';
});