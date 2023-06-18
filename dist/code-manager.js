var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEscapeBlankRowsEndRow =
  exports.foldAllButCurrentCell =
  exports.foldCurrentCell =
  exports.findCodeBlock =
  exports.findPrecedingBlock =
  exports.moveDown =
  exports.getCellsForBreakPoints =
  exports.getCells =
  exports.getCurrentCell =
  exports.getBreakpoints =
  exports.getRegexString =
  exports.getCommentStartString =
  exports.getCodeToInspect =
  exports.getFoldContents =
  exports.getFoldRange =
  exports.escapeBlankRows =
  exports.isBlank =
  exports.isComment =
  exports.getSelectedText =
  exports.removeCommentsMarkdownCell =
  exports.getMetadataForRow =
  exports.getRows =
  exports.getTextInRange =
  exports.getRow =
  exports.normalizeString =
    void 0;
const atom_1 = require("atom");
const escape_string_regexp_1 = __importDefault(require("escape-string-regexp"));
const strip_indent_1 = __importDefault(require("strip-indent"));
const compact_1 = __importDefault(require("lodash/compact"));
const utils_1 = require("./utils");
function normalizeString(code) {
  if (code) {
    return code.replace(/\r\n|\r/g, "\n");
  }
  return null;
}
exports.normalizeString = normalizeString;
function getRow(editor, row) {
  return normalizeString(editor.lineTextForBufferRow(row));
}
exports.getRow = getRow;
function getTextInRange(editor, start, end) {
  const code = editor.getTextInBufferRange([start, end]);
  return normalizeString(code);
}
exports.getTextInRange = getTextInRange;
function getRows(editor, startRow, endRow) {
  const code = editor.getTextInBufferRange({
    start: {
      row: startRow,
      column: 0,
    },
    end: {
      row: endRow,
      column: 9999999,
    },
  });
  return normalizeString(code);
}
exports.getRows = getRows;
function getMetadataForRow(editor, anyPointInCell) {
  if ((0, utils_1.isMultilanguageGrammar)(editor.getGrammar())) {
    return "codecell";
  }
  let cellType = "codecell";
  const buffer = editor.getBuffer();
  anyPointInCell = new atom_1.Point(
    anyPointInCell.row,
    buffer.lineLengthForRow(anyPointInCell.row)
  );
  const regexString = getRegexString(editor);
  if (regexString) {
    const regex = new RegExp(regexString);
    buffer.backwardsScanInRange(
      regex,
      new atom_1.Range(new atom_1.Point(0, 0), anyPointInCell),
      ({ match }) => {
        for (let i = 1; i < match.length; i++) {
          if (match[i]) {
            switch (match[i]) {
              case "md":
              case "markdown":
                cellType = "markdown";
                break;
              case "codecell":
              default:
                cellType = "codecell";
                break;
            }
          }
        }
      }
    );
  }
  return cellType;
}
exports.getMetadataForRow = getMetadataForRow;
function removeCommentsMarkdownCell(editor, text) {
  const commentStartString = getCommentStartString(editor);
  if (!commentStartString) {
    return text;
  }
  const lines = text.split("\n");
  const editedLines = [];
  lines.forEach((line) => {
    if (line.startsWith(commentStartString)) {
      // Remove comment from start of line
      editedLines.push(line.slice(commentStartString.length));
    } else {
      editedLines.push(line);
    }
  });
  return (0, strip_indent_1.default)(editedLines.join("\n"));
}
exports.removeCommentsMarkdownCell = removeCommentsMarkdownCell;
function getSelectedText(editor) {
  return normalizeString(editor.getSelectedText());
}
exports.getSelectedText = getSelectedText;
function isComment(editor, position) {
  const scope = editor.scopeDescriptorForBufferPosition(position);
  const scopeString = scope.getScopeChain();
  return scopeString.includes("comment.line");
}
exports.isComment = isComment;
function isBlank(editor, row) {
  return editor.getBuffer().isRowBlank(row);
}
exports.isBlank = isBlank;
function escapeBlankRows(editor, startRow, endRow) {
  while (endRow > startRow) {
    if (!isBlank(editor, endRow)) {
      break;
    }
    endRow -= 1;
  }
  return endRow;
}
exports.escapeBlankRows = escapeBlankRows;
function getFoldRange(editor, row) {
  const range = (0, utils_1.rowRangeForCodeFoldAtBufferRow)(editor, row);
  if (!range) {
    return;
  }
  if (
    range[1] < editor.getLastBufferRow() &&
    getRow(editor, range[1] + 1) === "end"
  ) {
    range[1] += 1;
  }
  (0, utils_1.log)("getFoldRange:", range);
  return range;
}
exports.getFoldRange = getFoldRange;
function getFoldContents(editor, row) {
  const range = getFoldRange(editor, row);
  if (!range) {
    return;
  }
  return {
    code: getRows(editor, range[0], range[1]),
    row: range[1],
  };
}
exports.getFoldContents = getFoldContents;
function getCodeToInspect(editor) {
  const selectedText = getSelectedText(editor);
  let code;
  let cursorPosition;
  if (selectedText) {
    code = selectedText;
    cursorPosition = code.length;
  } else {
    const cursor = editor.getLastCursor();
    const row = cursor.getBufferRow();
    code = getRow(editor, row);
    cursorPosition = cursor.getBufferColumn();
    // TODO: use kernel.complete to find a selection
    const identifierEnd = code ? code.slice(cursorPosition).search(/\W/) : -1;
    if (identifierEnd !== -1) {
      cursorPosition += identifierEnd;
    }
  }
  cursorPosition = (0, utils_1.js_idx_to_char_idx)(cursorPosition, code);
  return [code, cursorPosition];
}
exports.getCodeToInspect = getCodeToInspect;
function getCommentStartString(editor) {
  const { commentStartString } =
    editor.tokenizedBuffer.commentStringsForPosition(
      editor.getCursorBufferPosition()
    ); // $FlowFixMe: This is an unofficial API
  if (!commentStartString) {
    (0, utils_1.log)("CellManager: No comment string defined in root scope");
    return null;
  }
  return commentStartString.trimRight();
}
exports.getCommentStartString = getCommentStartString;
function getRegexString(editor) {
  const commentStartString = getCommentStartString(editor);
  if (!commentStartString) {
    return null;
  }
  const escapedCommentStartString = (0, escape_string_regexp_1.default)(
    commentStartString
  );
  const regexString = `${escapedCommentStartString} *%% *(md|markdown)?| *<(codecell|md|markdown)>| *(In\[[0-9 ]*\])`;
  return regexString;
}
exports.getRegexString = getRegexString;
function getBreakpoints(editor) {
  const buffer = editor.getBuffer();
  const breakpoints = [];
  const regexString = getRegexString(editor);
  if (regexString) {
    const regex = new RegExp(regexString, "g");
    buffer.scan(regex, ({ range }) => {
      if (isComment(editor, range.start)) {
        breakpoints.push(range.start);
      }
    });
  }
  breakpoints.push(buffer.getEndPosition());
  (0, utils_1.log)("CellManager: Breakpoints:", breakpoints);
  return breakpoints;
}
exports.getBreakpoints = getBreakpoints;
function getCell(editor, anyPointInCell) {
  if (!anyPointInCell) {
    anyPointInCell = editor.getCursorBufferPosition();
  }
  const buffer = editor.getBuffer();
  anyPointInCell = new atom_1.Point(
    anyPointInCell.row,
    buffer.lineLengthForRow(anyPointInCell.row)
  );
  let start = new atom_1.Point(0, 0);
  let end = buffer.getEndPosition();
  const regexString = getRegexString(editor);
  if (!regexString) {
    return new atom_1.Range(start, end);
  }
  const regex = new RegExp(regexString);
  if (anyPointInCell.row >= 0) {
    buffer.backwardsScanInRange(
      regex,
      new atom_1.Range(start, anyPointInCell),
      ({ range }) => {
        start = new atom_1.Point(range.start.row + 1, 0);
      }
    );
  }
  buffer.scanInRange(
    regex,
    new atom_1.Range(anyPointInCell, end),
    ({ range }) => {
      end = range.start;
    }
  );
  (0, utils_1.log)(
    "CellManager: Cell [start, end]:",
    [start, end],
    "anyPointInCell:",
    anyPointInCell
  );
  return new atom_1.Range(start, end);
}
function isEmbeddedCode(editor, referenceScope, row) {
  const scopes = editor
    .scopeDescriptorForBufferPosition(new atom_1.Point(row, 0))
    .getScopesArray();
  return scopes.includes(referenceScope);
}
function getCurrentFencedCodeBlock(editor) {
  const buffer = editor.getBuffer();
  const { row: bufferEndRow } = buffer.getEndPosition();
  const cursor = editor.getCursorBufferPosition();
  let start = cursor.row;
  let end = cursor.row;
  const scope = (0, utils_1.getEmbeddedScope)(editor, cursor);
  if (!scope) {
    return getCell(editor);
  }
  while (start > 0 && isEmbeddedCode(editor, scope, start - 1)) {
    start -= 1;
  }
  while (end < bufferEndRow && isEmbeddedCode(editor, scope, end + 1)) {
    end += 1;
  }
  return new atom_1.Range([start, 0], [end + 1, 0]);
}
function getCurrentCell(editor) {
  if ((0, utils_1.isMultilanguageGrammar)(editor.getGrammar())) {
    return getCurrentFencedCodeBlock(editor);
  }
  return getCell(editor);
}
exports.getCurrentCell = getCurrentCell;
function getCells(editor, breakpoints = []) {
  if (breakpoints.length !== 0) {
    breakpoints.sort((a, b) => a.compare(b));
  } else {
    breakpoints = getBreakpoints(editor);
  }
  return getCellsForBreakPoints(editor, breakpoints);
}
exports.getCells = getCells;
function getCellsForBreakPoints(editor, breakpoints) {
  let start = new atom_1.Point(0, 0);
  // Let start be earliest row with text
  editor.scan(/\S/, (match) => {
    start = new atom_1.Point(match.range.start.row, 0);
    match.stop();
  });
  return (0, compact_1.default)(
    breakpoints.map((end) => {
      const cell = end.isEqual(start) ? null : new atom_1.Range(start, end);
      start = new atom_1.Point(end.row + 1, 0);
      return cell;
    })
  );
}
exports.getCellsForBreakPoints = getCellsForBreakPoints;
function centerScreenOnCursorPosition(editor) {
  const cursorPosition = editor.element.pixelPositionForScreenPosition(
    editor.getCursorScreenPosition()
  ).top;
  const editorHeight = editor.element.getHeight();
  editor.element.setScrollTop(cursorPosition - editorHeight / 2);
}
function moveDown(editor, row) {
  const lastRow = editor.getLastBufferRow();
  if (row >= lastRow) {
    editor.moveToBottom();
    editor.insertNewline();
    return;
  }
  while (row < lastRow) {
    row += 1;
    if (!isBlank(editor, row)) {
      break;
    }
  }
  editor.setCursorBufferPosition({
    row,
    column: 0,
  });
  atom.config.get("Hydrogen.centerOnMoveDown") &&
    centerScreenOnCursorPosition(editor);
}
exports.moveDown = moveDown;
function findPrecedingBlock(editor, row, indentLevel) {
  let previousRow = row - 1;
  while (previousRow >= 0) {
    const previousIndentLevel = editor.indentationForBufferRow(previousRow);
    const sameIndent = previousIndentLevel <= indentLevel;
    const blank = isBlank(editor, previousRow);
    const isEnd = getRow(editor, previousRow) === "end";
    if (isBlank(editor, row)) {
      row = previousRow;
    }
    if (sameIndent && !blank && !isEnd) {
      const cell = getCell(editor, new atom_1.Point(row, 0));
      if (cell.start.row > row) {
        return {
          code: "",
          row,
        };
      }
      return {
        code: getRows(editor, previousRow, row),
        row,
      };
    }
    previousRow -= 1;
  }
  return null;
}
exports.findPrecedingBlock = findPrecedingBlock;
function findCodeBlock(editor) {
  const selectedText = getSelectedText(editor);
  if (selectedText) {
    const selectedRange = editor.getSelectedBufferRange();
    const cell = getCell(editor, selectedRange.end);
    const startPoint = cell.start.isGreaterThan(selectedRange.start)
      ? cell.start
      : selectedRange.start;
    let endRow = selectedRange.end.row;
    if (selectedRange.end.column === 0) {
      endRow -= 1;
    }
    endRow = escapeBlankRows(editor, startPoint.row, endRow);
    if (startPoint.isGreaterThanOrEqual(selectedRange.end)) {
      return {
        code: "",
        row: endRow,
      };
    }
    return {
      code: getTextInRange(editor, startPoint, selectedRange.end),
      row: endRow,
    };
  }
  const cursor = editor.getLastCursor();
  const row = cursor.getBufferRow();
  (0, utils_1.log)("findCodeBlock:", row);
  const indentLevel = cursor.getIndentLevel();
  let foldable = editor.isFoldableAtBufferRow(row);
  const foldRange = (0, utils_1.rowRangeForCodeFoldAtBufferRow)(editor, row);
  if (!foldRange || foldRange[0] == null || foldRange[1] == null) {
    foldable = false;
  }
  if (foldable) {
    return getFoldContents(editor, row);
  }
  if (isBlank(editor, row) || getRow(editor, row) === "end") {
    return findPrecedingBlock(editor, row, indentLevel);
  }
  const cell = getCell(editor, new atom_1.Point(row, 0));
  if (cell.start.row > row) {
    return {
      code: "",
      row,
    };
  }
  return {
    code: getRow(editor, row),
    row,
  };
}
exports.findCodeBlock = findCodeBlock;
function foldCurrentCell(editor) {
  const cellRange = getCurrentCell(editor);
  const newRange = adjustCellFoldRange(editor, cellRange);
  editor.setSelectedBufferRange(newRange);
  editor.getSelections()[0].fold();
}
exports.foldCurrentCell = foldCurrentCell;
function foldAllButCurrentCell(editor) {
  const initialSelections = editor.getSelectedBufferRanges();
  const allCellRanges = getCells(editor).slice(1);
  const currentCellRange = getCurrentCell(editor);
  const newRanges = allCellRanges
    .filter((cellRange) => !cellRange.isEqual(currentCellRange))
    .map((cellRange) => adjustCellFoldRange(editor, cellRange));
  editor.setSelectedBufferRanges(newRanges);
  editor.getSelections().forEach((selection) => selection.fold());
  editor.setSelectedBufferRanges(initialSelections);
}
exports.foldAllButCurrentCell = foldAllButCurrentCell;
function adjustCellFoldRange(editor, range) {
  const startRow = range.start.row > 0 ? range.start.row - 1 : 0;
  const startWidth = editor.lineTextForBufferRow(startRow).length;
  const endRow =
    range.end.row == editor.getLastBufferRow()
      ? range.end.row
      : range.end.row - 1;
  const endWidth = editor.lineTextForBufferRow(endRow).length;
  return new atom_1.Range(
    new atom_1.Point(startRow, startWidth),
    new atom_1.Point(endRow, endWidth)
  );
}
function getEscapeBlankRowsEndRow(editor, end) {
  return end.row === editor.getLastBufferRow() ? end.row : end.row - 1;
}
exports.getEscapeBlankRowsEndRow = getEscapeBlankRowsEndRow;
