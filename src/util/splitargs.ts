export function splitargs(content: string): Array<string> {
  const split: string[][] | string[] = content
    .split(" ")
    .map((arg) => arg.split('"'));
  let inQuotes = false;
  let wordStorage: Array<string> = [];
  const escapedStorage = [];

  // Get only quoted sections

  for (let i = 0; i < split.length; i++) {
    if (split[i].length > 1) {
      if (inQuotes) {
        wordStorage.push(split[i][0]);
        inQuotes = false;
        escapedStorage.push(wordStorage.join(" "));
        wordStorage = [];
      } else {
        inQuotes = true;
      }
    }
    if (inQuotes) {
      if (split[i].length > 1) {
        wordStorage.push(split[i][1]);
      } else {
        wordStorage.push(split[i][0]);
      }
    }
  }

  // Repair message

  const newSplit: Array<string> | string = [];
  let escaped = false;
  let onSplitNum = 0;
  for (let i = 0; i < split.length; i++) {
    if (!escaped) {
      if (split[i].length > 1) {
        newSplit.push(escapedStorage[onSplitNum]);
        onSplitNum++;
        escaped = true;
      } else {
        newSplit.push(split[i][0]);
      }
    } else {
      if (split[i].length > 1) {
        escaped = false;
      }
    }
  }
  return newSplit;
}
