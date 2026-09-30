/** Assigned area codes only: form validators reject numbers from unassigned ones. */
const US_AREA_CODES = (
  '202 206 212 213 214 215 216 303 305 310 312 313 314 317 404 407 408 412 415 469 ' +
  '480 502 503 504 512 513 602 612 614 615 617 619 646 702 703 704 713 718 720 727 ' +
  '773 801 813 816 818 832 904 916 917 919'
).split(' ')

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** Random US number in the `+1 555 000 0000` layout. */
export function randomUsPhone(): string {
  const area = US_AREA_CODES[randomInt(0, US_AREA_CODES.length - 1)]

  // An exchange starts with 2–9 and is never N11 (service codes) or 555 (reserved for fiction).
  let exchange: number
  do {
    exchange = randomInt(200, 999)
  } while (exchange % 100 === 11 || exchange === 555)

  const line = String(randomInt(0, 9999)).padStart(4, '0')

  return `+1 ${area} ${exchange} ${line}`
}
