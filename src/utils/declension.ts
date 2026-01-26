export function declension(number: number, variant: string[], type: number) {
  // ["час", "часа", "часов"]
  if (type === 1) {
    if (number % 100 >= 11 && number % 100 <= 14) {
      return variant[2];
    } else if (number % 10 === 1) {
      return variant[0];
    } else if (number % 10 >= 2 && number % 10 <= 4) {
      return variant[1];
    } else {
      return variant[2];
    }
  }
  // ["минут", "минуту", "минуты"]
  if (type === 2) {
    if (number % 100 >= 11 && number % 100 <= 14) {
      return variant[0];
    } else if (number % 10 === 1) {
      return variant[1];
    } else if (number % 10 >= 2 && number % 10 <= 4) {
      return variant[2];
    } else {
      return variant[0];
    }
  }
  return "";
}
