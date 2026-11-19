import {
  PROFILE,
  PROJECTS_BY_DATE,
  PROJECT_BY_OBJECT,
  ATTRIBUTIONS,
} from '../projects.js';
import { STAGES } from '../config.js';

/**
 * Owns every piece of DOM that sits over the canvas.
 *
 * The old HUD put `#footer-project` and `#true-footer` both at
 * `position: fixed; bottom: 0`, so the hint line was drawn straight on top
 * of the project description. There was no z-index anywhere, panels were
 * toggled by writing inline `style` strings from three different places,
 * and `* { font-size: 1.5rem }` forced a size onto every element which the
 * rest of the stylesheet then fought.
 *
 * Here the overlay is one grid with named rows, panels are driven by a
 * single `openPanel` state, and nothing overlaps anything else.
 */
export class Hud {
  constructor(root) {
    this.root = root;
    this.openPanel = null;
    this.onViewChange = null;

    this.build();
    this.bind();
  }

  build() {
    this.root.innerHTML = `
      <header class="hud-nav">
        <button class="hud-brand" type="button" data-action="home">
          <span class="hud-brand-full">${PROFILE.name}</span>
          <span class="hud-brand-short">${PROFILE.shortName}</span>
        </button>
        <nav class="hud-links">
          <button type="button" data-panel="cv">CV</button>
          <button type="button" data-panel="contact">Contact</button>
        </nav>
      </header>

      <nav class="hud-rail" aria-label="Jump to project">
        ${STAGES.map((stage) => {
          const project = PROJECT_BY_OBJECT.get(stage.id);
          const title = project?.title ?? stage.id;
          const date = project?.dateText ? ` · ${project.dateText}` : '';
          return `
            <button class="rail-item" type="button" data-stage="${stage.id}" title="${title}">
              <span class="rail-label">${title}${date}</span>
              <span class="rail-dot"></span>
            </button>`;
        }).join('')}
      </nav>

      <section class="hud-detail" data-open="false" aria-live="polite">
        <button class="hud-detail-close" type="button" data-action="close-detail" aria-label="Close">&times;</button>
        <p class="hud-detail-year"></p>
        <h2 class="hud-detail-title"></h2>
        <p class="hud-detail-desc"></p>
        <ul class="hud-detail-tags"></ul>
        <div class="hud-detail-links">
          <a class="hud-chip" data-link="github" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a class="hud-chip" data-link="external" target="_blank" rel="noopener noreferrer">View</a>
        </div>
      </section>

      <p class="hud-hint">
        <span class="hud-hint-desktop">Scroll to drop objects &middot; drag to orbit &middot; click an object for details</span>
        <span class="hud-hint-mobile">Scroll to drop objects &middot; tap an object</span>
      </p>

      <div class="hud-scrim" data-action="close-panel"></div>

      <aside class="hud-panel" data-panel="cv">
        <button class="hud-panel-close" type="button" data-action="close-panel" aria-label="Close">&times;</button>
        <h2>Projects</h2>
        <a class="hud-cta" href="${PROFILE.cvUrl}" target="_blank" rel="noopener noreferrer">Download CV</a>
        ${
          PROFILE.cvUpdated
            ? `<p class="hud-cv-updated">Updated ${PROFILE.cvUpdated}</p>`
            : ''
        }
        <ul class="hud-project-list">
          ${PROJECTS_BY_DATE.map(
            (p) => `
            <li>
              <div class="hud-project-head">
                <h3>${p.title}</h3>
                ${p.dateText ? `<span class="hud-year">${p.dateText}</span>` : ''}
              </div>
              <p>${p.description}</p>
              <ul class="hud-tags">
                ${p.tags.map((t) => `<li>${t}</li>`).join('')}
              </ul>
            </li>`
          ).join('')}
        </ul>
        <h2>Attribution <small>(CC BY 4.0)</small></h2>
        <ul class="hud-attribution">
          ${ATTRIBUTIONS.map(
            (a) => `
            <li>
              <span>${a.title} — ${a.author}</span>
              <a href="${a.url}" target="_blank" rel="noopener noreferrer">link</a>
            </li>`
          ).join('')}
        </ul>
      </aside>

      <aside class="hud-panel" data-panel="contact">
        <button class="hud-panel-close" type="button" data-action="close-panel" aria-label="Close">&times;</button>
        <h2>Contact</h2>
        <p class="hud-tagline">${PROFILE.tagline}</p>
        <div class="hud-contact-links">
          <a href="${PROFILE.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="${PROFILE.github}" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="${PROFILE.cvUrl}" target="_blank" rel="noopener noreferrer">CV</a>
        </div>
      </aside>
    `;

    this.railItems = new Map(
      [...this.root.querySelectorAll('.rail-item')].map((el) => [
        el.dataset.stage,
        el,
      ])
    );
    this.detail = this.root.querySelector('.hud-detail');
    this.detailYear = this.root.querySelector('.hud-detail-year');
    this.detailTitle = this.root.querySelector('.hud-detail-title');
    this.detailDesc = this.root.querySelector('.hud-detail-desc');
    this.detailTags = this.root.querySelector('.hud-detail-tags');
    this.linkGithub = this.root.querySelector('[data-link="github"]');
    this.linkExternal = this.root.querySelector('[data-link="external"]');
    this.scrim = this.root.querySelector('.hud-scrim');
    this.panels = new Map(
      [...this.root.querySelectorAll('.hud-panel')].map((el) => [
        el.dataset.panel,
        el,
      ])
    );
  }

  bind() {
    this.root.addEventListener('click', (event) => {
      const railItem = event.target.closest('[data-stage]');
      if (railItem) {
        this.jumpToStage(railItem.dataset.stage);
        return;
      }

      const panelButton = event.target.closest('[data-panel]');
      if (panelButton && panelButton.tagName === 'BUTTON') {
        this.togglePanel(panelButton.dataset.panel);
        return;
      }

      const action = event.target.closest('[data-action]')?.dataset.action;
      if (action === 'home') {
        this.closePanel();
        this.hideDetail();
        this.onViewChange?.('home');
      } else if (action === 'close-panel') {
        this.closePanel();
      } else if (action === 'close-detail') {
        this.hideDetail();
      }
    });

    window.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (this.openPanel) this.closePanel();
      else this.hideDetail();
    });
  }

  /**
   * Scrolls to just past a stage's spawn threshold, so the object it
   * represents is in the scene when you arrive.
   *
   * This is what keeps the rail from merely duplicating the 3D track: the
   * track shows where you are, the rail lets you go somewhere.
   */
  jumpToStage(id) {
    const stage = STAGES.find((s) => s.id === id);
    if (!stage) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: max * Math.min(stage.at + 0.04, 1),
      behavior: 'smooth',
    });
    this.closePanel();
  }

  /**
   * @param {Set<string>} active stage ids currently spawned
   * @param {number} progress 0..1
   */
  updateRail(active, progress) {
    for (const [id, el] of this.railItems) {
      const stage = STAGES.find((s) => s.id === id);
      const isActive = active.has(id);
      el.classList.toggle('is-active', isActive);
      // The stage you are nearest, used for the brighter "current" dot.
      const isCurrent =
        isActive && progress < Math.min(stage.at + 0.17, 1.01);
      el.classList.toggle('is-current', isCurrent);
      el.setAttribute('aria-current', isCurrent ? 'true' : 'false');
    }
  }

  togglePanel(name) {
    if (this.openPanel === name) {
      this.closePanel();
      return;
    }
    // Only ever one panel open, so two can never stack.
    this.panels.forEach((el, key) =>
      el.classList.toggle('is-open', key === name)
    );
    this.scrim.classList.add('is-open');
    this.openPanel = name;
    this.hideDetail();
    this.onViewChange?.(name);
  }

  closePanel() {
    if (!this.openPanel) return;
    this.panels.forEach((el) => el.classList.remove('is-open'));
    this.scrim.classList.remove('is-open');
    this.openPanel = null;
    this.onViewChange?.('home');
  }

  /** @param {import('../projects.js').PROJECTS[number]} project */
  showDetail(project) {
    this.detailYear.textContent = project.dateText ?? '';
    this.detailYear.hidden = !project.dateText;
    this.detailTitle.textContent = project.title;
    this.detailDesc.textContent = project.description;
    this.detailTags.innerHTML = project.tags
      .map((t) => `<li>${t}</li>`)
      .join('');

    this.linkGithub.hidden = !project.github;
    if (project.github) this.linkGithub.href = project.github;

    this.linkExternal.hidden = !project.external;
    if (project.external) this.linkExternal.href = project.external;

    this.detail.dataset.open = 'true';
  }

  hideDetail() {
    this.detail.dataset.open = 'false';
  }
}
