/**
 * Bottom tab navigation. Shared across views for consistency.
 */

import { ROUTES } from '../constants.js';
import { navigate } from '../router.js';
import { el, icon } from '../ui/dom.js';

const TABS = [
  { route: ROUTES.DASHBOARD, label: 'Hôm nay',  ic: 'home' },
  { route: ROUTES.PLAN,      label: 'Lịch tuần', ic: 'calendar' },
  { route: ROUTES.PROGRESS,  label: 'Tiến trình', ic: 'chart' },
  { route: ROUTES.SETTINGS,  label: 'Cài đặt',   ic: 'settings' },
];

/** @param {string} active — current route */
export function navBar(active) {
  return el('nav.tabbar', {},
    TABS.map((t) => el(
      `button.tab${t.route === active ? '.active' : ''}`,
      { type: 'button', onClick: () => navigate(t.route) },
      [icon(t.ic, 22), el('span.tab-label', {}, [t.label])],
    )),
  );
}
