export type TableAction =
  | 'rowAbove'
  | 'rowBelow'
  | 'colLeft'
  | 'colRight'
  | 'deleteRow'
  | 'deleteCol'
  | 'toggleHeader'
  | 'deleteTable';

export function buildTableHtml(rows: number, cols: number): string {
  const cells = '<td><br></td>'.repeat(cols);
  const body = `<tr>${cells}</tr>`.repeat(rows);
  return `<table class="cky-table"><tbody>${body}</tbody></table><p><br></p>`;
}

export function closestCell(node: Node | null, root: HTMLElement): HTMLTableCellElement | null {
  const el = node instanceof Element ? node : node?.parentElement;
  const cell = el?.closest('td, th') as HTMLTableCellElement | null;
  return cell && root.contains(cell) ? cell : null;
}

function newCell(like: HTMLTableCellElement): HTMLTableCellElement {
  const cell = document.createElement(like.tagName.toLowerCase() as 'td' | 'th');
  cell.innerHTML = '<br>';
  return cell;
}

function newRow(like: HTMLTableRowElement): HTMLTableRowElement {
  const row = document.createElement('tr');
  Array.from(like.cells).forEach(() => row.appendChild(newCell(document.createElement('td'))));
  return row;
}

// Returns the cell the caret should move to, or null when the table is gone.
export function applyTableAction(cell: HTMLTableCellElement, action: TableAction): HTMLTableCellElement | null {
  const row = cell.parentElement as HTMLTableRowElement;
  const table = cell.closest('table') as HTMLTableElement;
  const colIndex = cell.cellIndex;
  const rows = Array.from(table.rows);

  switch (action) {
    case 'rowAbove':
    case 'rowBelow': {
      const inserted = newRow(row);
      row.parentElement!.insertBefore(inserted, action === 'rowAbove' ? row : row.nextSibling);
      return inserted.cells[colIndex] ?? inserted.cells[0];
    }
    case 'colLeft':
    case 'colRight': {
      const offset = action === 'colLeft' ? 0 : 1;
      rows.forEach((r) => {
        const ref = r.cells[colIndex] ?? r.cells[r.cells.length - 1];
        r.insertBefore(newCell(ref), r.cells[colIndex + offset] ?? null);
      });
      return row.cells[colIndex + offset];
    }
    case 'deleteRow': {
      if (rows.length === 1) return removeTable(table);
      const next = (row.nextElementSibling ?? row.previousElementSibling) as HTMLTableRowElement | null;
      row.remove();
      return next?.cells[Math.min(colIndex, next.cells.length - 1)] ?? null;
    }
    case 'deleteCol': {
      if (row.cells.length === 1) return removeTable(table);
      rows.forEach((r) => r.cells[colIndex]?.remove());
      return row.cells[Math.min(colIndex, row.cells.length - 1)];
    }
    case 'toggleHeader':
      return toggleHeaderRow(table, colIndex);
    case 'deleteTable':
      return removeTable(table);
  }
}

function toggleHeaderRow(table: HTMLTableElement, colIndex: number): HTMLTableCellElement {
  const existing = table.tHead;
  if (existing) {
    const tbody = table.tBodies[0] ?? table.createTBody();
    Array.from(existing.rows).reverse().forEach((r) => {
      Array.from(r.cells).forEach((th) => th.replaceWith(retag(th, 'td')));
      tbody.insertBefore(r, tbody.firstChild);
    });
    existing.remove();
    return tbody.rows[0].cells[colIndex];
  }
  const first = table.rows[0];
  const thead = table.createTHead();
  thead.appendChild(first);
  Array.from(first.cells).forEach((td) => td.replaceWith(retag(td, 'th')));
  return first.cells[colIndex];
}

function retag(cell: HTMLTableCellElement, tag: 'td' | 'th'): HTMLTableCellElement {
  const next = document.createElement(tag);
  next.innerHTML = cell.innerHTML;
  if (cell.getAttribute('style')) next.setAttribute('style', cell.getAttribute('style')!);
  return next;
}

function removeTable(table: HTMLTableElement): null {
  table.remove();
  return null;
}

export function moveToAdjacentCell(cell: HTMLTableCellElement, backwards: boolean): HTMLTableCellElement | null {
  const table = cell.closest('table') as HTMLTableElement;
  const cells = Array.from(table.querySelectorAll('td, th')) as HTMLTableCellElement[];
  const index = cells.indexOf(cell);
  if (backwards) return cells[index - 1] ?? null;
  if (index < cells.length - 1) return cells[index + 1];
  const added = applyTableAction(cell, 'rowBelow');
  return (added?.parentElement as HTMLTableRowElement | null)?.cells[0] ?? null;
}
