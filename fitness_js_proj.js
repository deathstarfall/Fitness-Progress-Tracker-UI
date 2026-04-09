//   DATE
const now = new Date();
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
document.getElementById('topbarDate').textContent =
  `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

//   DEFAULT DATA  
let stepsData = [300,180,60,250,80,3500,1200,600,400,800,950,1200,300,80,850,950,120];
let distData  = [280,160,50,220,70,3200,1100,560,380,750,900,1150,280,75,800,900,110];
let calorieData = [80,60,30,90,50,900,700,450,350,600,750,1000,280,60,700,800,100];
let walkData = [15, 0, 30, 45, 20, 60, 0]; // Weekly walking minutes
let elevData = [0, 5, 12, 8, 0, 25, 3]; // Weekly elevation meters
let TOTAL_STEPS = stepsData.reduce((a,b)=>a+b,0);
let STEP_GOAL   = 10000;
let MOVE_GOAL   = 150;
let USER_DATA   = {};

const stepTimeLabels = ['12 AM','1 AM','2 AM','3 AM','4 AM','5 AM','6 AM',
  '7 AM','8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM'];

//  ONBOARDING LOGIC
let obCurrentStep = 0;
const obSteps = [
  document.getElementById('obStep0'),
  document.getElementById('obStep1'),
  document.getElementById('obStep2')
];
const obDots = [
  document.getElementById('obDot0'),
  document.getElementById('obDot1'),
  document.getElementById('obDot2')
];

function obGoTo(step) {
  obSteps.forEach((s,i) => {
	s.classList.toggle('active', i === step);
  });
  obDots.forEach((d,i) => {
	d.classList.toggle('active', i === step);
	d.classList.toggle('done', i < step);
  });
  obCurrentStep = step;
}

// Radio button 
document.querySelectorAll('.ob-radio-group').forEach(group => {
  group.querySelectorAll('.ob-radio-btn').forEach(btn => {
	btn.addEventListener('click', () => {
	  group.querySelectorAll('.ob-radio-btn').forEach(b => b.classList.remove('selected'));
	  btn.classList.add('selected');
	});
  });
});

document.getElementById('obNext0').addEventListener('click', () => obGoTo(1));
document.getElementById('obBack1').addEventListener('click', () => obGoTo(0));
document.getElementById('obNext1').addEventListener('click', () => obGoTo(2));
document.getElementById('obBack2').addEventListener('click', () => obGoTo(1));

//   AUTO-CALCULATE 
function autoCalcFromSteps() {
  const stepsEl   = document.getElementById('ob_steps');
  const distEl    = document.getElementById('ob_distance');
  const calEl     = document.getElementById('ob_caloriesBurned');
  const minEl     = document.getElementById('ob_activeMin');
  const weightEl  = document.getElementById('ob_weight');

  const steps  = parseInt(stepsEl.value) || 0;
  if (steps <= 0) return;

  const weight = parseFloat(weightEl.value) || 74;
  const dist   = +(steps * 0.000762).toFixed(2);
  const durationMin = Math.round(steps / 100);
  const calories = Math.round(3.5 * weight * (durationMin / 60));

  // Only auto-fill 
  if (!distEl.dataset.userEdited) distEl.value = dist;
  if (!calEl.dataset.userEdited)  calEl.value  = calories;
  if (!minEl.dataset.userEdited)  minEl.value  = durationMin;
}

document.getElementById('ob_steps').addEventListener('input', autoCalcFromSteps);

['ob_distance','ob_caloriesBurned','ob_activeMin'].forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener('input', () => { el.dataset.userEdited = '1'; });
});

// Re-run calc 
document.getElementById('ob_weight').addEventListener('input', autoCalcFromSteps);

document.getElementById('obFinish').addEventListener('click', () => {
  collectAndApply();
  document.getElementById('onboardingOverlay').classList.add('hidden');
});

function getRadioVal(groupId) {
  const selected = document.querySelector(`#${groupId} .ob-radio-btn.selected`);
  return selected ? selected.dataset.val : '';
}

function collectAndApply() {
  //   Collect  
  const firstName    = document.getElementById('ob_firstName').value.trim() || 'Balraj';
  const lastName     = document.getElementById('ob_lastName').value.trim() || 'Singh';
  const age          = parseInt(document.getElementById('ob_age').value) || 28;
  const weight       = parseFloat(document.getElementById('ob_weight').value) || 74;
  const height       = parseFloat(document.getElementById('ob_height').value) || 178;
  const gender       = document.getElementById('ob_gender').value || 'male';
  const inputSteps   = parseInt(document.getElementById('ob_steps').value) || 8266;
  const inputDist    = parseFloat(document.getElementById('ob_distance').value) || +(inputSteps * 0.000762).toFixed(2);
  const activeMin    = parseInt(document.getElementById('ob_activeMin').value) || 45;
  const inputCalBurned = parseInt(document.getElementById('ob_caloriesBurned').value) || Math.round(inputSteps * weight * 0.0005);
  const elevation    = parseInt(document.getElementById('ob_elevation').value) || 0;
  const activityType = getRadioVal('ob_activityType') || 'walking';
  const stepGoal     = parseInt(document.getElementById('ob_stepGoal').value) || 10000;
  const moveGoal     = parseInt(document.getElementById('ob_moveGoal').value) || 150;
  const fitnessLevel = getRadioVal('ob_fitnessLevel') || 'beginner';

  USER_DATA = { firstName, lastName, age, weight, height, gender, inputSteps, inputDist,
	activeMin, inputCalBurned, elevation, activityType, stepGoal, moveGoal, fitnessLevel };

  const scaleFactor = inputSteps / TOTAL_STEPS;
  stepsData   = stepsData.map(v => Math.round(v * scaleFactor));
  distData    = distData.map(v  => Math.round(v * scaleFactor));
  calorieData = calorieData.map(v=> Math.round(v * scaleFactor));
  TOTAL_STEPS = stepsData.reduce((a,b)=>a+b,0);

  // Scale walkData and elevData 
  const walkScale = activeMin / walkData.reduce((a,b)=>a+b,0);
  walkData = walkData.map(v => Math.round(v * walkScale));
  const elevScale = elevation > 0 ? elevation / elevData.reduce((a,b)=>a+b,0) : 0;
  elevData = elevData.map(v => Math.round(v * elevScale));
  STEP_GOAL   = stepGoal;
  MOVE_GOAL   = moveGoal;

  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  const movePct  = Math.round((inputCalBurned / moveGoal) * 100);
  LIVE_MOVE_PCT  = movePct;  // keep global in sync
  const totalDist = inputDist > 0 ? inputDist : +(inputSteps * 0.000762).toFixed(2);

  //   Activity Level  
  let level, levelColor, levelBg;
  if (inputSteps < 2500)       { level='Sedentary';       levelColor='#888';     levelBg='rgba(136,136,136,.15)'; }
  else if (inputSteps < 5000)  { level='Lightly Active';  levelColor='#FFD60A';  levelBg='rgba(255,214,10,.15)'; }
  else if (inputSteps < 7500)  { level='Moderately Active'; levelColor='#00D2FF'; levelBg='rgba(0,210,255,.15)'; }
  else if (inputSteps < 10000) { level='Active';          levelColor='#A65EFD';  levelBg='rgba(166,94,253,.15)'; }
  else if (inputSteps < 12500) { level='Very Active';     levelColor='#30D158';  levelBg='rgba(48,209,88,.15)'; }
  else                         { level='Elite';           levelColor='#FF004F';  levelBg='rgba(255,0,79,.15)'; }

  // Show activity level banner
  const banner = document.getElementById('activityLevelBanner');
  banner.classList.add('show');
  document.getElementById('alDot').style.background = levelColor;
  document.getElementById('alDot').style.boxShadow = `0 0 6px ${levelColor}`;
  document.getElementById('alLabel').textContent = 'Activity Level';
  const badge = document.getElementById('alBadge');
  badge.textContent = level;
  badge.style.background = levelBg;
  badge.style.color = levelColor;

  document.getElementById('topChipSteps').textContent = `${inputSteps.toLocaleString()} Steps`;
  document.getElementById('topChipGoal').textContent = movePct >= 100 ? 'Move Goal Crushed 🎯' : `Move: ${movePct}% of goal`;

  document.querySelector('.profile-name').textContent = fullName;
  document.querySelector('.profile-sub').textContent  = `Goal: ${moveGoal} KCAL`;

  document.getElementById('modalAvatarName').textContent = fullName;
  document.getElementById('modalAvatarSub').textContent  = `Goal: ${moveGoal} KCAL · Pro Member`;

  document.getElementById('fieldFirstName').value = firstName;
  document.getElementById('fieldLastName').value  = lastName;
  document.getElementById('fieldAge').value       = age;
  document.getElementById('fieldWeight').value    = weight;
  document.getElementById('fieldHeight').value    = height;
  document.getElementById('fieldGender').value    = gender;
  document.getElementById('fieldStepGoal').value  = stepGoal;
  document.getElementById('fieldMoveGoal').value  = moveGoal;

  document.querySelector('.ring-stat-val.c-move').innerHTML =
	`${inputCalBurned}<span class="unit">/${moveGoal} KCAL</span>`;
  // Total active & goal progress
  const ringStats = document.querySelectorAll('.ring-stat');
  if (ringStats[1]) {
	ringStats[1].querySelector('.ring-stat-val').innerHTML =
	  `${inputCalBurned.toLocaleString()}<span class="unit"> KCAL</span>`;
  }
  if (ringStats[2]) {
	ringStats[2].querySelector('.ring-stat-val').textContent = `${movePct}%`;
	ringStats[2].querySelector('.ring-stat-val').style.color = levelColor;
  }

  document.querySelector('.stat-val.c-distance').innerHTML =
	`${totalDist.toFixed(2)}<span class="u">KM</span>`;
  
  // Calculate and update walking time and elevation
  const totalWalkMin = walkData.reduce((a,b)=>a+b,0);
  const totalElev = elevData.reduce((a,b)=>a+b,0);
  
  document.querySelector('.stat-val.c-walking').innerHTML =
	`${totalWalkMin}<span class="u">M</span>`;
  document.querySelector('.stat-val.c-elev').innerHTML =
	`${totalElev}<span class="u">M</span>`;

  //   Big chart   
  document.querySelector('.chart-total').innerHTML =
	`${inputSteps.toLocaleString()} <span>steps</span>`;

  //   Y-axis labels  
  const maxStep = Math.max(...stepsData);
  const yTop = Math.ceil(maxStep / 1000) * 1000;
  document.querySelectorAll('.y-labels span')[0].textContent = (yTop).toLocaleString();
  document.querySelectorAll('.y-labels span')[1].textContent = (yTop/2).toLocaleString();

  //   Activity ring 
  setTimeout(() => {
	const calFraction = Math.min(movePct / 100, 1);
	const dasharray = 440;
	const offset = dasharray - calFraction * dasharray;
	document.getElementById('mainRing').style.strokeDashoffset = offset;
	document.querySelector('.ring-center-pct').textContent = movePct + '%';
	document.getElementById('moveFill').style.width = `${Math.min(movePct, 100)}%`;
  }, 350);

  //   Rebuild mini-bar charts   
  ['distSmall','walkSmall','elevSmall'].forEach(id => {
	const el = document.getElementById(id);
	if (el) el.querySelectorAll('.mb').forEach(b=>b.remove());
  });
  buildSmallBars('distSmall', distData, 'distance-clr');
  buildSmallBars('walkSmall', walkData, 'walking-clr');
  buildSmallBars('elevSmall', elevData, 'elev-clr');

  //   Rebuild big chart  
  const bigChart = document.getElementById('mainBigChart');
  bigChart.querySelectorAll('.big-bar').forEach(b=>b.remove());
  const tooltip    = document.getElementById('barTooltip');
  const tooltipVal = document.getElementById('barTooltipVal');
  const bMx = Math.max(...stepsData);
  const yLabels = bigChart.querySelector('.y-labels');

  stepsData.forEach((v,i) => {
	const b = document.createElement('div');
	b.className = 'big-bar steps-clr';
	b.style.height = `${Math.max((v/bMx)*100, 2)}%`;
	b.style.transitionDelay = `${.6 + i*.03}s`;
	b.style.cursor = 'crosshair';
	b.addEventListener('mouseenter', () => {
	  tooltipVal.textContent = v.toLocaleString() + ' steps';
	  tooltip.querySelector('.tip-label').textContent = stepTimeLabels[i] || `Hour ${i}`;
	  tooltip.classList.add('visible');
	});
	b.addEventListener('mousemove', e => {
	  tooltip.style.left = (e.clientX + 12) + 'px';
	  tooltip.style.top  = (e.clientY - 40) + 'px';
	});
	b.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
	bigChart.insertBefore(b, yLabels);
  });
  requestAnimationFrame(() => setTimeout(() =>
	bigChart.querySelectorAll('.big-bar').forEach(b=>b.classList.add('animated')), 150));

  //   Distance panel  
  document.querySelector('.panel-total-val.c-distance').innerHTML =
	`${totalDist.toFixed(2)}<span style="font-size:24px;letter-spacing:0"> KM</span>`;

  //   Activity panel stats  
  const actMoveEl = document.getElementById('actPanelMoveKcal');
  const actTotalEl = document.getElementById('actPanelTotalKcal');
  const actGoalEl  = document.getElementById('actPanelGoalPct');
  const actBigEl   = document.getElementById('actPanelTotalBig');
  if (actMoveEl)  actMoveEl.textContent  = inputCalBurned.toLocaleString();
  if (actTotalEl) actTotalEl.textContent = inputCalBurned.toLocaleString();
  if (actGoalEl)  { actGoalEl.textContent = `${movePct}%`; actGoalEl.style.color = '#FF9F0A'; }
  if (actBigEl)   actBigEl.innerHTML = `${inputCalBurned.toLocaleString()}<span style="font-size:22px;letter-spacing:0"> KCAL</span>`;

  //   Steps panel  
  const stepsPT = document.getElementById('stepsPanelTotal');
  if (stepsPT) stepsPT.textContent = inputSteps.toLocaleString();

  //   Show toast  
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

//   SIDEBAR NAVIGATION  
const navLinks = document.querySelectorAll('.nav-link[data-view]');
const viewPages = document.querySelectorAll('.view-page');
const topbarTitle = document.getElementById('topbarTitle');

const viewTitles = {
  summary: 'Summary', activity: 'Activity', workouts: 'Workouts',
  heartrate: 'Heart Rate', sleep: 'Sleep', history: 'History'
};

navLinks.forEach(link => {
  link.addEventListener('click', e => {
	e.preventDefault();
	const view = link.dataset.view;
	navLinks.forEach(l => l.classList.remove('active'));
	link.classList.add('active');
	viewPages.forEach(p => p.classList.remove('active-view'));
	const target = document.getElementById('view-' + view);
	if (target) target.classList.add('active-view');
	topbarTitle.textContent = viewTitles[view] || view;
  });
});

//   ACCOUNT MODAL  
const accountModal  = document.getElementById('accountModal');
const accountBtn    = document.getElementById('accountBtn');
const modalClose    = document.getElementById('modalClose');
const modalCancelBtn= document.getElementById('modalCancelBtn');
const modalSaveBtn  = document.getElementById('modalSaveBtn');
const toast         = document.getElementById('toast');

function openAccountModal()  { accountModal.classList.add('open');    document.body.style.overflow='hidden'; }
function closeAccountModal() { accountModal.classList.remove('open'); document.body.style.overflow=''; }

accountBtn.addEventListener('click', openAccountModal);
modalClose.addEventListener('click', closeAccountModal);
modalCancelBtn.addEventListener('click', closeAccountModal);
accountModal.addEventListener('click', e => { if (e.target === accountModal) closeAccountModal(); });

modalSaveBtn.addEventListener('click', () => {
  const firstName = document.getElementById('fieldFirstName').value.trim();
  const lastName  = document.getElementById('fieldLastName').value.trim();
  const moveGoal  = document.getElementById('fieldMoveGoal').value.trim();
  const stepGoal  = document.getElementById('fieldStepGoal').value.trim();
  const fullName  = [firstName, lastName].filter(Boolean).join(' ') || 'User';

  document.querySelector('.profile-name').textContent = fullName;
  document.querySelector('.profile-sub').textContent  = `Goal: ${moveGoal} KCAL`;
  document.getElementById('modalAvatarName').textContent = fullName;
  document.getElementById('modalAvatarSub').textContent  = `Goal: ${moveGoal} KCAL · Pro Member`;

  const newStepGoal = parseInt(stepGoal) || 10000;
  const fraction = Math.min(TOTAL_STEPS / newStepGoal, 1);
  const offset = 440 - fraction * 440;
  document.getElementById('mainRing').style.strokeDashoffset = offset;
  document.querySelector('.ring-center-pct').textContent = Math.round(fraction * 100) + '%';

  closeAccountModal();
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
});

//   PANEL SYSTEM  
const backdrop = document.getElementById('backdrop');
let openPanel = null;
// Store panel values
let LIVE_MOVE_PCT = Math.round((282 / 150) * 100); // default until onboarding sets it

function syncPanels() {
  //   Sync Steps Panel 
  const stepsVal = document.querySelector('.stat-val.c-steps');
  if (stepsVal) {
	const stepsPanelTotal = document.getElementById('stepsPanelTotal');
	if (stepsPanelTotal) stepsPanelTotal.textContent = stepsVal.textContent;
  }

  //   Sync Distance Panel  
  const distVal = document.querySelector('.stat-val.c-distance');
  if (distVal) {
	const distPanelTotal = document.querySelector('.panel-total-val.c-distance');
	if (distPanelTotal) {
	  const distNum = distVal.querySelector('.u') 
		? distVal.childNodes[0].textContent.trim() 
		: distVal.textContent.trim();
	  distPanelTotal.innerHTML = `${distNum}<span style="font-size:24px;letter-spacing:0"> KM</span>`;
	}
  }

  //   Sync Activity Panel  
  const moveStatVal = document.querySelector('.ring-stat-val.c-move');
  const ringStats   = document.querySelectorAll('.ring-stat');
  if (moveStatVal) {
	// Move KCAL 
	const moveKcalText = moveStatVal.childNodes[0].textContent.trim();
	const actMoveEl = document.getElementById('actPanelMoveKcal');
	if (actMoveEl) actMoveEl.textContent = moveKcalText;

	// Total KCAL 
	if (ringStats[1]) {
	  const totalValEl = ringStats[1].querySelector('.ring-stat-val');
	  const totalText  = totalValEl ? totalValEl.childNodes[0].textContent.trim() : '';
	  const actTotalEl = document.getElementById('actPanelTotalKcal');
	  const actBigEl   = document.getElementById('actPanelTotalBig');
	  if (actTotalEl) actTotalEl.textContent = totalText.replace(/,/g,'').replace(/\D/g,'') 
		? parseInt(totalText.replace(/,/g,'').replace(/\D/g,'')).toLocaleString() : totalText;
	  if (actBigEl) actBigEl.innerHTML = `${totalText}<span style="font-size:22px;letter-spacing:0"> KCAL</span>`;
	}

	// Goal %
	if (ringStats[2]) {
	  const goalValEl = ringStats[2].querySelector('.ring-stat-val');
	  const goalText  = goalValEl ? goalValEl.textContent.trim() : '';
	  const actGoalEl = document.getElementById('actPanelGoalPct');
	  if (actGoalEl) {
		actGoalEl.textContent = goalText;
		actGoalEl.style.color = goalValEl ? goalValEl.style.color || '#FF9F0A' : '#FF9F0A';
	  }
	}
  }
}

function openDetailPanel(id) {
  if (openPanel) openPanel.classList.remove('open');
  openPanel = document.getElementById(id);
  openPanel.classList.add('open');
  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
  syncPanels();
  setTimeout(() => triggerPanelAnims(id), 120);
}

function closeDetailPanel() {
  if (openPanel) openPanel.classList.remove('open');
  backdrop.classList.remove('open');
  openPanel = null;
  document.body.style.overflow = '';
}

document.getElementById('openActivity').addEventListener('click', () => openDetailPanel('panelActivity'));
document.getElementById('openDistance').addEventListener('click', () => openDetailPanel('panelDistance'));
backdrop.addEventListener('click', closeDetailPanel);
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeDetailPanel));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDetailPanel(); });

//   TABS  
document.querySelectorAll('.panel-tabs, .chart-tabs').forEach(row => {
  row.querySelectorAll('.ptab, .ctab').forEach(btn => {
	btn.addEventListener('click', () => {
	  row.querySelectorAll('.ptab, .ctab').forEach(b => b.classList.remove('active'));
	  btn.classList.add('active');
	});
  });
});

//   SMALL BARS (stat cards)  
function buildSmallBars(id, data, cls) {
  const c = document.getElementById(id);
  if (!c) return;
  c.querySelectorAll('.mb').forEach(b=>b.remove());
  const mx = Math.max(...data);
  data.forEach((v,i) => {
	const b = document.createElement('div');
	b.className = `mb ${cls}`;
	b.style.height = `${Math.max((v/mx)*100, 4)}%`;
	b.style.transitionDelay = `${.5 + i*.04}s`;
	c.appendChild(b);
  });
  requestAnimationFrame(() => setTimeout(() =>
	c.querySelectorAll('.mb').forEach(b => b.classList.add('animated')), 100));
}
buildSmallBars('distSmall',  distData,  'distance-clr');
buildSmallBars('walkSmall', walkData, 'walking-clr');
buildSmallBars('elevSmall', elevData, 'elev-clr');

// Empty week bars 

//   MAIN BIG CHART with TOOLTIPS  
(function() {
  const c = document.getElementById('mainBigChart');
  if (!c) return;
  const mx = Math.max(...stepsData);
  const labels  = c.querySelector('.y-labels');
  const tooltip = document.getElementById('barTooltip');
  const tooltipVal = document.getElementById('barTooltipVal');

  stepsData.forEach((v,i) => {
	const b = document.createElement('div');
	b.className = 'big-bar steps-clr';
	b.style.height = `${Math.max((v/mx)*100, 2)}%`;
	b.style.transitionDelay = `${.6 + i*.03}s`;
	b.style.cursor = 'crosshair';
	b.addEventListener('mouseenter', () => {
	  tooltipVal.textContent = v.toLocaleString() + ' steps';
	  tooltip.querySelector('.tip-label').textContent = stepTimeLabels[i] || `Hour ${i}`;
	  tooltip.classList.add('visible');
	});
	b.addEventListener('mousemove', e => {
	  tooltip.style.left = (e.clientX + 12) + 'px';
	  tooltip.style.top  = (e.clientY - 40) + 'px';
	});
	b.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
	c.insertBefore(b, labels);
  });
  requestAnimationFrame(() => setTimeout(() =>
	c.querySelectorAll('.big-bar').forEach(b=>b.classList.add('animated')), 150));
})();

//   ACTIVITY RING
setTimeout(() => {
  const defaultMovePct = Math.round((282 / 150) * 100); 
  const calFraction = Math.min(defaultMovePct / 100, 1);
  const offset = 440 - calFraction * 440;
  document.getElementById('mainRing').style.strokeDashoffset = offset;
  document.querySelector('.ring-center-pct').textContent = defaultMovePct + '%';
  document.getElementById('moveFill').style.width = '100%';
}, 350);

//   PANEL CHART BUILDER  
function buildPanelChart(id, data, cls) {
  const c = document.getElementById(id);
  if (!c) return;
  c.querySelectorAll('.pchart-bar').forEach(b=>b.remove());
  const mx = Math.max(...data);
  const labels = c.querySelector('.pchart-y');
  data.forEach((v,i) => {
	const b = document.createElement('div');
	b.className = `pchart-bar ${cls}`;
	b.style.height = `${Math.max((v/mx)*100, 2)}%`;
	b.style.transitionDelay = `${i*.028}s`;
	c.insertBefore(b, labels);
  });
  requestAnimationFrame(() => setTimeout(() =>
	c.querySelectorAll('.pchart-bar').forEach(b=>b.classList.add('animated')), 60));
}


//   PANEL ANIMATIONS  
function triggerPanelAnims(id) {
  if (id === 'panelSteps') {
	buildPanelChart('stepsPanelChart', stepsData, 'steps-clr');
  }
  if (id === 'panelDistance') {
	buildPanelChart('distancePanelChart', distData, 'distance-clr');
  }
  if (id === 'panelActivity') {
	buildPanelChart('activityPanelChart', calorieData, 'move-clr');

	// Animate panel ring 
	setTimeout(() => {
	  const panelRingEl = document.getElementById('panelRing');
	  if (panelRingEl) {
		const circ = 2 * Math.PI * 80;
		const calFraction = Math.min(LIVE_MOVE_PCT / 100, 1);
		panelRingEl.style.strokeDasharray  = circ;
		// Reset 
		panelRingEl.style.transition = 'none';
		panelRingEl.style.strokeDashoffset = circ;
		requestAnimationFrame(() => {
		  panelRingEl.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.34,1.56,.64,1)';
		  panelRingEl.style.strokeDashoffset = circ - calFraction * circ;
		});
	  }
	}, 150);
  }
}