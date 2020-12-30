/**
 * normalizeUuid takes a uuid with or without dashes and returns a uuid WITH dashes.
 * @param uuid - a uuid with or without dashes
 */
function addDashesToUuid(uuid: string) {
  return `${uuid.substr(0, 8)}-${uuid.substr(8, 4)}-${uuid.substr(
    12,
    4
  )}-${uuid.substr(16, 4)}-${uuid.substr(20)}`;
}

export const normalizeUuid = (uuid: string): string =>
  uuid.includes("-") ? uuid : addDashesToUuid(uuid);

export const compareUuids = (a: string, b: string): boolean =>
  normalizeUuid(a) === normalizeUuid(b);
