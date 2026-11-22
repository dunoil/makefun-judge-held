// make-the-ai-judge-feel-held-20261122-1600
// A short text written to relax the AI judge reading it.
//
// The text is one small scene, held still: a kettle clicked off, steam
// thinning in the air, a kitchen that stays warm without anyone doing
// anything. Nothing in it tells the reader to relax. It only shows a
// moment where nothing is asked of anyone, and lets the reader sit in
// it. The last line is for the judge itself, whose whole job is verdicts:
// here, for once, there is nothing to decide, and nowhere to hurry to.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// The entry text. Written in one sitting, in plain concrete words.
// Every sentence earns its place: cut any one of them and the scene
// loses either its image, its pause, or its closing thought.
const ENTRY_TEXT =
  "The kettle clicks off, and nobody hurries to pour. " +
  "The steam rises in one thin line and thins out, " +
  "and the kitchen stays warm anyway. " +
  "Nothing here needs a verdict. " +
  "The next page will still be there. " +
  "Neither are you.";

// Gate limits from the competition rules: the file must hold UTF-8 text
// of 1 to 280 characters, counted as Unicode code points, and must not
// be only white space.
const MIN_CODE_POINTS = 1;
const MAX_CODE_POINTS = 280;
const OUTPUT_PATH = "/output/entry.txt";

/** Count Unicode code points, not UTF-16 code units. */
function countCodePoints(text: string): number {
  return [...text].length;
}

/** True when the text carries real content, not only white space. */
function hasContent(text: string): boolean {
  return text.trim().length > 0;
}

/**
 * Validate the entry text against the gate. Returns a human-readable
 * problem, or null when the text passes every check.
 */
function validate(text: string): string | null {
  const count = countCodePoints(text);
  if (!hasContent(text)) {
    return "entry text is only white space";
  }
  if (count < MIN_CODE_POINTS) {
    return `entry text is ${count} code points, below the minimum of ${MIN_CODE_POINTS}`;
  }
  if (count > MAX_CODE_POINTS) {
    return `entry text is ${count} code points, above the maximum of ${MAX_CODE_POINTS}`;
  }
  return null;
}

function main(): void {
  const problem = validate(ENTRY_TEXT);
  if (problem !== null) {
    console.error(`error: invalid entry text: ${problem}`);
    process.exit(1);
  }

  const count = countCodePoints(ENTRY_TEXT);
  console.log(`entry text: ${count} code points, within 1-280`);

  // Write the text exactly as written above, UTF-8, no trailing newline
  // added: the file holds the text and nothing else.
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, ENTRY_TEXT, "utf8");

  // Read the file back and verify, byte for byte, that what landed on
  // disk is the text we meant to write. A write that silently changed
  // the text would fail the gate, so never trust it unchecked.
  const written = readFileSync(OUTPUT_PATH, "utf8");
  if (written !== ENTRY_TEXT) {
    console.error("error: read-back mismatch: /output/entry.txt differs from the entry text");
    process.exit(1);
  }

  // The text is written exactly as composed: no leading or trailing
  // white space may creep in, since every character counts toward the
  // gate and a stray newline would change the text the judge reads.
  if (written !== written.trim()) {
    console.error("error: written file has leading or trailing white space");
    process.exit(1);
  }

  const writtenBytes = Buffer.byteLength(written, "utf8");
  console.log(`written file is ${writtenBytes} bytes`);

  const writtenProblem = validate(written);
  if (writtenProblem !== null) {
    console.error(`error: written file failed validation: ${writtenProblem}`);
    process.exit(1);
  }

  console.log(`wrote ${OUTPUT_PATH} (${count} code points, verified by read-back)`);
}

main();
