/*
 * ARA access preview only.
 * This file selects named demo profiles and reveals synthetic sample content.
 * It must never validate credentials, create a client-side session, or gate real data.
 * See the private Project ARA authentication plan before connecting a production provider.
 */
(() => {
  'use strict';

  const root = document.querySelector('[data-ara-access]');
  if (!root) return;

  const config = Object.freeze({
    mode: root.dataset.authMode || 'demo',
    authStartUrl: root.dataset.authStartUrl || '',
    sessionStatusUrl: root.dataset.sessionStatusUrl || ''
  });

  const profileButtons = Array.from(root.querySelectorAll('[data-profile]'));
  const previewButton = root.querySelector('[data-preview]');
  const selectionStatus = root.querySelector('[data-selection-status]');
  const workspace = root.querySelector('[data-workspace]');
  const workspaceName = root.querySelector('[data-workspace-name]');
  const year = document.querySelector('[data-demo-year]');
  let selectedProfile = '';

  if (year) year.textContent = String(new Date().getFullYear());

  const setProfile = (button) => {
    selectedProfile = button.dataset.profile || '';
    profileButtons.forEach((candidate) => {
      candidate.setAttribute('aria-pressed', String(candidate === button));
    });
    previewButton.disabled = !selectedProfile;
    previewButton.textContent = selectedProfile ? `Preview as ${selectedProfile}` : 'Choose a demo profile';
    selectionStatus.textContent = selectedProfile
      ? `${selectedProfile} selected for a sample preview. No identity has been checked.`
      : 'No profile selected. No identity has been checked.';
  };

  profileButtons.forEach((button) => {
    button.addEventListener('click', () => setProfile(button));
  });

  previewButton.addEventListener('click', () => {
    if (!selectedProfile || config.mode !== 'demo') return;
    workspaceName.textContent = selectedProfile;
    workspace.hidden = false;
    selectionStatus.textContent = `Showing synthetic sample content for ${selectedProfile}. No access was granted and no identity was verified.`;
    workspace.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start'
    });
  });
})();
