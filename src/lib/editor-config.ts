export interface Option<T = string> {
  label: string;
  value: T;
}

export const HEADINGS: Option[] = [
  { label: 'Paragraph', value: 'p' },
  { label: 'Heading 1', value: 'h1' },
  { label: 'Heading 2', value: 'h2' },
  { label: 'Heading 3', value: 'h3' },
  { label: 'Heading 4', value: 'h4' },
  { label: 'Heading 5', value: 'h5' },
  { label: 'Heading 6', value: 'h6' },
];

export interface StyleOption extends Option {
  kind: 'inline' | 'block';
}

export const STYLES: StyleOption[] = [
  { label: 'Marker', value: 'cky-marker', kind: 'inline' },
  { label: 'Spoiler', value: 'cky-spoiler', kind: 'inline' },
  { label: 'Code', value: 'cky-inline-code', kind: 'inline' },
  { label: 'Big', value: 'cky-big', kind: 'inline' },
  { label: 'Small', value: 'cky-small', kind: 'inline' },
  { label: 'Info box', value: 'cky-box-info', kind: 'block' },
  { label: 'Warning box', value: 'cky-box-warning', kind: 'block' },
  { label: 'Side quote', value: 'cky-side-quote', kind: 'block' },
];

export const FONT_FAMILIES: Option[] = [
  { label: 'Default', value: '' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Trebuchet MS', value: "'Trebuchet MS', Helvetica, sans-serif" },
  { label: 'Courier New', value: "'Courier New', Courier, monospace" },
  { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
];

export const FONT_SIZES: Option[] = [
  { label: 'Tiny', value: '10px' },
  { label: 'Small', value: '13px' },
  { label: 'Default', value: '' },
  { label: 'Big', value: '19px' },
  { label: 'Huge', value: '24px' },
  { label: 'Giant', value: '32px' },
];

export const LINE_HEIGHTS: Option[] = [
  { label: 'Default', value: '' },
  { label: '1.0', value: '1' },
  { label: '1.15', value: '1.15' },
  { label: '1.5', value: '1.5' },
  { label: '2.0', value: '2' },
  { label: '2.5', value: '2.5' },
];

export const COLORS: string[] = [
  '#000000', '#4d4d4d', '#999999', '#e6e6e6', '#ffffff',
  '#e64c4c', '#e6994c', '#e6e64c', '#99e64c', '#4ce64c',
  '#4ce699', '#4ce6e6', '#4c99e6', '#4c4ce6', '#994ce6',
];

export const BULLET_STYLES: Option[] = [
  { label: 'Disc', value: 'disc' },
  { label: 'Circle', value: 'circle' },
  { label: 'Square', value: 'square' },
];

export const NUMBER_STYLES: Option[] = [
  { label: '1, 2, 3', value: 'decimal' },
  { label: '01, 02, 03', value: 'decimal-leading-zero' },
  { label: 'a, b, c', value: 'lower-alpha' },
  { label: 'A, B, C', value: 'upper-alpha' },
  { label: 'i, ii, iii', value: 'lower-roman' },
  { label: 'I, II, III', value: 'upper-roman' },
];

export const LAYOUTS: Option[] = [
  { label: 'Two columns', value: 'cky-cols-2' },
  { label: 'Three columns', value: 'cky-cols-3' },
  { label: 'Sidebar left', value: 'cky-cols-sidebar-left' },
  { label: 'Sidebar right', value: 'cky-cols-sidebar-right' },
];

export const TEMPLATES: Option[] = [
  {
    label: 'Meeting notes',
    value:
      '<h2>Meeting notes</h2><p><strong>Date:</strong> </p><p><strong>Attendees:</strong> </p>' +
      '<h3>Agenda</h3><ol><li></li></ol><h3>Action items</h3><ul class="cky-todo"><li></li></ul>',
  },
  {
    label: 'Formal letter',
    value:
      '<p>[Your name]<br>[Address]</p><p>[Date]</p><p>Dear [Recipient],</p><p></p>' +
      '<p>Sincerely,<br>[Your name]</p>',
  },
  {
    label: 'Job description',
    value:
      '<h2>[Job title]</h2><p><strong>Location:</strong> </p><h3>Responsibilities</h3><ul><li></li></ul>' +
      '<h3>Requirements</h3><ul><li></li></ul><h3>Benefits</h3><ul><li></li></ul>',
  },
  {
    label: 'Pricing table',
    value:
      '<table class="cky-table"><thead><tr><th>Plan</th><th>Price</th><th>Features</th></tr></thead>' +
      '<tbody><tr><td>Basic</td><td></td><td></td></tr><tr><td>Pro</td><td></td><td></td></tr></tbody></table><p></p>',
  },
];

export const EMOJIS: string[] = [
  '😀', '😁', '😂', '🤣', '😊', '😍', '😘', '😎', '🤔', '😐',
  '😴', '😢', '😭', '😡', '🥳', '🤯', '👍', '👎', '👏', '🙏',
  '💪', '👋', '🤝', '✌️', '❤️', '💔', '🔥', '⭐', '✨', '🎉',
  '✅', '❌', '⚠️', '💡', '📌', '📎', '📅', '📈', '🚀', '💼',
];

export const SPECIAL_CHARS: string[] = [
  '©', '®', '™', '§', '¶', '†', '‡', '•', '…', '‰',
  '€', '£', '¥', '₹', '¢', '$', '°', '±', '×', '÷',
  '≠', '≈', '≤', '≥', '∞', '√', '∑', 'π', 'µ', 'Ω',
  '←', '→', '↑', '↓', '↔', '«', '»', '“', '”', '—',
];

export const TABLE_GRID_SIZE = 10;
